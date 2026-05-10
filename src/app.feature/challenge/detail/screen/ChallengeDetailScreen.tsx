'use client';

import {
  Button,
  Card,
  CircleAvatar,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  GoalAddList,
  ScheduleCalendar,
  type ScheduleCalendarCell,
  SectionHeader,
  Tag,
  Text,
  TextField,
} from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { getCategoryLabel } from '@constants/categories';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/useDiaryMutations';
import { DiaryCreateUnavailableDialog } from '@feature/diary/write/components/DiaryCreateUnavailableDialog';
import { normalizeApiError, notifyApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Flame,
  Heart,
  Trash2,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useIsLoggedIn } from '../../../member/hooks/useIsLoggedIn';
import {
  useChallengeCheckWriteDates,
  useChallengeDetail,
} from '../../board/hooks/useChallengeQueries';
import {
  ChallengeGoal,
  Participant,
  ParticipantStatus,
} from '../../board/type/challenge';
import { isChallengeOngoing } from '../../board/utils/challengePeriod';
import { ChallengeDetailHero } from '../components/ChallengeDetailHero';
import { ChallengeDiaryGrid } from '../components/ChallengeDiaryGrid';
import { ChallengeProgressCard } from '../components/ChallengeProgressCard';
import { ExpandableText } from '../components/ExpandableText';
import { CHALLENGE_DETAIL_WEEK_LABELS } from '../consts/challengeDetailData';
import { useChallengeDiaryList } from '../hooks/useChallengeDiaryQueries';
import {
  useAcceptParticipant,
  useJoinChallenge,
  useLeaveChallenge,
  useLikeChallenge,
  useRejectParticipant,
  useUnlikeChallenge,
  useUpdateChallenge,
  useUpdateParticipantGoal,
} from '../hooks/useChallengeMutations';
import { ChallengeDiaryItem } from '../type/challengeDiary';
import {
  buildHeroGradient,
  getCategoryAccent,
} from '../utils/challengeAccent';

interface ChallengeDetailScreenProps {
  id: string;
}

const PARTICIPATING_STATUS: ParticipantStatus[] = [
  'HOST',
  'PARTICIPANT',
  'ACCEPTED',
];
const EMPTY_GOALS: ChallengeGoal[] = [];
const EMPTY_PARTICIPANTS: Participant[] = [];
const ENDLESS_MIN_YEAR = 2090;
const ENDLESS_LABEL = '무한!';

function getMonthLabel(monthDate: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
  }).format(monthDate);
}

function getChallengeTypeLabel(goalType: string): string {
  return formatChallengeTypeLabel(goalType);
}

function isEndlessChallengeEndDate(endDate: string): boolean {
  if (!endDate) {
    return false;
  }

  const parsedEndDate = new Date(endDate);
  if (Number.isNaN(parsedEndDate.getTime())) {
    return false;
  }

  return parsedEndDate.getUTCFullYear() >= ENDLESS_MIN_YEAR;
}

function formatDateRange(startDate: string, endDate: string): string {
  const format = (date: string): string => date.replaceAll('-', '.');
  if (isEndlessChallengeEndDate(endDate)) {
    return `${format(startDate)} ~ ${ENDLESS_LABEL}`;
  }

  return `${format(startDate)} ~ ${format(endDate)}`;
}

function getDdayLabel(endDate: string): string {
  if (isEndlessChallengeEndDate(endDate)) {
    return ENDLESS_LABEL;
  }

  const today = new Date();
  const end = new Date(endDate);
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const dayDiff = Math.ceil((end.getTime() - today.getTime()) / 86400000);

  if (dayDiff > 0) {
    return `D-${dayDiff}`;
  }
  if (dayDiff === 0) {
    return 'D-DAY';
  }
  return `D+${Math.abs(dayDiff)}`;
}

function getRemainingLabel(endDate: string): string {
  const ddayLabel = getDdayLabel(endDate);
  if (ddayLabel === ENDLESS_LABEL) {
    return '마감 없음';
  }
  if (ddayLabel === 'D-DAY') {
    return '오늘 마감';
  }
  if (ddayLabel.startsWith('D-')) {
    return `${ddayLabel.slice(2)}일 남음`;
  }
  return '챌린지 종료';
}

function formatDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

function hasSelectableDiaryDate(disabledDateKeys: string[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset <= 2; dayOffset += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() - dayOffset);

    if (!disabledDateKeys.includes(formatDateKey(candidate))) {
      return true;
    }
  }

  return false;
}

function formatRelativeJoinedText(status: ParticipantStatus): string {
  switch (status) {
    case 'PENDING':
      return '참여 승인 대기 중';
    case 'REJECTED':
      return '신청 거절됨';
    default:
      return '참여 중';
  }
}

function isSameDate(firstDate: Date, secondDate: Date): boolean {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function buildCalendarRows(
  baseMonth: Date,
  startDate: string,
  endDate: string
): ScheduleCalendarCell[][] {
  if (!startDate || !endDate) {
    return [];
  }

  const challengeStart = new Date(startDate);
  const challengeEnd = new Date(endDate);
  if (
    Number.isNaN(challengeStart.getTime()) ||
    Number.isNaN(challengeEnd.getTime())
  ) {
    return [];
  }
  challengeStart.setHours(0, 0, 0, 0);
  challengeEnd.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = baseMonth.getFullYear();
  const month = baseMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const totalVisibleCells =
    Math.ceil((firstWeekday + daysInCurrentMonth) / 7) * 7;
  const calendarCells: ScheduleCalendarCell[] = [];

  for (let cellIndex = 0; cellIndex < totalVisibleCells; cellIndex += 1) {
    if (cellIndex < firstWeekday) {
      const previousMonthDay =
        daysInPreviousMonth - firstWeekday + cellIndex + 1;
      calendarCells.push({
        day: previousMonthDay,
        muted: true,
      });
      continue;
    }

    const currentDay = cellIndex - firstWeekday + 1;
    if (currentDay > daysInCurrentMonth) {
      calendarCells.push({
        day: currentDay - daysInCurrentMonth,
        muted: true,
      });
      continue;
    }

    const currentDate = new Date(year, month, currentDay);
    currentDate.setHours(0, 0, 0, 0);
    const isInChallengePeriod =
      currentDate >= challengeStart && currentDate <= challengeEnd;
    const isToday = isSameDate(currentDate, today);

    calendarCells.push({
      day: currentDay,
      subtitle: isToday && isInChallengePeriod ? '오늘' : undefined,
      highlighted: isToday && isInChallengePeriod,
      muted: !isInChallengePeriod,
      bars:
        isInChallengePeriod && currentDate <= today
          ? [{ tone: 'main', width: '100%' }]
          : undefined,
    });
  }

  const calendarRows: ScheduleCalendarCell[][] = [];
  for (let rowIndex = 0; rowIndex < calendarCells.length; rowIndex += 7) {
    calendarRows.push(calendarCells.slice(rowIndex, rowIndex + 7));
  }

  return calendarRows;
}

function StatHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <Text size="heading2" weight="bold" className="text-gray-900">
        {title}
      </Text>
    </div>
  );
}

function PendingMemberItem({
  name,
  joinedAt,
  onAccept,
  onReject,
  isLoading,
}: {
  name: string;
  joinedAt: string;
  onAccept(): void;
  onReject(): void;
  isLoading: boolean;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-2 flex items-center justify-between',
        'border border-gray-200 bg-gray-100 px-3 py-2.5'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center',
            'rounded-full bg-gray-200 text-gray-500'
          )}
        >
          <UserRound className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <Text size="body2" weight="bold" className="text-gray-900">
            {name}
          </Text>
          <Text size="caption2" weight="regular" className="text-gray-500">
            {joinedAt}
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            'bg-main-200 text-main-800 flex h-8 w-8',
            'cursor-pointer items-center justify-center rounded-xl'
          )}
          aria-label="참여 승인"
          onClick={onAccept}
          disabled={isLoading}
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={cn(
            'flex h-8 w-8 cursor-pointer items-center justify-center',
            'rounded-xl bg-gray-200 text-gray-500'
          )}
          aria-label="참여 거절"
          onClick={onReject}
          disabled={isLoading}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ChallengeDetailScreen({
  id,
}: ChallengeDetailScreenProps): React.ReactElement {
  const challengeId = Number(id);
  const router = useRouter();

  const { data, isLoading, isError, error } = useChallengeDetail(challengeId);

  const joinChallenge = useJoinChallenge();
  const leaveChallenge = useLeaveChallenge();
  const likeChallenge = useLikeChallenge();
  const unlikeChallenge = useUnlikeChallenge();
  const acceptParticipant = useAcceptParticipant();
  const rejectParticipant = useRejectParticipant();
  const updateChallenge = useUpdateChallenge();
  const updateParticipantGoal = useUpdateParticipantGoal();
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();

  const isLoggedIn = useIsLoggedIn();
  const [dismissed, setDismissed] = useState(false);
  const showAuthDialog = !isLoggedIn && !dismissed;
  const [showDiaryLikeDialog, setShowDiaryLikeDialog] = useState(false);
  const [showCreateUnavailableDialog, setShowCreateUnavailableDialog] =
    useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [showFreeGoalModal, setShowFreeGoalModal] = useState(false);
  const [freeGoalInputs, setFreeGoalInputs] = useState<string[]>(['']);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [editGoalInputs, setEditGoalInputs] = useState<string[]>(['']);
  const [showEditChallengeGoalsModal, setShowEditChallengeGoalsModal] =
    useState(false);
  interface ChallengeGoalEntry {
    id: string;
    value: string;
  }
  const createGoalEntry = (value = ''): ChallengeGoalEntry => ({
    id: crypto.randomUUID(),
    value,
  });
  const [challengeGoalInputs, setChallengeGoalInputs] = useState<
    ChallengeGoalEntry[]
  >(() => [createGoalEntry()]);

  const { data: challengeDiariesData, isLoading: isDiariesLoading } =
    useChallengeDiaryList(challengeId, 8);

  const summary = data?.challengeSummary;
  const detail = data?.challengeDetail;
  const goals = data?.challengeGoals ?? EMPTY_GOALS;
  const participants = data?.participants ?? EMPTY_PARTICIPANTS;

  const participationRate =
    Math.round(
      Math.min(100, Math.max(0, detail?.participationRate ?? 0)) * 10
    ) / 10;
  const goalCompletionRate =
    Math.round(
      Math.min(100, Math.max(0, detail?.goalCompletionRate ?? 0)) * 10
    ) / 10;

  const pendingParticipants = useMemo(
    () =>
      participants.filter((participant) => participant.status === 'PENDING'),
    [participants]
  );

  const activeParticipants = useMemo(
    () =>
      participants.filter((participant) =>
        PARTICIPATING_STATUS.includes(participant.status)
      ),
    [participants]
  );

  const myStatus = detail?.myStatus ?? 'NONE';
  const isHost = myStatus === 'HOST';
  const isPending = myStatus === 'PENDING';
  const isParticipating = PARTICIPATING_STATUS.includes(myStatus);
  const canJoinByStatus = myStatus === 'NONE' || myStatus === 'REJECTED';
  const isFreeChallenge = summary?.goalType === 'FLEXIBLE';

  const monthLabel = useMemo(
    () => getMonthLabel(calendarMonth),
    [calendarMonth]
  );
  const summaryStartDate = summary?.startDate ?? '';
  const summaryEndDate = summary?.endDate ?? '';
  const summaryMaxParticipantCnt = summary?.maxParticipantCnt ?? 0;
  const summaryParticipantCnt = summary?.participantCnt ?? 0;
  const isChallengeCurrentlyOngoing = isChallengeOngoing(
    summaryStartDate,
    summaryEndDate
  );
  const isEndless = isEndlessChallengeEndDate(summaryEndDate);
  // 챌린지 시작 여부 (시작일이 오늘 이전이면 시작된 것으로 간주)
  const isChallengeStarted =
    isChallengeCurrentlyOngoing ||
    (summaryStartDate ? new Date() >= new Date(summaryStartDate) : false);
  const {
    data: challengeCheckWriteDateKeys = [],
    isLoading: isCheckWriteDatesLoading,
  } = useChallengeCheckWriteDates(
    challengeId,
    isParticipating && isChallengeCurrentlyOngoing
  );
  const hasWritableRecentDiaryDate = useMemo(
    () => hasSelectableDiaryDate(challengeCheckWriteDateKeys),
    [challengeCheckWriteDateKeys]
  );
  const canJoin = canJoinByStatus && summaryMaxParticipantCnt > 1;
  const calendarRows = useMemo(
    () => buildCalendarRows(calendarMonth, summaryStartDate, summaryEndDate),
    [calendarMonth, summaryEndDate, summaryStartDate]
  );
  const previewDiaries = challengeDiariesData?.items ?? [];
  const hasMoreDiaries =
    challengeDiariesData?.pageInfo.hasNextPage ?? false;

  const isActionLoading =
    joinChallenge.isPending ||
    leaveChallenge.isPending ||
    likeChallenge.isPending ||
    unlikeChallenge.isPending;

  const handleJoinChallenge = (): void => {
    if (summaryMaxParticipantCnt <= 1) {
      toast.error('최대 참여 인원이 2명 이상인 챌린지만 신청할 수 있습니다.');
      return;
    }

    if (isFreeChallenge) {
      setFreeGoalInputs([]);
      setShowFreeGoalModal(true);
      return;
    }

    const goalContents = goals.map((goal) => goal.content);
    joinChallenge.mutate(
      { challengeId, data: goalContents },
      {
        onSuccess: () => {
          toast.success('챌린지 참여 신청이 완료되었습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      }
    );
  };

  const handleFreeGoalSubmit = (): void => {
    const validGoals = freeGoalInputs
      .map((goal) => goal.trim())
      .filter(Boolean);
    if (validGoals.length === 0) {
      toast.error('목표를 최소 1개 이상 입력해 주세요.');
      return;
    }
    joinChallenge.mutate(
      { challengeId, data: validGoals },
      {
        onSuccess: () => {
          setShowFreeGoalModal(false);
          toast.success('챌린지 참여 신청이 완료되었습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      }
    );
  };

  const handleLeaveChallenge = (): void => {
    leaveChallenge.mutate(challengeId, {
      onSuccess: () => {
        toast.success('챌린지에서 나갔습니다.');
      },
      onError: (mutationError) => {
        notifyApiError(mutationError);
      },
    });
  };

  const handleToggleLike = (): void => {
    if (!summary) {
      return;
    }

    if (summary.likeInfo.likedByMe) {
      unlikeChallenge.mutate(challengeId, {
        onSuccess: () => {
          toast.success('챌린지 좋아요 취소 성공했습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      });
      return;
    }

    likeChallenge.mutate(challengeId, {
      onSuccess: () => {
        toast.success('챌린지 좋아요 성공했습니다.');
      },
      onError: (mutationError) => {
        notifyApiError(mutationError);
      },
    });
  };

  const handleDiaryCreateClick = (): void => {
    if (!isChallengeCurrentlyOngoing || isCheckWriteDatesLoading) {
      return;
    }

    if (!hasWritableRecentDiaryDate) {
      setShowCreateUnavailableDialog(true);
      return;
    }

    router.push(`/diary/create?challengeId=${id}`);
  };

  const handleAcceptParticipant = (participantId: number): void => {
    acceptParticipant.mutate(participantId, {
      onSuccess: () => {
        toast.success('참여 신청을 수락했습니다.');
      },
      onError: (mutationError) => {
        notifyApiError(mutationError);
      },
    });
  };

  const handleRejectParticipant = (participantId: number): void => {
    rejectParticipant.mutate(participantId, {
      onSuccess: () => {
        toast.success('참여 신청을 거절했습니다.');
      },
      onError: (mutationError) => {
        notifyApiError(mutationError);
      },
    });
  };

  const handleOpenEditGoalModal = (): void => {
    setEditGoalInputs(['']);
    setShowEditGoalModal(true);
  };

  const handleEditGoalSubmit = (): void => {
    const validGoals = editGoalInputs
      .map((goalInput) => goalInput.trim())
      .filter(Boolean);
    if (validGoals.length === 0) {
      toast.error('목표를 최소 1개 이상 입력해 주세요.');
      return;
    }
    updateParticipantGoal.mutate(
      { challengeId, goals: validGoals },
      {
        onSuccess: () => {
          setShowEditGoalModal(false);
          toast.success('목표가 수정되었습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      }
    );
  };

  const handleOpenEditChallengeGoalsModal = (): void => {
    const currentGoals = goals.map((goal) => createGoalEntry(goal.content));
    setChallengeGoalInputs(
      currentGoals.length > 0 ? currentGoals : [createGoalEntry()]
    );
    setShowEditChallengeGoalsModal(true);
  };

  const handleEditChallengeGoalsSubmit = (): void => {
    const validGoals = challengeGoalInputs
      .map((goalInput) => goalInput.value.trim())
      .filter(Boolean);
    if (validGoals.length === 0) {
      toast.error('목표를 최소 1개 이상 입력해 주세요.');
      return;
    }
    updateChallenge.mutate(
      { challengeId, data: { goals: validGoals } },
      {
        onSuccess: () => {
          setShowEditChallengeGoalsModal(false);
          toast.success('챌린지 목표가 수정되었습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      }
    );
  };

  const handleDiaryLikeToggle = (diary: ChallengeDiaryItem): void => {
    if (!isLoggedIn) {
      setShowDiaryLikeDialog(true);
      return;
    }
    if (likeDiary.isPending || unlikeDiary.isPending) {
      return;
    }
    if (diary.likeInfo.likedByMe) {
      unlikeDiary.mutate(diary.id);
    } else {
      likeDiary.mutate(diary.id);
    }
  };

  const authDialog = (
    <LoginRequiredDialog
      open={showAuthDialog}
      onOpenChange={(open) => {
        if (!open) {
          setDismissed(true);
        }
      }}
      title="간편 가입 후에 둘러보세요!"
      description="챌린지 상세는 로그인 후 이용할 수 있습니다."
    />
  );

  if (isLoading) {
    return (
      <>
        {authDialog}
        <div
          className={cn(
            'flex min-h-[60vh] w-full items-center justify-center',
            'bg-white'
          )}
        >
          <Text size="body1" weight="medium" className="text-gray-500">
            상세 정보를 불러오는 중입니다...
          </Text>
        </div>
      </>
    );
  }

  if (isError || !summary || !detail) {
    return (
      <>
        {authDialog}
        <div
          className={cn(
            'flex min-h-[60vh] w-full items-center justify-center',
            'bg-white px-4'
          )}
        >
          <Text size="body1" weight="medium" className="text-red-600">
            {error
              ? normalizeApiError(error).message
              : '챌린지 상세 정보를 불러오지 못했습니다.'}
          </Text>
        </div>
      </>
    );
  }

  const accentColor = getCategoryAccent(summary.category);
  const heroGradient = buildHeroGradient(accentColor);
  const dateRangeText = formatDateRange(
    summary.startDate,
    summary.endDate
  );
  const remainingLabel = getRemainingLabel(summary.endDate);
  const participantsLabel =
    summaryMaxParticipantCnt > 1
      ? `${summaryParticipantCnt}/${summaryMaxParticipantCnt}명 참여`
      : '개인 챌린지';
  const heroMetaLabel = `${participantsLabel} · ${remainingLabel}`;

  // CTA 결정 로직: 호스트 / 참여 중 / 대기 / 신청 가능 / 신청 불가
  const ctaConfig = ((): {
    label: string;
    onClick(): void;
    disabled: boolean;
    variant: 'default' | 'outlined';
    show: boolean;
  } => {
    if (isHost) {
      return {
        label: '챌린지 수정',
        onClick: () => router.push(`/challenge/${id}/edit`),
        disabled: false,
        variant: 'outlined',
        show: true,
      };
    }
    if (isParticipating) {
      return {
        label: isChallengeCurrentlyOngoing
          ? '일지 작성하기'
          : '진행 중이 아닙니다',
        onClick: handleDiaryCreateClick,
        disabled: !isChallengeCurrentlyOngoing || isCheckWriteDatesLoading,
        variant: 'default',
        show: true,
      };
    }
    if (isPending) {
      return {
        label: '참여 승인 대기중',
        onClick: () => undefined,
        disabled: true,
        variant: 'outlined',
        show: true,
      };
    }
    if (canJoin) {
      return {
        label: '챌린지 참여하기',
        onClick: handleJoinChallenge,
        disabled: joinChallenge.isPending,
        variant: 'default',
        show: true,
      };
    }
    return {
      label: '참여 불가',
      onClick: () => undefined,
      disabled: true,
      variant: 'outlined',
      show: false,
    };
  })();

  const freeGoalModal = (
    <Dialog open={showFreeGoalModal} onOpenChange={setShowFreeGoalModal}>
      <DialogContent className="gap-5 px-6 py-6 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>내 목표 입력</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Text size="body2" weight="regular" className="text-gray-500">
            챌린지에서 달성할 목표를 입력하고 Enter를 눌러 추가해 주세요.
          </Text>
          <GoalAddList
            goals={freeGoalInputs}
            onGoalsChange={setFreeGoalInputs}
            placeholder="목표를 입력하고 Enter를 눌러 추가하세요"
            inputAriaLabel="목표 입력"
            maxGoals={5}
          />
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button
            size="medium"
            variant="ghost"
            className="flex-1"
            onClick={() => setShowFreeGoalModal(false)}
          >
            취소
          </Button>
          <Button
            size="medium"
            className="flex-1"
            disabled={joinChallenge.isPending}
            onClick={handleFreeGoalSubmit}
          >
            {joinChallenge.isPending ? '처리 중...' : '참여 신청'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const editGoalModal = (
    <Dialog open={showEditGoalModal} onOpenChange={setShowEditGoalModal}>
      <DialogContent className="gap-5 px-6 py-6 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>내 목표 수정</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Text size="body2" weight="regular" className="text-gray-500">
            새 목표를 입력하고 Enter를 눌러 추가해 주세요.
          </Text>
          <GoalAddList
            goals={editGoalInputs}
            onGoalsChange={setEditGoalInputs}
            placeholder="목표를 입력하고 Enter를 눌러 추가하세요"
            inputAriaLabel="목표 입력"
            maxGoals={5}
          />
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button
            size="medium"
            variant="ghost"
            className="flex-1"
            onClick={() => setShowEditGoalModal(false)}
          >
            취소
          </Button>
          <Button
            size="medium"
            className="flex-1"
            disabled={updateParticipantGoal.isPending}
            onClick={handleEditGoalSubmit}
          >
            {updateParticipantGoal.isPending ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const editChallengeGoalsModal = (
    <Dialog
      open={showEditChallengeGoalsModal}
      onOpenChange={setShowEditChallengeGoalsModal}
    >
      <DialogContent className="gap-5 px-6 py-6 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>챌린지 목표 수정</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Text size="body2" weight="regular" className="text-gray-500">
            챌린지 시작 전에만 목표를 수정할 수 있습니다.
          </Text>
          <div className="flex flex-col gap-2">
            {challengeGoalInputs.map((goal) => (
              <div key={goal.id} className="flex items-center gap-2">
                <TextField
                  value={goal.value}
                  onChange={(event) => {
                    setChallengeGoalInputs((prev) =>
                      prev.map((entry) =>
                        entry.id === goal.id
                          ? { ...entry, value: event.target.value }
                          : entry
                      )
                    );
                  }}
                  placeholder="목표를 입력하세요"
                  className="flex-1"
                  maxLength={100}
                />
                <button
                  type="button"
                  aria-label="목표 삭제"
                  className={cn(
                    'flex h-10 w-10 shrink-0 cursor-pointer',
                    'items-center justify-center rounded-lg text-gray-500',
                    'transition-colors hover:bg-gray-100 hover:text-red-600'
                  )}
                  onClick={() => {
                    setChallengeGoalInputs((prev) =>
                      prev.filter((entry) => entry.id !== goal.id)
                    );
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="outlined"
            size="small"
            type="button"
            disabled={challengeGoalInputs.length >= 10}
            onClick={() =>
              setChallengeGoalInputs((prev) => [...prev, createGoalEntry()])
            }
          >
            + 목표 추가
          </Button>
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button
            size="medium"
            variant="ghost"
            className="flex-1"
            onClick={() => setShowEditChallengeGoalsModal(false)}
          >
            취소
          </Button>
          <Button
            size="medium"
            className="flex-1"
            disabled={updateChallenge.isPending}
            onClick={handleEditChallengeGoalsSubmit}
          >
            {updateChallenge.isPending ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen w-full bg-white pb-12">
      {authDialog}
      {freeGoalModal}
      {editGoalModal}
      {editChallengeGoalsModal}
      <DiaryCreateUnavailableDialog
        open={showCreateUnavailableDialog}
        onOpenChange={setShowCreateUnavailableDialog}
      />
      <LoginRequiredDialog
        open={showDiaryLikeDialog}
        onOpenChange={setShowDiaryLikeDialog}
      />
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1200px] flex-col gap-6',
          'px-4 pt-4 md:px-6 lg:px-8'
        )}
      >
        <ChallengeDetailHero
          title={summary.title}
          categoryLabel={getCategoryLabel(summary.category)}
          typeLabel={`${getChallengeTypeLabel(summary.goalType)} 챌린지`}
          metaLabel={heroMetaLabel}
          imageUrl={summary.thumbnailImage ?? undefined}
          accent={accentColor}
          gradient={heroGradient}
        />

        <ChallengeProgressCard
          progressPercent={participationRate}
          participantsLabel={participantsLabel}
          remainingLabel={`${dateRangeText}`}
          ctaLabel={ctaConfig.label}
          onCtaClick={ctaConfig.onClick}
          ctaDisabled={ctaConfig.disabled}
          ctaVariant={ctaConfig.variant}
          showCta={ctaConfig.show}
          isInfinite={isEndless}
        />

        {/* 챌린지 소개 */}
        <Card radius="lg" className="p-5 md:p-6">
          <SectionHeader title="챌린지 소개" />
          <div className="mt-3">
            <ExpandableText>{detail.description}</ExpandableText>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <Tag tone="brand" size="sm">
              {getCategoryLabel(summary.category)}
            </Tag>
            <Tag tone="gray" size="sm">
              {getChallengeTypeLabel(summary.goalType)}
            </Tag>
          </div>
        </Card>

        {/* 호스트: 대기 인원 */}
        {isHost ? (
          <Card radius="lg" className="border-main-300 p-5 md:p-6">
            <div className="flex items-center gap-2">
              <CircleAlert className="text-main-800 h-5 w-5" />
              <Text size="heading2" weight="bold" className="text-gray-900">
                참여 인원 대기
              </Text>
              <span
                className={cn(
                  'bg-main-200 text-main-800',
                  'text-caption1 rounded-full px-2 py-0.5 font-bold'
                )}
              >
                {pendingParticipants.length}명
              </span>
            </div>

            {pendingParticipants.length > 0 ? (
              <div
                className={cn(
                  'mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3'
                )}
              >
                {pendingParticipants.map((participant) => (
                  <PendingMemberItem
                    key={participant.participantId}
                    name={participant.nickname}
                    joinedAt={formatRelativeJoinedText(participant.status)}
                    onAccept={() =>
                      handleAcceptParticipant(participant.participantId)
                    }
                    onReject={() =>
                      handleRejectParticipant(participant.participantId)
                    }
                    isLoading={
                      acceptParticipant.isPending ||
                      rejectParticipant.isPending
                    }
                  />
                ))}
              </div>
            ) : (
              <Text
                size="body2"
                weight="regular"
                className="mt-3 text-gray-500"
              >
                현재 대기 중인 참여 신청이 없습니다.
              </Text>
            )}
          </Card>
        ) : null}

        {/* 통계 + 사이드: 메인 콘텐츠 */}
        <div
          className={cn(
            'grid grid-cols-1 gap-6',
            'lg:grid-cols-[minmax(0,1fr)_320px]'
          )}
        >
          {/* 좌측: 통계 + 캘린더 */}
          <div className="flex min-w-0 flex-col gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card radius="lg" className="p-5">
                <StatHeader
                  icon={
                    <span className="text-main-800 pb-1.5 text-3xl">◔</span>
                  }
                  title="챌린지 참여율"
                />
                <div className="mt-4 flex items-center gap-4">
                  <CircularProgress
                    value={participationRate}
                    size="lg"
                    showPercentage
                  />
                  <div className="min-w-0 flex-1">
                    <Text
                      size="body2"
                      weight="bold"
                      className="text-gray-900"
                    >
                      {participationRate}%
                    </Text>
                    <Text
                      size="caption1"
                      weight="regular"
                      className="mt-1 text-gray-500"
                    >
                      챌린지 전체 참여율 지표입니다.
                    </Text>
                  </div>
                </div>
              </Card>

              <Card radius="lg" className="p-5">
                <StatHeader
                  icon={<Flame className="text-main-800 h-5 w-5" />}
                  title="목표 달성률"
                />
                <div className="mt-4 flex items-center gap-4">
                  <CircularProgress
                    value={goalCompletionRate}
                    size="lg"
                    showPercentage
                  />
                  <div className="min-w-0 flex-1">
                    <Text
                      size="body2"
                      weight="bold"
                      className="text-gray-900"
                    >
                      {goalCompletionRate}%
                    </Text>
                    <Text
                      size="caption1"
                      weight="regular"
                      className="mt-1 text-gray-500"
                    >
                      챌린지 목표 달성률 지표입니다.
                    </Text>
                  </div>
                </div>
              </Card>
            </div>

            {/* 활동 캘린더 */}
            <Card radius="lg" className="p-5 md:p-6">
              <div className="mb-3 flex items-center justify-between">
                <StatHeader
                  icon={<CalendarDays className="text-main-800 h-5 w-5" />}
                  title="활동 캘린더"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={cn(
                      'cursor-pointer rounded-full border border-gray-200',
                      'p-1.5 text-gray-600 transition hover:bg-gray-100'
                    )}
                    aria-label="이전 달"
                    onClick={() =>
                      setCalendarMonth(
                        (prevMonth) =>
                          new Date(
                            prevMonth.getFullYear(),
                            prevMonth.getMonth() - 1,
                            1
                          )
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <Text
                    size="body2"
                    weight="bold"
                    className="min-w-[120px] text-center text-gray-700"
                  >
                    {monthLabel}
                  </Text>
                  <button
                    type="button"
                    className={cn(
                      'cursor-pointer rounded-full border border-gray-200',
                      'p-1.5 text-gray-600 transition hover:bg-gray-100'
                    )}
                    aria-label="다음 달"
                    onClick={() =>
                      setCalendarMonth(
                        (prevMonth) =>
                          new Date(
                            prevMonth.getFullYear(),
                            prevMonth.getMonth() + 1,
                            1
                          )
                      )
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <ScheduleCalendar
                rows={calendarRows}
                weekLabels={CHALLENGE_DETAIL_WEEK_LABELS}
                cellMinHeight={88}
              />
            </Card>
          </div>

          {/* 우측: 좋아요 + 참여자 + 목표 */}
          <aside className="flex min-w-0 flex-col gap-6">
            <Card radius="lg" className="p-5">
              <Text size="caption1" weight="bold" className="text-gray-500">
                ACTIONS
              </Text>
              <div className="mt-3 flex flex-col gap-2.5">
                <Button
                  variant={
                    summary.likeInfo.likedByMe ? 'default' : 'outlined'
                  }
                  size="large"
                  className="w-full"
                  disabled={isActionLoading}
                  onClick={handleToggleLike}
                >
                  <Heart
                    className={cn(
                      'mr-1 h-4 w-4',
                      summary.likeInfo.likedByMe && 'fill-current'
                    )}
                  />
                  {summary.likeInfo.likedByMe ? '좋아요 취소' : '좋아요'} (
                  {summary.likeInfo.likeCnt})
                </Button>
                {!isHost && isParticipating ? (
                  <Button
                    variant="outlined"
                    size="large"
                    className="w-full"
                    onClick={handleLeaveChallenge}
                    disabled={leaveChallenge.isPending}
                  >
                    챌린지 나가기
                  </Button>
                ) : null}
              </div>
            </Card>

            <Card radius="lg" className="p-5">
              <Text size="heading2" weight="bold" className="text-gray-900">
                참여자
              </Text>
              <div
                className={cn('mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4')}
              >
                {activeParticipants.map((participant) => {
                  const highlighted = participant.status === 'HOST';
                  return (
                    <button
                      key={participant.participantId}
                      type="button"
                      onClick={() =>
                        router.push(`/member/${participant.memberId}`)
                      }
                      className={cn(
                        'flex cursor-pointer flex-col items-center gap-2',
                        'rounded-2xl p-2 transition-colors duration-150',
                        'hover:bg-gray-100'
                      )}
                    >
                      <div className="relative">
                        <div
                          className={cn(
                            'flex h-12 w-12 items-center justify-center',
                            'overflow-hidden rounded-full border',
                            highlighted
                              ? 'border-main-700'
                              : 'border-gray-200'
                          )}
                        >
                          <CircleAvatar
                            imageUrl={participant.profileImg || undefined}
                            size="md"
                          />
                        </div>
                        {highlighted ? (
                          <span
                            className={cn(
                              'bg-main-800 absolute -bottom-1 left-1/2',
                              '-translate-x-1/2 rounded-full px-1.5 py-0.5',
                              'text-[9px] leading-none font-bold text-white'
                            )}
                          >
                            HOST
                          </span>
                        ) : null}
                      </div>
                      <Text
                        size="caption2"
                        weight="medium"
                        className="text-gray-700"
                      >
                        {participant.nickname}
                      </Text>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card radius="lg" className="p-5">
              <div className="flex items-center justify-between gap-2">
                <Text
                  size="heading2"
                  weight="bold"
                  className="text-gray-900"
                >
                  챌린지 목표
                </Text>
                {isHost && !isChallengeStarted && !isFreeChallenge ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleOpenEditChallengeGoalsModal}
                  >
                    수정
                  </Button>
                ) : null}
                {!isHost &&
                isFreeChallenge &&
                isParticipating &&
                !isChallengeStarted ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleOpenEditGoalModal}
                  >
                    내 목표 수정
                  </Button>
                ) : null}
              </div>
              {isFreeChallenge ? (
                <Text
                  size="body2"
                  weight="regular"
                  className="mt-3 text-gray-500"
                >
                  자유 목표 챌린지입니다.
                  <br />
                  참여 신청 시 나만의 목표를 직접 입력할 수 있습니다.
                </Text>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {goals.map((goal) => (
                    <div
                      key={goal.challengeGoalId}
                      className={cn(
                        'rounded-2 border border-gray-200',
                        'bg-gray-100 p-3'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className="text-main-800 mt-1">
                          <Check className="h-4 w-4" />
                        </div>
                        <Text
                          size="body2"
                          weight="bold"
                          className="text-gray-900"
                        >
                          {goal.content}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </aside>
        </div>

        {/* 참여자 일지 */}
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="참여자 일지"
            subtitle="이 챌린지에서 작성된 최근 일지입니다"
            actionLabel={hasMoreDiaries ? '전체 보기 →' : undefined}
            onActionClick={
              hasMoreDiaries
                ? () => router.push(`/challenge/${id}/diary`)
                : undefined
            }
          />
          <ChallengeDiaryGrid
            diaries={previewDiaries}
            isLoading={isDiariesLoading}
            onDiaryClick={(diaryId) => router.push(`/diary/${diaryId}`)}
            onLikeToggle={handleDiaryLikeToggle}
          />
          {hasMoreDiaries ? (
            <div className="mt-2 flex justify-center">
              <Link
                href={`/challenge/${id}/diary`}
                className={cn(
                  'text-main-800 text-sm font-semibold',
                  'hover:underline'
                )}
              >
                전체 보기
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
