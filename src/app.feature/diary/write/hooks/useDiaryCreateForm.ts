import { canWriteDiaryForChallenge } from '@feature/challenge/board/utils/challengePeriod';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { formatDateISO } from '@module/utils/date';
import { useSearchParams } from 'next/navigation';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  useChallengeCheckWriteDates,
  useChallengeDetail,
} from '../../../challenge/board/hooks/useChallengeQueries';
import type {
  ChallengeGoal,
  ChallengeListItem,
} from '../../../challenge/board/type/challenge';
import {
  useAllDiaries,
  useDiaryDetail,
} from '../../board/hooks/useDiaryQueries';
import type { Feeling } from '../../board/type/diary';
import { isChallengePhotoRequired } from '../consts/photoRequired';
import {
  getDiaryInfo,
  hasSelectableAchievedDate,
  mapDiaryChallengeToChallengeListItem,
  mapSidebarChallengeToChallengeListItem,
  parsePositiveInteger,
} from '../utils/diaryFormHelpers';
import { useAchievedDateGuard } from './useAchievedDateGuard';
import { useDiaryEditInitializer } from './useDiaryEditInitializer';
import { useDiaryImagePicker } from './useDiaryImagePicker';
import { useDiarySubmit } from './useDiarySubmit';

const EMPTY_GOALS: ChallengeGoal[] = [];

interface UseDiaryCreateFormResult {
  isEditMode: boolean;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  selectedMood: Feeling;
  setSelectedMood: Dispatch<SetStateAction<Feeling>>;
  achievedDate: Date | undefined;
  setAchievedDate: Dispatch<SetStateAction<Date | undefined>>;
  selectedChallenge: ChallengeListItem | null;
  memberChallenges: ChallengeListItem[];
  isMemberChallengesLoading: boolean;
  isInitialChallengeLoading: boolean;
  isCheckingChallengeAvailability: boolean;
  /** 챌린지 선택 후 checkWrite 확인이 완료되고 작성 가능한 날짜가 있을 때 true */
  isSelectedChallengeConfirmed: boolean;
  goals: ChallengeGoal[];
  achievedGoalIds: number[];
  disabledAchievedDateKeys: string[];
  imagePreviewUrls: string[];
  /** imagePreviewUrls 중 대표 썸네일 인덱스(없으면 -1). */
  thumbnailIndex: number;
  /** 선택한 챌린지가 인증샷(사진) 필수인지 여부. */
  isPhotoRequired: boolean;
  submitButtonLabel: string;
  canSubmit: boolean;
  isSubmitting: boolean;
  isMissingChallengeDialogOpen: boolean;
  isCreateUnavailableDialogOpen: boolean;
  handleSelectChallenge(challenge: ChallengeListItem): void;
  handleClearChallenge(): void;
  handleGoalIdsChange(goalIds: number[]): void;
  handleAchievedDateChange(date: Date | undefined): void;
  isAchievedDateDisabled(date: Date): boolean;
  handleAddImageFiles(files: File[]): void;
  handleRemoveImageAt(index: number): void;
  handleSelectThumbnailAt(index: number): void;
  closeMissingChallengeDialog(): void;
  closeCreateUnavailableDialog(): void;
  handleSubmit(): Promise<void>;
}

/**
 * 일지 작성/수정 폼의 조립 훅. 이미지 선택·챌린지 선택·달성 날짜 가드·
 * 수정 모드 초기화·제출을 각각의 전용 훅으로 분리하고 여기서 조합한다.
 */
export function useDiaryCreateForm(): UseDiaryCreateFormResult {
  const searchParams = useSearchParams();
  const [requestedDiaryId] = useState<number | null>(() =>
    parsePositiveInteger(searchParams.get('diaryId'))
  );
  const isEditMode = requestedDiaryId !== null;
  const [requestedChallengeId] = useState<number | null>(() =>
    parsePositiveInteger(searchParams.get('challengeId'))
  );

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Feeling>('NORMAL');
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(
    requestedChallengeId
  );
  const [
    isMissingChallengeDialogDismissed,
    setIsMissingChallengeDialogDismissed,
  ] = useState(false);
  const [isCreateUnavailableDialogOpen, setIsCreateUnavailableDialogOpen] =
    useState(false);
  const [achievedGoalIds, setAchievedGoalIds] = useState<number[]>([]);

  const submitSuccessRef = useRef(false);
  const unavailableDialogShownForChallengeIdRef = useRef<number | null>(null);

  const imagePicker = useDiaryImagePicker();

  const { data: existingDiary, isLoading: isExistingDiaryLoading } =
    useDiaryDetail(requestedDiaryId ?? 0);

  const { data: myDiaries = [], isLoading: isMyDiariesLoading } = useAllDiaries(
    {
      enabled: requestedChallengeId !== null,
    }
  );

  const requestedChallengeFromMyDiaries = useMemo(() => {
    if (requestedChallengeId === null) {
      return null;
    }

    const matchedDiary = myDiaries.find(
      (diary) => diary.challenge?.challengeId === requestedChallengeId
    );
    return matchedDiary?.challenge ?? null;
  }, [myDiaries, requestedChallengeId]);

  const { data: sidebarData, isLoading: isMemberChallengesLoading } =
    useSidebar();
  const memberChallenges = useMemo(
    () =>
      (sidebarData?.challengeList ?? []).map(
        mapSidebarChallengeToChallengeListItem
      ),
    [sidebarData]
  );
  // 진행 중 + 종료 후 작성 유예 이내 챌린지를 작성 대상으로 노출한다.
  const ongoingMemberChallenges = useMemo(
    () =>
      memberChallenges.filter((challenge) =>
        canWriteDiaryForChallenge(
          challenge.startDate,
          challenge.endDate,
          challenge.postEndWriteAllowed
        )
      ),
    [memberChallenges]
  );
  const selectedChallenge = useMemo(() => {
    if (selectedChallengeId === null) {
      return null;
    }

    const memberChallenge =
      ongoingMemberChallenges.find(
        (challenge) => challenge.challengeId === selectedChallengeId
      ) ?? null;

    if (memberChallenge) {
      return memberChallenge;
    }

    const fallbackChallengeSummary =
      (requestedChallengeFromMyDiaries?.challengeId === selectedChallengeId
        ? requestedChallengeFromMyDiaries
        : null) ??
      (existingDiary?.challenge?.challengeId === selectedChallengeId
        ? existingDiary.challenge
        : null);

    return fallbackChallengeSummary
      ? mapDiaryChallengeToChallengeListItem(fallbackChallengeSummary)
      : null;
  }, [
    existingDiary,
    ongoingMemberChallenges,
    requestedChallengeFromMyDiaries,
    selectedChallengeId,
  ]);

  const { data: challengeDetail } = useChallengeDetail(
    selectedChallenge?.challengeId ?? 0
  );
  const {
    data: challengeCheckWriteDateKeys = [],
    isLoading: isChallengeCheckWriteDatesLoading,
  } = useChallengeCheckWriteDates(selectedChallenge?.challengeId ?? 0);
  const goals = challengeDetail?.challengeGoals ?? EMPTY_GOALS;
  // 인증샷 필수 챌린지는 최종 이미지(유지+신규)가 0장이면 제출을 막는다.
  const isPhotoRequired = isChallengePhotoRequired(challengeDetail);

  const editModeDateKey = useMemo(() => {
    if (!isEditMode || !existingDiary) {
      return null;
    }

    const diaryInfo = getDiaryInfo(existingDiary);
    const baseDate = diaryInfo?.challengedDate ?? diaryInfo?.createdAt ?? '';
    const parsedDate = baseDate ? new Date(baseDate) : null;

    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return formatDateISO(parsedDate);
  }, [existingDiary, isEditMode]);

  const disabledAchievedDateKeys = useMemo(() => {
    const uniqueDateKeys = new Set(
      challengeCheckWriteDateKeys.filter((date) =>
        /^\d{4}-\d{2}-\d{2}$/.test(date)
      )
    );

    if (editModeDateKey) {
      uniqueDateKeys.delete(editModeDateKey);
    }

    return Array.from(uniqueDateKeys);
  }, [challengeCheckWriteDateKeys, editModeDateKey]);

  const disabledAchievedDateKeySet = useMemo(
    () => new Set(disabledAchievedDateKeys),
    [disabledAchievedDateKeys]
  );

  const {
    achievedDate,
    setAchievedDate,
    handleAchievedDateChange,
    isAchievedDateDisabled,
  } = useAchievedDateGuard({
    isEditMode,
    selectedChallenge,
    disabledAchievedDateKeySet,
  });

  const hasWritableRecentDate = hasSelectableAchievedDate(
    disabledAchievedDateKeySet,
    selectedChallenge?.startDate
  );
  const isCheckingChallengeAvailability =
    Boolean(selectedChallenge) && isChallengeCheckWriteDatesLoading;

  // checkWrite 확인 완료 + 작성 가능한 날짜 존재 여부
  // 수정 모드에선 editModeDateKey가 제외되므로 항상 true (로딩 완료 후)
  const isSelectedChallengeConfirmed =
    Boolean(selectedChallenge) &&
    !isChallengeCheckWriteDatesLoading &&
    (isEditMode || hasWritableRecentDate);

  const trimmedTitle = title.trim();
  // 참여자가 0명이면 아카이브된 챌린지로 간주해 종료 처리한다.
  const isSelectedChallengeArchived = selectedChallenge
    ? selectedChallenge.participantCnt === 0
    : false;
  const isSelectedChallengeOngoing = selectedChallenge
    ? canWriteDiaryForChallenge(
        selectedChallenge.startDate,
        selectedChallenge.endDate,
        selectedChallenge.postEndWriteAllowed
      ) && !isSelectedChallengeArchived
    : false;

  const { handleSubmit, isSubmitting, submitButtonLabel } = useDiarySubmit({
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
    images: imagePicker.images,
    thumbnailImageUrl: imagePicker.thumbnailImageUrl,
    isUploadingImages: imagePicker.isUploadingImages,
    setIsUploadingImages: imagePicker.setIsUploadingImages,
    submitSuccessRef,
  });

  const canSubmit =
    Boolean(selectedChallenge) &&
    isSelectedChallengeOngoing &&
    trimmedTitle.length > 0 &&
    Boolean(achievedDate) &&
    (achievedDate ? !isAchievedDateDisabled(achievedDate) : false) &&
    !isChallengeCheckWriteDatesLoading &&
    !isSubmitting &&
    (!isPhotoRequired || imagePicker.images.length > 0) &&
    (!isEditMode || !isExistingDiaryLoading);
  const isInitialChallengeLoading =
    requestedChallengeId !== null &&
    selectedChallengeId === requestedChallengeId &&
    (isMemberChallengesLoading || isMyDiariesLoading);
  const isMissingChallengeDialogOpen =
    !isEditMode &&
    requestedChallengeId !== null &&
    !isMemberChallengesLoading &&
    !memberChallenges.some(
      (challenge) => challenge.challengeId === requestedChallengeId
    ) &&
    !isMissingChallengeDialogDismissed;

  useDiaryEditInitializer({
    isEditMode,
    existingDiary,
    setTitle,
    setContent,
    setSelectedMood,
    setAchievedDate,
    setSelectedChallengeId,
    setAchievedGoalIds,
    setImages: imagePicker.setImages,
    setThumbnailImageUrl: imagePicker.setThumbnailImageUrl,
  });

  useEffect(() => {
    if (
      isEditMode ||
      !selectedChallenge ||
      isMemberChallengesLoading ||
      isChallengeCheckWriteDatesLoading ||
      !isSelectedChallengeOngoing ||
      submitSuccessRef.current
    ) {
      return;
    }

    if (hasWritableRecentDate) {
      return;
    }

    // 진입 시점에 한 번만 띄운다. 같은 챌린지에서 작성 도중 mutation 등으로
    // checkWriteDates가 갱신되어 hasWritableRecentDate가 false 로 바뀌어도
    // 다시 다이얼로그가 뜨지 않도록 챌린지 단위로 가드한다.
    if (
      unavailableDialogShownForChallengeIdRef.current ===
      selectedChallenge.challengeId
    ) {
      return;
    }

    const timerId = window.setTimeout(() => {
      unavailableDialogShownForChallengeIdRef.current =
        selectedChallenge.challengeId;
      setIsCreateUnavailableDialogOpen(true);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    hasWritableRecentDate,
    isChallengeCheckWriteDatesLoading,
    isEditMode,
    isMemberChallengesLoading,
    isSelectedChallengeOngoing,
    selectedChallenge,
  ]);

  const handleSelectChallenge = useCallback((challenge: ChallengeListItem) => {
    unavailableDialogShownForChallengeIdRef.current = null;
    setSelectedChallengeId(challenge.challengeId);
    setAchievedGoalIds([]);
  }, []);

  const handleClearChallenge = useCallback(() => {
    unavailableDialogShownForChallengeIdRef.current = null;
    setSelectedChallengeId(null);
    setAchievedGoalIds([]);
  }, []);

  const handleGoalIdsChange = useCallback((goalIds: number[]) => {
    setAchievedGoalIds(goalIds);
  }, []);

  const closeMissingChallengeDialog = useCallback(() => {
    setIsMissingChallengeDialogDismissed(true);
  }, []);

  const closeCreateUnavailableDialog = useCallback(() => {
    setIsCreateUnavailableDialogOpen(false);
    unavailableDialogShownForChallengeIdRef.current = null;
    setSelectedChallengeId(null);
    setAchievedGoalIds([]);
  }, []);

  return {
    isEditMode,
    title,
    setTitle,
    content,
    setContent,
    selectedMood,
    setSelectedMood,
    achievedDate,
    setAchievedDate,
    selectedChallenge,
    memberChallenges: ongoingMemberChallenges,
    isMemberChallengesLoading,
    isInitialChallengeLoading,
    isCheckingChallengeAvailability,
    isSelectedChallengeConfirmed,
    goals,
    achievedGoalIds,
    disabledAchievedDateKeys,
    imagePreviewUrls: imagePicker.imagePreviewUrls,
    thumbnailIndex: imagePicker.thumbnailIndex,
    isPhotoRequired,
    submitButtonLabel,
    canSubmit,
    isSubmitting,
    isMissingChallengeDialogOpen,
    isCreateUnavailableDialogOpen,
    handleSelectChallenge,
    handleClearChallenge,
    handleGoalIdsChange,
    handleAchievedDateChange,
    isAchievedDateDisabled,
    handleAddImageFiles: imagePicker.handleAddImageFiles,
    handleRemoveImageAt: imagePicker.handleRemoveImageAt,
    handleSelectThumbnailAt: imagePicker.handleSelectThumbnailAt,
    closeMissingChallengeDialog,
    closeCreateUnavailableDialog,
    handleSubmit,
  };
}
