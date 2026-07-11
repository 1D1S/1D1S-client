import { getApiErrorCode } from '@module/api/error';
import { uploadImagesViaPresigned } from '@module/api/presignedUpload';
import { toast } from '@module/providers/toast';
import { formatDateISO } from '@module/utils/date';
import { useRouter } from 'next/navigation';
import type { MutableRefObject } from 'react';
import { useCallback } from 'react';

import type { ChallengeListItem } from '../../../challenge/board/type/challenge';
import type { Feeling } from '../../board/type/diary';
import {
  useCreateDiary,
  useUpdateDiary,
} from '../../detail/hooks/useDiaryMutations';
import {
  PHOTO_REQUIRED_ERROR_CODE,
  PHOTO_REQUIRED_MESSAGE,
} from '../consts/photoRequired';
import {
  POST_END_WRITE_EXPIRED_ERROR_CODE,
  POST_END_WRITE_EXPIRED_MESSAGE,
} from '../consts/postEndWrite';
import type { DiaryImageItem } from '../utils/diaryFormHelpers';
import {
  getSubmitButtonLabel,
  isSelectableAchievedDate,
} from '../utils/diaryFormHelpers';

interface UseDiarySubmitParams {
  isEditMode: boolean;
  requestedDiaryId: number | null;
  selectedChallenge: ChallengeListItem | null;
  trimmedTitle: string;
  content: string;
  selectedMood: Feeling;
  achievedDate: Date | undefined;
  achievedGoalIds: number[];
  disabledAchievedDateKeySet: Set<string>;
  isPhotoRequired: boolean;
  images: DiaryImageItem[];
  thumbnailImageUrl: string | null;
  isUploadingImages: boolean;
  setIsUploadingImages(uploading: boolean): void;
  /** 제출-네비게이션 사이 refetch 가 unavailable 다이얼로그를 못 띄우게 하는 가드 */
  submitSuccessRef: MutableRefObject<boolean>;
}

export interface UseDiarySubmitResult {
  handleSubmit(): Promise<void>;
  isSubmitting: boolean;
  submitButtonLabel: string;
}

/**
 * 일지 생성/수정 제출 로직. useDiaryCreateForm 에서 분리했으며 이미지
 * presigned 업로드 → mutation → 네비게이션 흐름과 동작이 동일하다.
 */
export function useDiarySubmit({
  isEditMode,
  requestedDiaryId,
  selectedChallenge,
  trimmedTitle,
  content,
  selectedMood,
  achievedDate,
  achievedGoalIds,
  disabledAchievedDateKeySet,
  isPhotoRequired,
  images,
  thumbnailImageUrl,
  isUploadingImages,
  setIsUploadingImages,
  submitSuccessRef,
}: UseDiarySubmitParams): UseDiarySubmitResult {
  const router = useRouter();
  const createDiary = useCreateDiary();
  const updateDiary = useUpdateDiary();

  const isSubmitting =
    createDiary.isPending || updateDiary.isPending || isUploadingImages;

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!selectedChallenge || !trimmedTitle || isSubmitting) {
      return;
    }

    if (
      achievedDate &&
      (!isSelectableAchievedDate(achievedDate, selectedChallenge.startDate) ||
        disabledAchievedDateKeySet.has(formatDateISO(achievedDate)))
    ) {
      return;
    }

    // 인증샷 필수 챌린지 선제 차단(버튼 비활성화가 우회된 경우 방어).
    if (isPhotoRequired && images.length === 0) {
      toast.error(PHOTO_REQUIRED_MESSAGE);
      return;
    }

    // mutation onSuccess 의 캐시 무효화가 마지막 작성 가능일을 사라지게 만들면
    // useEffect 가 'unavailable' 다이얼로그를 띄울 수 있다. 제출 시작 시점에
    // 가드를 올려, 제출-네비게이션 사이의 어떤 refetch 도 다이얼로그를
    // 트리거하지 못하게 한다. 실패 시에만 가드를 해제한다.
    submitSuccessRef.current = true;

    try {
      // 신규 파일만 presigned 업로드 → fileUrl 수집. 실패 시 diary 요청
      // 자체를 보내지 않는다(아래 catch 로 낙하).
      const newFiles = images
        .filter(
          (image): image is DiaryImageItem & { file: File } =>
            image.kind === 'new' && Boolean(image.file)
        )
        .map((image) => image.file);

      let uploadedFileUrls: string[] = [];
      if (newFiles.length > 0) {
        setIsUploadingImages(true);
        try {
          uploadedFileUrls = await uploadImagesViaPresigned(newFiles);
        } finally {
          setIsUploadingImages(false);
        }
      }

      // 화면 순서 그대로 최종 imageUrls 구성 — 기존 URL 은 유지, 신규는
      // 업로드된 fileUrl 로 치환. 수정 시 전체 덮어쓰기라 유지분도 포함한다.
      let nextUploadedIndex = 0;
      const imageUrls = images.map((image) =>
        image.kind === 'existing'
          ? image.url
          : uploadedFileUrls[nextUploadedIndex++]
      );

      // 대표 미선택(null)이면 thumbnailUrl 을 보내지 않는다(undefined → JSON
      // 에서 생략 → 서버가 null 저장). 자동 첫 장 지정 없음. 선택했으면 그
      // 이미지의 최종 URL(imageUrls 안의 값)만 전송 — 아니면 DIARY-009.
      const thumbnailImageIndex = thumbnailImageUrl
        ? images.findIndex((image) => image.url === thumbnailImageUrl)
        : -1;
      const thumbnailUrl =
        thumbnailImageIndex >= 0 ? imageUrls[thumbnailImageIndex] : undefined;

      if (isEditMode && requestedDiaryId) {
        await updateDiary.mutateAsync({
          id: requestedDiaryId,
          data: {
            challengeId: selectedChallenge.challengeId,
            title: trimmedTitle,
            content,
            feeling: selectedMood,
            isPublic: true,
            achievedDate: achievedDate ? formatDateISO(achievedDate) : '',
            achievedGoalIds,
            imageUrls,
            thumbnailUrl,
          },
        });

        router.push(`/diary/${requestedDiaryId}`);
        return;
      }

      await createDiary.mutateAsync({
        challengeId: selectedChallenge.challengeId,
        title: trimmedTitle,
        content,
        feeling: selectedMood,
        isPublic: true,
        achievedDate: achievedDate ? formatDateISO(achievedDate) : '',
        achievedGoalIds,
        imageUrls,
        thumbnailUrl,
      });

      router.push('/diary');
    } catch (error) {
      submitSuccessRef.current = false;
      // 프론트에서 이미 막지만, 백엔드 도메인 위반 응답도 방어적으로 처리한다.
      const errorCode = getApiErrorCode(error);
      toast.error(
        errorCode === PHOTO_REQUIRED_ERROR_CODE
          ? PHOTO_REQUIRED_MESSAGE
          : errorCode === POST_END_WRITE_EXPIRED_ERROR_CODE
            ? POST_END_WRITE_EXPIRED_MESSAGE
            : '일지 저장 또는 이미지 업로드에 실패했습니다.'
      );
    }
  }, [
    achievedDate,
    achievedGoalIds,
    content,
    createDiary,
    disabledAchievedDateKeySet,
    images,
    isEditMode,
    isPhotoRequired,
    isSubmitting,
    router,
    requestedDiaryId,
    selectedChallenge,
    selectedMood,
    setIsUploadingImages,
    submitSuccessRef,
    thumbnailImageUrl,
    trimmedTitle,
    updateDiary,
  ]);

  const submitButtonLabel = getSubmitButtonLabel({
    isCreating: createDiary.isPending,
    isUpdating: updateDiary.isPending,
    isUploadingImage: isUploadingImages,
    isEditMode,
  });

  return { handleSubmit, isSubmitting, submitButtonLabel };
}
