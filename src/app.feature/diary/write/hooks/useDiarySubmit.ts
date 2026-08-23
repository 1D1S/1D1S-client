import { MEMBER_QUERY_KEYS } from '@feature/member/consts/queryKeys';
import { getApiErrorCode } from '@module/api/error';
import { uploadImagesViaPresigned } from '@module/api/presignedUpload';
import { toast } from '@module/providers/toast';
import { formatDateISO } from '@module/utils/date';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { MutableRefObject } from 'react';
import { useCallback, useState } from 'react';

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

/** 저장 성공 후 완료 모달에 넘길 값. null 이면 모달을 안 띄운다. */
export interface DiaryCreatedResult {
  diaryId: number | null;
  streakIncreased: boolean;
  streakDays: number;
}

export interface UseDiarySubmitResult {
  handleSubmit(): Promise<void>;
  isSubmitting: boolean;
  submitButtonLabel: string;
  /** 작성 완료 모달 상태. 앱과 달리 웹은 저장 후 바로 이동했었다. */
  created: DiaryCreatedResult | null;
  clearCreated(): void;
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
  const queryClient = useQueryClient();
  const createDiary = useCreateDiary();
  const updateDiary = useUpdateDiary();
  const [created, setCreated] = useState<DiaryCreatedResult | null>(null);

  /**
   * 현재 스트릭. 사이드바가 이미 주는 값(streakCount)을 그대로 읽는다 —
   * 앱이 /widget/summary 에서 읽는 것과 같은 숫자다.
   *
   * ponytail: 서버가 일지 생성 응답에 streak 를 실어 주면 저장 전후 두 번
   * 읽는 이 경로를 통째로 지운다. 스트릭 판정은 원래 서버 몫이다 —
   * achievedDate 기준에 유예가 붙어 클라가 "오늘 첫 작성인가" 로 흉내 내면
   * 틀린다(앱도 같은 이유로 같은 우회를 쓴다).
   */
  const readStreak = useCallback(
    async (refetch: boolean): Promise<number | null> => {
      try {
        if (refetch) {
          await queryClient.refetchQueries({
            queryKey: MEMBER_QUERY_KEYS.sidebar(),
          });
        }
        const data = queryClient.getQueryData<{ streakCount?: number }>(
          MEMBER_QUERY_KEYS.sidebar()
        );
        return data?.streakCount ?? null;
      } catch {
        // 스트릭을 못 읽어도 저장은 성공이다 — 모달만 기본 분기로 간다.
        return null;
      }
    },
    [queryClient]
  );

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

        // 수정은 앱과 같이 토스트로만 알린다(완료 모달은 새 일지 전용).
        toast.success('일지를 수정했어요.');
        router.push(`/diary/${requestedDiaryId}`);
        return;
      }

      // 저장 전 스트릭. 캐시에 이미 있는 값이라 왕복이 늘지 않는다.
      const streakBefore = await readStreak(false);

      const createdDiary = await createDiary.mutateAsync({
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

      // 저장 후 스트릭. mutation 이 사이드바를 무효화하므로 다시 받아 온다.
      const streakAfter = await readStreak(true);

      // 이동하지 않고 완료 모달을 띄운다 — 어디로 갈지는 사용자가 고른다.
      setCreated({
        diaryId: createdDiary?.id ?? null,
        streakIncreased:
          streakBefore != null &&
          streakAfter != null &&
          streakAfter > streakBefore,
        streakDays: streakAfter ?? 0,
      });
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
    readStreak,
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

  const clearCreated = useCallback(() => setCreated(null), []);

  return {
    handleSubmit,
    isSubmitting,
    submitButtonLabel,
    created,
    clearCreated,
  };
}
