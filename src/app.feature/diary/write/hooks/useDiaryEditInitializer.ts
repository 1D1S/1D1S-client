import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import type { DiaryDetail, Feeling } from '../../board/type/diary';
import type { DiaryImageItem } from '../utils/diaryFormHelpers';
import { getDiaryImageUrls, getDiaryInfo } from '../utils/diaryFormHelpers';

interface UseDiaryEditInitializerParams {
  isEditMode: boolean;
  existingDiary: DiaryDetail | undefined;
  setTitle: Dispatch<SetStateAction<string>>;
  setContent: Dispatch<SetStateAction<string>>;
  setSelectedMood: Dispatch<SetStateAction<Feeling>>;
  setAchievedDate: Dispatch<SetStateAction<Date | undefined>>;
  setSelectedChallengeId: Dispatch<SetStateAction<number | null>>;
  setAchievedGoalIds: Dispatch<SetStateAction<number[]>>;
  setImages: Dispatch<SetStateAction<DiaryImageItem[]>>;
  setThumbnailImageUrl: Dispatch<SetStateAction<string | null>>;
}

/**
 * 수정 모드 진입 시 기존 일지 값으로 폼 상태를 1회 초기화한다.
 * useDiaryCreateForm 에서 분리한 effect 로, 상태 setter 들을 주입받는다.
 */
export function useDiaryEditInitializer({
  isEditMode,
  existingDiary,
  setTitle,
  setContent,
  setSelectedMood,
  setAchievedDate,
  setSelectedChallengeId,
  setAchievedGoalIds,
  setImages,
  setThumbnailImageUrl,
}: UseDiaryEditInitializerParams): void {
  const [isEditFormInitialized, setIsEditFormInitialized] = useState(false);

  useEffect(() => {
    if (!isEditMode || isEditFormInitialized || !existingDiary) {
      return;
    }

    const diaryInfo = getDiaryInfo(existingDiary);
    const baseDate = diaryInfo?.challengedDate ?? diaryInfo?.createdAt ?? '';
    const parsedDate = baseDate ? new Date(baseDate) : null;
    const nextAchievedDate =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate
        : new Date();
    const nextImageUrls = getDiaryImageUrls(existingDiary);
    // 기존 대표 썸네일(raw). 목록에 있으면 그 값을, 서버가 미지정(null)
    // 이거나 목록에 없으면 미선택(null) — 자동으로 첫 장을 삼지 않는다.
    const existingThumbnail = existingDiary.thumbnailUrl ?? null;
    const nextThumbnail =
      existingThumbnail && nextImageUrls.includes(existingThumbnail)
        ? existingThumbnail
        : null;
    const timerId = window.setTimeout(() => {
      setTitle(existingDiary.title ?? '');
      setContent(existingDiary.content ?? '');
      setSelectedMood(diaryInfo?.feeling ?? 'NORMAL');
      setAchievedDate(nextAchievedDate);
      setSelectedChallengeId(existingDiary.challenge?.challengeId ?? null);
      const nextAchievedGoalIds =
        diaryInfo?.diaryGoal
          ?.filter((goal) => goal.isAchieved)
          ?.map((goal) => goal.challengeGoalId) ??
        diaryInfo?.achievement ??
        [];
      setAchievedGoalIds(nextAchievedGoalIds);
      setImages(
        nextImageUrls.map((url) => ({ kind: 'existing' as const, url }))
      );
      setThumbnailImageUrl(nextThumbnail);
      setIsEditFormInitialized(true);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
    // 의존성은 원본 useDiaryCreateForm 과 동일하게 유지한다. setter 는 안정적.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingDiary, isEditFormInitialized, isEditMode]);
}
