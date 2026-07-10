import { resolveDiaryImageUrl } from '@module/utils/diaryImageUrl';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { DiaryImageItem } from '../utils/diaryFormHelpers';
import { revokeObjectUrlIfNeeded } from '../utils/diaryFormHelpers';

// 일지 이미지 최대 등록 장수. DiaryCreateThumbnailSection 의
// ThumbnailPicker max 와 일치시킨다.
export const MAX_DIARY_IMAGES = 5;

export interface UseDiaryImagePickerResult {
  images: DiaryImageItem[];
  setImages: Dispatch<SetStateAction<DiaryImageItem[]>>;
  /** 대표 썸네일 url(existing=raw, new=objectURL). 미선택 시 null. */
  thumbnailImageUrl: string | null;
  setThumbnailImageUrl: Dispatch<SetStateAction<string | null>>;
  isUploadingImages: boolean;
  setIsUploadingImages: Dispatch<SetStateAction<boolean>>;
  imagePreviewUrls: string[];
  /** imagePreviewUrls 중 대표 썸네일 인덱스(없으면 -1). */
  thumbnailIndex: number;
  handleAddImageFiles(files: File[]): void;
  handleRemoveImageAt(index: number): void;
  handleSelectThumbnailAt(index: number): void;
}

/**
 * 일지 작성/수정의 이미지 선택·대표 썸네일 관리. useDiaryCreateForm 에서
 * 분리했으며 동작은 동일하다. objectURL 정리(cleanup)도 함께 책임진다.
 */
export function useDiaryImagePicker(): UseDiaryImagePickerResult {
  const [images, setImages] = useState<DiaryImageItem[]>([]);
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(
    null
  );
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  // 언마운트 시 신규 이미지 objectURL 정리를 위한 최신 참조.
  // 렌더 중 ref 쓰기 금지 규칙을 지키기 위해 커밋 후 effect 에서 동기화한다.
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  });

  useEffect(
    () => () => {
      imagesRef.current.forEach((image) => {
        if (image.kind === 'new') {
          revokeObjectUrlIfNeeded(image.url);
        }
      });
    },
    []
  );

  const handleAddImageFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) {
        return;
      }

      // 최대 장수까지만 받는다(초과분은 애초에 objectURL 을 만들지 않음).
      const remaining = MAX_DIARY_IMAGES - images.length;
      if (remaining <= 0) {
        return;
      }

      const addedImages = files.slice(0, remaining).map((file) => ({
        kind: 'new' as const,
        url: URL.createObjectURL(file),
        file,
      }));

      setImages([...images, ...addedImages]);

      // 첫 등록 이미지는 자동으로 대표 지정(빈 목록일 때만). 이후 변경·해제는
      // 사용자 몫이라 여기서 다시 건드리지 않는다.
      if (images.length === 0 && addedImages.length > 0) {
        setThumbnailImageUrl(addedImages[0].url);
      }
    },
    [images]
  );

  const handleRemoveImageAt = useCallback(
    (index: number) => {
      const target = images[index];
      if (target?.kind === 'new') {
        revokeObjectUrlIfNeeded(target.url);
      }

      const nextImages = images.filter((_, itemIndex) => itemIndex !== index);
      setImages(nextImages);

      // 대표 이미지를 삭제하면 남은 첫 이미지로 재지정(첫 이미지가 기본
      // 대표). 목록이 비면 null. 사용자가 직접 해제한 null 은 유지된다
      // (지운 대상이 대표와 다르면 건드리지 않음).
      if (target && thumbnailImageUrl === target.url) {
        setThumbnailImageUrl(nextImages[0]?.url ?? null);
      }
    },
    [images, thumbnailImageUrl]
  );

  const handleSelectThumbnailAt = useCallback(
    (index: number) => {
      // 이미 대표면 해제(null) — 미선택도 유효 상태(저장 시 thumbnailUrl
      // 생략 → 서버 null). 아니면 그 이미지를 대표로 지정.
      const nextUrl = images[index]?.url ?? null;
      setThumbnailImageUrl((prev) => (prev === nextUrl ? null : nextUrl));
    },
    [images]
  );

  const thumbnailIndex = useMemo(
    () => images.findIndex((image) => image.url === thumbnailImageUrl),
    [images, thumbnailImageUrl]
  );

  // existing 의 url 은 재전송용 raw 값이라, 표시할 때만 resolve 한다.
  // new 의 url 은 objectURL(blob:) 이라 그대로 쓴다.
  const imagePreviewUrls = useMemo(
    () =>
      images.map((image) =>
        image.kind === 'existing'
          ? (resolveDiaryImageUrl(image.url) ?? image.url)
          : image.url
      ),
    [images]
  );

  return {
    images,
    setImages,
    thumbnailImageUrl,
    setThumbnailImageUrl,
    isUploadingImages,
    setIsUploadingImages,
    imagePreviewUrls,
    thumbnailIndex,
    handleAddImageFiles,
    handleRemoveImageAt,
    handleSelectThumbnailAt,
  };
}
