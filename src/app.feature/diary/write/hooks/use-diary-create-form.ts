import { useRouter, useSearchParams } from 'next/navigation';
import type {
  Dispatch,
  SetStateAction,
} from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  useChallengeDetail,
  useMemberChallenges,
} from '../../../challenge/board/hooks/use-challenge-queries';
import type {
  ChallengeCategory,
  ChallengeGoal,
  ChallengeListItem,
  ChallengeType,
} from '../../../challenge/board/type/challenge';
import { useAllDiaries } from '../../board/hooks/use-diary-queries';
import type {
  ChallengeSummary as DiaryChallengeSummary,
  Feeling,
} from '../../board/type/diary';
import {
  useCreateDiary,
  useUploadDiaryImage,
} from '../../detail/hooks/use-diary-mutations';

const LOGGED_IN_MEMBER_ID = 1;

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

function toStartOfDay(date: Date): Date {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function isSelectableAchievedDate(date: Date): boolean {
  const today = toStartOfDay(new Date());
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 3);
  const targetDate = toStartOfDay(date);

  return targetDate >= minDate && targetDate <= today;
}

function normalizeChallengeCategory(category: string): ChallengeCategory {
  const categoryMap: Record<string, ChallengeCategory> = {
    ALL: 'ALL',
    DEV: 'DEV',
    HEALTH: 'HEALTH',
    STUDY: 'STUDY',
    EXERCISE: 'EXERCISE',
    HOBBY: 'HOBBY',
    OTHER: 'OTHER',
  };

  return categoryMap[category] ?? 'OTHER';
}

function normalizeChallengeType(challengeType: string): ChallengeType {
  return challengeType === 'FIXED' ? 'FIXED' : 'FLEXIBLE';
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
    challengeType: normalizeChallengeType(challenge.challengeType),
    participantCnt: challenge.participantCnt,
    liked: challenge.likeInfo.likedByMe,
    likeCnt: challenge.likeInfo.likeCnt,
  };
}

interface UseDiaryCreateFormResult {
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
  goals: ChallengeGoal[];
  achievedGoalIds: number[];
  thumbnailFile: File | null;
  thumbnailPreviewUrl: string;
  submitButtonLabel: string;
  canSubmit: boolean;
  isMissingChallengeDialogOpen: boolean;
  handleSelectChallenge(challenge: ChallengeListItem): void;
  handleClearChallenge(): void;
  handleGoalToggle(goalId: number, checked: boolean): void;
  handleAchievedDateChange(date: Date | undefined): void;
  handleThumbnailFileSelect(file: File): void;
  closeMissingChallengeDialog(): void;
  clearThumbnail(): void;
  handleSubmit(): Promise<void>;
}

export function useDiaryCreateForm(): UseDiaryCreateFormResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createDiary = useCreateDiary();
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
  const [achievedGoalIds, setAchievedGoalIds] = useState<number[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState('');

  const {
    data: myDiaries = [],
    isLoading: isMyDiariesLoading,
    isSuccess: isMyDiariesLoaded,
  } = useAllDiaries({
    enabled: requestedChallengeId !== null,
  });

  const requestedChallengeFromMyDiaries = useMemo(() => {
    if (requestedChallengeId === null) {
      return null;
    }

    const matchedDiary = myDiaries.find(
      (diary) => diary.challenge?.challengeId === requestedChallengeId
    );
    return matchedDiary?.challenge ?? null;
  }, [myDiaries, requestedChallengeId]);

  // TODO: 실제 로그인된 사용자의 memberId로 교체
  const { data: memberChallenges = [], isLoading: isMemberChallengesLoading } =
    useMemberChallenges({
      memberId: LOGGED_IN_MEMBER_ID,
    });
  const selectedChallenge = useMemo(() => {
    if (selectedChallengeId === null) {
      return null;
    }

    if (
      requestedChallengeId !== null &&
      selectedChallengeId === requestedChallengeId
    ) {
      if (!requestedChallengeFromMyDiaries) {
        return null;
      }

      const memberChallenge =
        memberChallenges.find(
          (challenge) => challenge.challengeId === selectedChallengeId
        ) ?? null;

      return (
        memberChallenge ??
        mapDiaryChallengeToChallengeListItem(requestedChallengeFromMyDiaries)
      );
    }

    const memberChallenge =
      memberChallenges.find(
        (challenge) => challenge.challengeId === selectedChallengeId
      ) ?? null;

    return memberChallenge;
  }, [
    memberChallenges,
    requestedChallengeFromMyDiaries,
    requestedChallengeId,
    selectedChallengeId,
  ]);

  const { data: challengeDetail } = useChallengeDetail(
    selectedChallenge?.challengeId ?? 0
  );
  const goals = challengeDetail?.challengeGoals ?? [];

  const isSubmitting = createDiary.isPending || uploadDiaryImage.isPending;
  const trimmedTitle = title.trim();
  const canSubmit =
    Boolean(selectedChallenge) && trimmedTitle.length > 0 && !isSubmitting;
  const isInitialChallengeLoading =
    requestedChallengeId !== null &&
    selectedChallengeId === requestedChallengeId &&
    (isMemberChallengesLoading || isMyDiariesLoading);
  const isMissingChallengeDialogOpen =
    requestedChallengeId !== null &&
    isMyDiariesLoaded &&
    !requestedChallengeFromMyDiaries &&
    !isMissingChallengeDialogDismissed;

  useEffect(
    () => () => {
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    },
    [thumbnailPreviewUrl]
  );

  const handleSelectChallenge = useCallback((challenge: ChallengeListItem) => {
    setSelectedChallengeId(challenge.challengeId);
    setAchievedGoalIds([]);
  }, []);

  const handleClearChallenge = useCallback(() => {
    setSelectedChallengeId(null);
    setAchievedGoalIds([]);
  }, []);

  const handleGoalToggle = useCallback((goalId: number, checked: boolean) => {
    setAchievedGoalIds((prev) => {
      if (!checked) {
        return prev.filter((id) => id !== goalId);
      }

      if (prev.includes(goalId)) {
        return prev;
      }

      return [...prev, goalId];
    });
  }, []);

  const handleAchievedDateChange = useCallback((date: Date | undefined) => {
    if (!date) {
      setAchievedDate(undefined);
      return;
    }

    if (!isSelectableAchievedDate(date)) {
      return;
    }

    setAchievedDate(date);
  }, []);

  const setThumbnail = useCallback((file: File | null) => {
    setThumbnailFile(file);
    setThumbnailPreviewUrl((prevPreviewUrl) => {
      if (prevPreviewUrl) {
        URL.revokeObjectURL(prevPreviewUrl);
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

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!selectedChallenge || !trimmedTitle || isSubmitting) {
      return;
    }

    try {
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

      router.push('/diary');
    } catch (error) {
      console.error('일지 작성/썸네일 업로드 중 오류가 발생했습니다.', error);
    }
  }, [
    achievedDate,
    achievedGoalIds,
    content,
    createDiary,
    isPublic,
    isSubmitting,
    router,
    selectedChallenge,
    selectedMood,
    thumbnailFile,
    trimmedTitle,
    uploadDiaryImage,
  ]);

  const submitButtonLabel = createDiary.isPending
    ? '작성 중...'
    : uploadDiaryImage.isPending
      ? '썸네일 업로드 중...'
      : '작성 완료';

  return {
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
    memberChallenges,
    isMemberChallengesLoading,
    isInitialChallengeLoading,
    goals,
    achievedGoalIds,
    thumbnailFile,
    thumbnailPreviewUrl,
    submitButtonLabel,
    canSubmit,
    isMissingChallengeDialogOpen,
    handleSelectChallenge,
    handleClearChallenge,
    handleGoalToggle,
    handleAchievedDateChange,
    handleThumbnailFileSelect,
    closeMissingChallengeDialog,
    clearThumbnail,
    handleSubmit,
  };
}
