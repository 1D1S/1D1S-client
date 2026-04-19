import { isChallengeOngoing } from '@feature/challenge/board/utils/challengePeriod';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import type { SidebarChallenge } from '@feature/member/type/member';
import { toStartOfDay } from '@module/utils/date';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  useChallengeCheckWriteDates,
  useChallengeDetail,
} from '../../../challenge/board/hooks/useChallengeQueries';
import type {
  ChallengeCategory,
  ChallengeGoal,
  ChallengeListItem,
  GoalType,
  ParticipationType,
} from '../../../challenge/board/type/challenge';
import {
  useAllDiaries,
  useDiaryDetail,
} from '../../board/hooks/useDiaryQueries';
import type {
  ChallengeSummary as DiaryChallengeSummary,
  DiaryDetail,
  DiaryInfo,
  Feeling,
} from '../../board/type/diary';
import {
  useCreateDiary,
  useUpdateDiary,
  useUploadDiaryImage,
} from '../../detail/hooks/useDiaryMutations';
import {
  resolveDiaryImageList,
  resolveDiaryImageUrl,
} from '../../shared/utils/diaryImageUrl';

function parsePositiveInteger(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateValue(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const matchedDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchedDate) {
    const [, year, month, day] = matchedDate;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function isSelectableAchievedDate(
  date: Date,
  challengeStartDate?: string | null
): boolean {
  const today = toStartOfDay(new Date());
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 2);
  const targetDate = toStartOfDay(date);
  const parsedChallengeStartDate = parseDateValue(challengeStartDate);

  if (parsedChallengeStartDate) {
    const challengeStart = toStartOfDay(parsedChallengeStartDate);
    if (targetDate < challengeStart) {
      return false;
    }
  }

  return targetDate >= minDate && targetDate <= today;
}

function getFirstSelectableAchievedDate(
  disabledDateKeys: Set<string>,
  challengeStartDate?: string | null
): Date | undefined {
  const today = toStartOfDay(new Date());

  for (let dayOffset = 0; dayOffset <= 2; dayOffset += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() - dayOffset);

    if (
      isSelectableAchievedDate(candidate, challengeStartDate) &&
      !disabledDateKeys.has(formatDate(candidate))
    ) {
      return candidate;
    }
  }

  return undefined;
}

function hasSelectableAchievedDate(
  disabledDateKeys: Set<string>,
  challengeStartDate?: string | null
): boolean {
  return Boolean(
    getFirstSelectableAchievedDate(disabledDateKeys, challengeStartDate)
  );
}

interface SubmitButtonLabelArgs {
  isCreating: boolean;
  isUpdating: boolean;
  isUploadingImage: boolean;
  isEditMode: boolean;
}

function getSubmitButtonLabel({
  isCreating,
  isUpdating,
  isUploadingImage,
  isEditMode,
}: SubmitButtonLabelArgs): string {
  if (isCreating) {
    return '작성 중...';
  }
  if (isUpdating) {
    return '수정 중...';
  }
  if (isUploadingImage) {
    return '썸네일 업로드 중...';
  }
  return isEditMode ? '수정 완료' : '작성 완료';
}

function normalizeChallengeCategory(category: string): ChallengeCategory {
  const categoryMap: Record<string, ChallengeCategory> = {
    ALL: 'ALL',
    DEV: 'DEV',
    EXERCISE: 'EXERCISE',
    BOOK: 'BOOK',
    MUSIC: 'MUSIC',
    STUDY: 'STUDY',
    LEISURE: 'LEISURE',
    ECONOMY: 'ECONOMY',
  };

  return categoryMap[category] ?? 'DEV';
}

function normalizeGoalType(goalType: string): GoalType {
  return goalType === 'FIXED' ? 'FIXED' : 'FLEXIBLE';
}

function normalizeParticipationType(
  participationType: string
): ParticipationType {
  return participationType === 'GROUP' ? 'GROUP' : 'INDIVIDUAL';
}

function mapDiaryChallengeToChallengeListItem(
  challenge: DiaryChallengeSummary
): ChallengeListItem {
  return {
    challengeId: challenge.challengeId,
    title: challenge.title,
    category: normalizeChallengeCategory(challenge.category),
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    maxParticipantCnt: challenge.maxParticipantCnt,
    goalType: normalizeGoalType(challenge.goalType),
    participationType: normalizeParticipationType(challenge.participationType),
    participantCnt: challenge.participantCnt,
    liked: challenge.likeInfo.likedByMe,
    likeCnt: challenge.likeInfo.likeCnt,
  };
}

function mapSidebarChallengeToChallengeListItem(
  challenge: SidebarChallenge
): ChallengeListItem {
  return {
    challengeId: challenge.challengeId,
    title: challenge.title,
    category: normalizeChallengeCategory(challenge.category),
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    maxParticipantCnt: challenge.maxParticipantCnt,
    goalType: normalizeGoalType(challenge.goalType),
    participationType: normalizeParticipationType(challenge.participationType),
    participantCnt: challenge.participantCnt,
    liked: challenge.likeInfo.likedByMe,
    likeCnt: challenge.likeInfo.likeCnt,
  };
}

type DiaryDetailWithAliases = DiaryDetail & {
  diaryInfo?: DiaryInfo | null;
  img?:
    | Array<{ url?: string | null; imageUrl?: string | null }>
    | string[]
    | string
    | null;
  imgUrl?: string[] | string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  thumbnail?: string | null;
  images?:
    | Array<{ url?: string | null; imageUrl?: string | null } | string>
    | string[]
    | string
    | null;
};

function revokeObjectUrlIfNeeded(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

function getDiaryInfo(diary: DiaryDetail | null | undefined): DiaryInfo | null {
  const diaryWithAliases = diary as DiaryDetailWithAliases | null | undefined;
  return diaryWithAliases?.diaryInfoDto ?? diaryWithAliases?.diaryInfo ?? null;
}

function getDiaryThumbnailPreviewUrl(
  diary: DiaryDetail | null | undefined
): string {
  const diaryWithAliases = diary as DiaryDetailWithAliases | null | undefined;
  if (!diaryWithAliases) {
    return '';
  }

  const imageCandidates: unknown[] = [
    diaryWithAliases.imgUrl,
    diaryWithAliases.img,
    diaryWithAliases.imageUrl,
    diaryWithAliases.thumbnailUrl,
    diaryWithAliases.thumbnail,
    diaryWithAliases.images,
  ];

  for (const candidate of imageCandidates) {
    const resolvedImage = resolveDiaryImageList(candidate)?.[0];
    if (resolvedImage) {
      return resolvedImage;
    }
  }

  const imageFromLegacyFields = resolveDiaryImageUrl(diaryWithAliases.img);

  return imageFromLegacyFields ?? '';
}

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
  isPublic: boolean;
  setIsPublic: Dispatch<SetStateAction<boolean>>;
  selectedChallenge: ChallengeListItem | null;
  memberChallenges: ChallengeListItem[];
  isMemberChallengesLoading: boolean;
  isInitialChallengeLoading: boolean;
  /** 챌린지 선택 후 checkWrite 확인이 완료되고 작성 가능한 날짜가 있을 때 true */
  isSelectedChallengeConfirmed: boolean;
  goals: ChallengeGoal[];
  achievedGoalIds: number[];
  disabledAchievedDateKeys: string[];
  thumbnailFile: File | null;
  thumbnailPreviewUrl: string;
  submitButtonLabel: string;
  canSubmit: boolean;
  isMissingChallengeDialogOpen: boolean;
  isCreateUnavailableDialogOpen: boolean;
  handleSelectChallenge(challenge: ChallengeListItem): void;
  handleClearChallenge(): void;
  handleGoalIdsChange(goalIds: number[]): void;
  handleAchievedDateChange(date: Date | undefined): void;
  handleThumbnailFileSelect(file: File): void;
  closeMissingChallengeDialog(): void;
  closeCreateUnavailableDialog(): void;
  clearThumbnail(): void;
  handleSubmit(): Promise<void>;
}

export function useDiaryCreateForm(): UseDiaryCreateFormResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requestedDiaryId] = useState<number | null>(() =>
    parsePositiveInteger(searchParams.get('diaryId'))
  );
  const isEditMode = requestedDiaryId !== null;
  const createDiary = useCreateDiary();
  const updateDiary = useUpdateDiary();
  const uploadDiaryImage = useUploadDiaryImage();
  const [requestedChallengeId] = useState<number | null>(() =>
    parsePositiveInteger(searchParams.get('challengeId'))
  );

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Feeling>('NORMAL');
  const [achievedDate, setAchievedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isPublic, setIsPublic] = useState(true);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(
    requestedChallengeId
  );
  const [
    isMissingChallengeDialogDismissed,
    setIsMissingChallengeDialogDismissed,
  ] = useState(false);
  const [isCreateUnavailableDialogOpen, setIsCreateUnavailableDialogOpen] =
    useState(false);
  const [isEditFormInitialized, setIsEditFormInitialized] = useState(false);
  const [achievedGoalIds, setAchievedGoalIds] = useState<number[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState('');
  const submitSuccessRef = useRef(false);

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
  const ongoingMemberChallenges = useMemo(
    () =>
      memberChallenges.filter((challenge) =>
        isChallengeOngoing(challenge.startDate, challenge.endDate)
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
  const goals = challengeDetail?.challengeGoals ?? [];

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

    return formatDate(parsedDate);
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
  const hasWritableRecentDate = hasSelectableAchievedDate(
    disabledAchievedDateKeySet,
    selectedChallenge?.startDate
  );

  // checkWrite 확인 완료 + 작성 가능한 날짜 존재 여부
  // 수정 모드에선 editModeDateKey가 제외되므로 항상 true (로딩 완료 후)
  const isSelectedChallengeConfirmed =
    Boolean(selectedChallenge) &&
    !isChallengeCheckWriteDatesLoading &&
    (isEditMode || hasWritableRecentDate);

  const isSubmitting =
    createDiary.isPending ||
    updateDiary.isPending ||
    uploadDiaryImage.isPending;
  const trimmedTitle = title.trim();
  const isSelectedChallengeOngoing = selectedChallenge
    ? isChallengeOngoing(selectedChallenge.startDate, selectedChallenge.endDate)
    : false;
  const canSubmit =
    Boolean(selectedChallenge) &&
    isSelectedChallengeOngoing &&
    trimmedTitle.length > 0 &&
    Boolean(achievedDate) &&
    (achievedDate
      ? isSelectableAchievedDate(achievedDate, selectedChallenge?.startDate) &&
        !disabledAchievedDateKeySet.has(formatDate(achievedDate))
      : false) &&
    !isChallengeCheckWriteDatesLoading &&
    !isSubmitting &&
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

  useEffect(
    () => () => {
      if (thumbnailPreviewUrl) {
        revokeObjectUrlIfNeeded(thumbnailPreviewUrl);
      }
    },
    [thumbnailPreviewUrl]
  );

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
    const nextThumbnailPreviewUrl = getDiaryThumbnailPreviewUrl(existingDiary);

    const timerId = window.setTimeout(() => {
      setTitle(existingDiary.title ?? '');
      setContent(existingDiary.content ?? '');
      setSelectedMood(diaryInfo?.feeling ?? 'NORMAL');
      setIsPublic(existingDiary.isPublic ?? true);
      setAchievedDate(nextAchievedDate);
      setSelectedChallengeId(existingDiary.challenge?.challengeId ?? null);
      const achievedGoalIds =
        diaryInfo?.diaryGoal
          ?.filter((goal) => goal.isAchieved)
          ?.map((goal) => goal.challengeGoalId) ??
        diaryInfo?.achievement ??
        [];
      setAchievedGoalIds(achievedGoalIds);
      setThumbnailPreviewUrl(nextThumbnailPreviewUrl);
      setIsEditFormInitialized(true);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [existingDiary, isEditFormInitialized, isEditMode]);

  useEffect(() => {
    if (
      isEditMode ||
      !selectedChallenge ||
      isMemberChallengesLoading ||
      !isSelectedChallengeOngoing ||
      submitSuccessRef.current
    ) {
      return;
    }

    if (hasWritableRecentDate) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setIsCreateUnavailableDialogOpen(true);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    hasWritableRecentDate,
    isEditMode,
    isMemberChallengesLoading,
    isSelectedChallengeOngoing,
    selectedChallenge,
  ]);

  useEffect(() => {
    if (isEditMode || !selectedChallenge) {
      return;
    }

    const timerId = window.setTimeout(() => {
      if (!achievedDate) {
        const firstSelectableDate = getFirstSelectableAchievedDate(
          disabledAchievedDateKeySet,
          selectedChallenge.startDate
        );
        if (firstSelectableDate) {
          setAchievedDate(firstSelectableDate);
        }
        return;
      }

      if (
        !isSelectableAchievedDate(achievedDate, selectedChallenge.startDate) ||
        disabledAchievedDateKeySet.has(formatDate(achievedDate))
      ) {
        setAchievedDate(
          getFirstSelectableAchievedDate(
            disabledAchievedDateKeySet,
            selectedChallenge.startDate
          )
        );
      }
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [achievedDate, disabledAchievedDateKeySet, isEditMode, selectedChallenge]);

  const handleSelectChallenge = useCallback((challenge: ChallengeListItem) => {
    setSelectedChallengeId(challenge.challengeId);
    setAchievedGoalIds([]);
  }, []);

  const handleClearChallenge = useCallback(() => {
    setSelectedChallengeId(null);
    setAchievedGoalIds([]);
  }, []);

  const handleGoalIdsChange = useCallback((goalIds: number[]) => {
    setAchievedGoalIds(goalIds);
  }, []);

  const handleAchievedDateChange = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        setAchievedDate(undefined);
        return;
      }

      if (!isSelectableAchievedDate(date, selectedChallenge?.startDate)) {
        return;
      }

      if (disabledAchievedDateKeySet.has(formatDate(date))) {
        return;
      }

      setAchievedDate(date);
    },
    [disabledAchievedDateKeySet, selectedChallenge?.startDate]
  );

  const setThumbnail = useCallback((file: File | null) => {
    setThumbnailFile(file);
    setThumbnailPreviewUrl((prevPreviewUrl) => {
      if (prevPreviewUrl) {
        revokeObjectUrlIfNeeded(prevPreviewUrl);
      }
      return file ? URL.createObjectURL(file) : '';
    });
  }, []);

  const handleThumbnailFileSelect = useCallback(
    (file: File) => {
      setThumbnail(file);
    },
    [setThumbnail]
  );

  const clearThumbnail = useCallback(() => {
    setThumbnail(null);
  }, [setThumbnail]);

  const closeMissingChallengeDialog = useCallback(() => {
    setIsMissingChallengeDialogDismissed(true);
  }, []);

  const closeCreateUnavailableDialog = useCallback(() => {
    setIsCreateUnavailableDialogOpen(false);
    setSelectedChallengeId(null);
    setAchievedGoalIds([]);
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!selectedChallenge || !trimmedTitle || isSubmitting) {
      return;
    }

    if (
      achievedDate &&
      (!isSelectableAchievedDate(achievedDate, selectedChallenge.startDate) ||
        disabledAchievedDateKeySet.has(formatDate(achievedDate)))
    ) {
      return;
    }

    try {
      if (isEditMode && requestedDiaryId) {
        await updateDiary.mutateAsync({
          id: requestedDiaryId,
          data: {
            challengeId: selectedChallenge.challengeId,
            title: trimmedTitle,
            content,
            feeling: selectedMood,
            isPublic,
            achievedDate: achievedDate ? formatDate(achievedDate) : '',
            achievedGoalIds,
          },
        });

        if (thumbnailFile) {
          await uploadDiaryImage.mutateAsync({
            id: requestedDiaryId,
            file: thumbnailFile,
          });
        }

        submitSuccessRef.current = true;
        router.push(`/diary/${requestedDiaryId}`);
        return;
      }

      const createdDiary = await createDiary.mutateAsync({
        challengeId: selectedChallenge.challengeId,
        title: trimmedTitle,
        content,
        feeling: selectedMood,
        isPublic,
        achievedDate: achievedDate ? formatDate(achievedDate) : '',
        achievedGoalIds,
      });

      if (thumbnailFile) {
        await uploadDiaryImage.mutateAsync({
          id: createdDiary.id,
          file: thumbnailFile,
        });
      }

      submitSuccessRef.current = true;
      router.push('/diary');
    } catch {
      toast.error('일지 저장 또는 썸네일 업로드에 실패했습니다.');
    }
  }, [
    achievedDate,
    achievedGoalIds,
    content,
    createDiary,
    disabledAchievedDateKeySet,
    isEditMode,
    isPublic,
    isSubmitting,
    router,
    requestedDiaryId,
    selectedChallenge,
    selectedMood,
    thumbnailFile,
    trimmedTitle,
    updateDiary,
    uploadDiaryImage,
  ]);

  const submitButtonLabel = getSubmitButtonLabel({
    isCreating: createDiary.isPending,
    isUpdating: updateDiary.isPending,
    isUploadingImage: uploadDiaryImage.isPending,
    isEditMode,
  });

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
    isPublic,
    setIsPublic,
    selectedChallenge,
    memberChallenges: ongoingMemberChallenges,
    isMemberChallengesLoading,
    isInitialChallengeLoading,
    isSelectedChallengeConfirmed,
    goals,
    achievedGoalIds,
    disabledAchievedDateKeys,
    thumbnailFile,
    thumbnailPreviewUrl,
    submitButtonLabel,
    canSubmit,
    isMissingChallengeDialogOpen,
    isCreateUnavailableDialogOpen,
    handleSelectChallenge,
    handleClearChallenge,
    handleGoalIdsChange,
    handleAchievedDateChange,
    handleThumbnailFileSelect,
    closeMissingChallengeDialog,
    closeCreateUnavailableDialog,
    clearThumbnail,
    handleSubmit,
  };
}
