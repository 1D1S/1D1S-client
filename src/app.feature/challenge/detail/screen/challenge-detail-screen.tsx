'use client';

import {
  Button,
  CircleAvatar,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DiaryCard,
  ScheduleCalendar,
  type ScheduleCalendarCell,
  Text,
} from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/login-required-dialog';
import { getCategoryLabel } from '@constants/categories';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challenge-display';
import { Feeling } from '@feature/diary/board/type/diary';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/use-diary-mutations';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diary-image-url';
import { getRelativeDiaryDateLabel } from '@feature/diary/shared/utils/diary-relative-time';
import { DiaryCreateUnavailableDialog } from '@feature/diary/write/components/diary-create-unavailable-dialog';
import { normalizeApiError, notifyApiError } from '@module/api/error';
import { authStorage } from '@module/utils/auth';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Flame,
  Heart,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';

import {
  useChallengeCheckWriteDates,
  useChallengeDetail,
} from '../../board/hooks/use-challenge-queries';
import {
  ChallengeGoal,
  Participant,
  ParticipantStatus,
} from '../../board/type/challenge';
import { isChallengeOngoing } from '../../board/utils/challenge-period';
import { ExpandableText } from '../components/expandable-text';
import { CHALLENGE_DETAIL_WEEK_LABELS } from '../consts/challenge-detail-data';
import { useChallengeDiaryList } from '../hooks/use-challenge-diary-queries';
import {
  useAcceptParticipant,
  useJoinChallenge,
  useLeaveChallenge,
  useLikeChallenge,
  useRejectParticipant,
  useUnlikeChallenge,
} from '../hooks/use-challenge-mutations';
import { ChallengeDiaryItem } from '../type/challenge-diary';

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

function getChallengeTypeLabel(challengeType: string): string {
  return formatChallengeTypeLabel(challengeType);
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
  rightText,
}: {
  icon: React.ReactNode;
  title: string;
  rightText?: string;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <Text size="heading2" weight="bold" className="text-gray-900">
          {title}
        </Text>
      </div>
      {rightText ? (
        <Text size="body1" weight="bold" className="text-main-800">
          {rightText}
        </Text>
      ) : null}
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
    <div className="rounded-2 flex items-center justify-between border border-gray-200 bg-gray-100 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500">
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
          className="bg-main-200 text-main-800 flex h-8 w-8 items-center justify-center rounded-xl"
          aria-label="참여 승인"
          onClick={onAccept}
          disabled={isLoading}
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-200 text-gray-500"
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
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();

  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [dismissed, setDismissed] = useState(false);
  const showAuthDialog = hasMounted && !authStorage.hasTokens() && !dismissed;
  const [showDiaryLikeDialog, setShowDiaryLikeDialog] = useState(false);
  const [showCreateUnavailableDialog, setShowCreateUnavailableDialog] =
    useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [showFreeGoalModal, setShowFreeGoalModal] = useState(false);
  const [freeGoalInputs, setFreeGoalInputs] = useState<string[]>(['']);

  const { data: challengeDiaries, isLoading: isDiariesLoading } =
    useChallengeDiaryList(challengeId);

  const summary = data?.challengeSummary;
  const detail = data?.challengeDetail;
  const goals = data?.challengeGoals ?? EMPTY_GOALS;
  const participants = data?.participants ?? EMPTY_PARTICIPANTS;

  const participationRate = Math.min(
    100,
    Math.max(0, detail?.participationRate ?? 0)
  );
  const goalCompletionRate =
    Math.round(
      Math.min(100, Math.max(0, detail?.goalCompletionRate ?? 0)) * 100
    ) / 100;

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
  const isFreeChallenge = summary?.challengeType === 'FLEXIBLE';

  const monthLabel = useMemo(
    () => getMonthLabel(calendarMonth),
    [calendarMonth]
  );
  const summaryStartDate = summary?.startDate ?? '';
  const summaryEndDate = summary?.endDate ?? '';
  const summaryDdayLabel = getDdayLabel(summaryEndDate);
  const summaryMaxParticipantCnt = summary?.maxParticipantCnt ?? 0;
  const isChallengeCurrentlyOngoing = isChallengeOngoing(
    summaryStartDate,
    summaryEndDate
  );
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
  const previewDiaries = useMemo(
    () => (challengeDiaries ?? []).slice(0, 10),
    [challengeDiaries]
  );

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
      setFreeGoalInputs(['']);
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
        onError: (error) => {
          notifyApiError(error);
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
        onError: (error) => {
          notifyApiError(error);
        },
      }
    );
  };

  const handleLeaveChallenge = (): void => {
    leaveChallenge.mutate(challengeId, {
      onSuccess: () => {
        toast.success('챌린지에서 탈퇴했습니다.');
      },
      onError: (error) => {
        notifyApiError(error);
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
        onError: (error) => {
          notifyApiError(error);
        },
      });
      return;
    }

    likeChallenge.mutate(challengeId, {
      onSuccess: () => {
        toast.success('챌린지 좋아요 성공했습니다.');
      },
      onError: (error) => {
        notifyApiError(error);
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
      onError: (error) => {
        notifyApiError(error);
      },
    });
  };

  const handleRejectParticipant = (participantId: number): void => {
    rejectParticipant.mutate(participantId, {
      onSuccess: () => {
        toast.success('참여 신청을 거절했습니다.');
      },
      onError: (error) => {
        notifyApiError(error);
      },
    });
  };

  const handleDiaryLikeToggle = (diary: ChallengeDiaryItem): void => {
    if (!authStorage.hasTokens()) {
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

  function mapFeelingToEmotion(feeling: Feeling): 'happy' | 'soso' | 'sad' {
    if (feeling === 'HAPPY') {
      return 'happy';
    }
    if (feeling === 'SAD') {
      return 'sad';
    }
    return 'soso';
  }

  const renderActionsSection = (): React.ReactElement => (
    <section className="rounded-4 border border-gray-200 bg-white p-5">
      <Text size="caption1" weight="bold" className="text-gray-500">
        ACTIONS
      </Text>
      <div className="mt-3 flex flex-col gap-2.5">
        {isParticipating ? (
          <Button
            size="large"
            className="w-full"
            disabled={!isChallengeCurrentlyOngoing || isCheckWriteDatesLoading}
            onClick={handleDiaryCreateClick}
          >
            {isChallengeCurrentlyOngoing
              ? '일지 작성하기'
              : '진행 중일 때만 일지 작성 가능'}
          </Button>
        ) : null}

        <Button
          variant={summary!.likeInfo.likedByMe ? 'default' : 'outlined'}
          size="large"
          className="w-full"
          disabled={isActionLoading}
          asChild
        >
          <button type="button" onClick={handleToggleLike}>
            <Heart
              className={`h-4 w-4 ${summary!.likeInfo.likedByMe ? 'fill-current' : ''}`}
            />
            {summary!.likeInfo.likedByMe ? '좋아요 취소' : '좋아요'} (
            {summary!.likeInfo.likeCnt})
          </button>
        </Button>

        {!isHost && canJoin ? (
          <Button
            variant="outlined"
            size="large"
            className="w-full"
            onClick={handleJoinChallenge}
            disabled={joinChallenge.isPending}
          >
            챌린지 참여 신청
          </Button>
        ) : null}

        {!isHost && isPending ? (
          <Button variant="outlined" size="large" className="w-full" disabled>
            참여 승인 대기중
          </Button>
        ) : null}

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
    </section>
  );

  const renderParticipationStatusSection = (): React.ReactElement => (
    <section className="rounded-4 border border-gray-200 bg-white p-5">
      <Text size="heading2" weight="bold" className="text-gray-900">
        참여 현황
      </Text>
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between">
          <Text size="body2" weight="medium" className="text-gray-600">
            참여자
          </Text>
          {summary!.maxParticipantCnt === 0 ? (
            <Text size="body1" weight="bold" className="text-gray-900">
              개인 챌린지
            </Text>
          ) : (
            <Text size="body1" weight="bold" className="text-gray-900">
              {summary!.participantCnt} / {summary!.maxParticipantCnt}
            </Text>
          )}
        </div>
        {summary!.maxParticipantCnt > 0 && (
          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="bg-mint-800 h-full rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (summary!.participantCnt / summary!.maxParticipantCnt) * 100
                )}%`,
              }}
            />
          </div>
        )}
        <div className="mt-3 flex items-center gap-2 text-gray-600">
          <CalendarDays className="h-4 w-4" />
          <Text size="body2" weight="medium">
            {summaryDdayLabel === ENDLESS_LABEL
              ? summaryDdayLabel
              : `${summaryDdayLabel} 남음`}
          </Text>
        </div>
      </div>
    </section>
  );

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
        <div className="flex min-h-screen w-full items-center justify-center bg-white">
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
        <div className="flex min-h-screen w-full items-center justify-center bg-white px-4">
          <Text size="body1" weight="medium" className="text-red-600">
            {error
              ? normalizeApiError(error).message
              : '챌린지 상세 정보를 불러오지 못했습니다.'}
          </Text>
        </div>
      </>
    );
  }

  const freeGoalModal = (
    <Dialog open={showFreeGoalModal} onOpenChange={setShowFreeGoalModal}>
      <DialogContent className="gap-5 px-6 py-6 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>나의 목표 입력</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Text size="body2" weight="regular" className="text-gray-500">
            챌린지에서 달성할 목표를 입력해 주세요. (최대 5개)
          </Text>
          <div className="flex flex-col gap-2">
            {freeGoalInputs.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={value}
                  onChange={(event) => {
                    const next = [...freeGoalInputs];
                    next[index] = event.target.value;
                    setFreeGoalInputs(next);
                  }}
                  placeholder={`목표 ${index + 1}`}
                  maxLength={50}
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
                {freeGoalInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setFreeGoalInputs(
                        freeGoalInputs.filter((_, i) => i !== index)
                      )
                    }
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="목표 삭제"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {freeGoalInputs.length < 5 && (
            <button
              type="button"
              onClick={() => setFreeGoalInputs([...freeGoalInputs, ''])}
              className="text-main-700 self-start text-sm font-medium hover:underline"
            >
              + 목표 추가
            </button>
          )}
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
            {joinChallenge.isPending ? '처리 중...' : '신청하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen w-full bg-white px-4 py-6 md:px-6 lg:px-8">
      {authDialog}
      {freeGoalModal}
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-6">
        <section className="rounded-4 border border-gray-200 bg-white p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-1.5 text-caption1 bg-gray-100 px-2.5 py-1 font-medium text-gray-600">
                {getCategoryLabel(summary.category)}
              </span>
              <span className="rounded-1.5 bg-main-200 text-caption1 text-main-800 px-2.5 py-1 font-bold">
                {getChallengeTypeLabel(summary.challengeType)}
              </span>
            </div>
            <Text size="body2" weight="medium" className="text-gray-600">
              {formatDateRange(summary.startDate, summary.endDate)}
              {summaryDdayLabel === ENDLESS_LABEL
                ? ''
                : ` ( ${summaryDdayLabel} )`}
            </Text>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <Text
              as="h1"
              size="display1"
              weight="bold"
              className="break-keep whitespace-pre-wrap text-gray-900"
            >
              {summary.title}
            </Text>
            <ExpandableText>{detail.description}</ExpandableText>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex min-w-0 flex-col gap-6">
            {isHost ? (
              <section className="rounded-4 border-main-300 border bg-white p-5">
                <div className="flex items-center gap-2">
                  <CircleAlert className="text-main-800 h-5 w-5" />
                  <Text size="heading2" weight="bold" className="text-gray-900">
                    참여 인원 대기
                  </Text>
                  <span className="bg-main-200 text-caption1 text-main-800 rounded-full px-2 py-0.5 font-bold">
                    {pendingParticipants.length}명
                  </span>
                </div>

                {pendingParticipants.length > 0 ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
              </section>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-4 border border-gray-200 bg-white p-5">
                <StatHeader
                  icon={
                    <span className="text-main-800 pb-1.5 text-4xl">◔</span>
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
                    <div className="flex items-center justify-between">
                      <Text
                        size="caption1"
                        weight="medium"
                        className="text-gray-600"
                      >
                        챌린지 참여율
                      </Text>
                      <Text
                        size="body2"
                        weight="bold"
                        className="text-gray-900"
                      >
                        {participationRate}%
                      </Text>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200">
                      <div
                        className="bg-main-700 h-full rounded-full"
                        style={{ width: `${participationRate}%` }}
                      />
                    </div>
                    <Text
                      size="caption1"
                      weight="regular"
                      className="mt-3 text-gray-600"
                    >
                      챌린지 전체 참여율 지표입니다.
                    </Text>
                  </div>
                </div>
              </section>

              <section className="rounded-4 border border-gray-200 bg-white p-5">
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
                    <div className="flex items-center justify-between">
                      <Text
                        size="caption1"
                        weight="medium"
                        className="text-gray-600"
                      >
                        목표 달성률
                      </Text>
                      <Text
                        size="body2"
                        weight="bold"
                        className="text-gray-900"
                      >
                        {goalCompletionRate}%
                      </Text>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200">
                      <div
                        className="bg-main-700 h-full rounded-full"
                        style={{ width: `${goalCompletionRate}%` }}
                      />
                    </div>
                    <Text
                      size="caption1"
                      weight="regular"
                      className="mt-3 text-gray-600"
                    >
                      챌린지 목표 달성률 지표입니다.
                    </Text>
                  </div>
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:hidden">
              {renderActionsSection()}
              {renderParticipationStatusSection()}
            </div>

            <section className="rounded-4 border border-gray-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <StatHeader
                  icon={<CalendarDays className="text-main-800 h-5 w-5" />}
                  title="활동 캘린더"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-gray-200 p-1.5 text-gray-600 transition hover:bg-gray-100"
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
                    className="rounded-full border border-gray-200 p-1.5 text-gray-600 transition hover:bg-gray-100"
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
                cellMinHeight={110}
              />
            </section>
          </div>

          <aside className="flex min-w-0 flex-col gap-6">
            <div className="hidden xl:block">{renderActionsSection()}</div>
            <div className="hidden xl:block">
              {renderParticipationStatusSection()}
            </div>

            <section className="rounded-4 border border-gray-200 bg-white p-5">
              <Text size="heading2" weight="bold" className="text-gray-900">
                참여자 목록
              </Text>
              <div className="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-4">
                {activeParticipants.map((participant) => {
                  const highlighted = participant.status === 'HOST';

                  return (
                    <button
                      key={participant.participantId}
                      type="button"
                      onClick={() =>
                        router.push(`/member/${participant.memberId}`)
                      }
                      className="flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl p-2 transition-colors duration-150 hover:bg-gray-100"
                    >
                      <div className="relative">
                        <div
                          className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border ${
                            highlighted
                              ? 'border-main-700'
                              : 'border-gray-200'
                          }`}
                        >
                          <CircleAvatar
                            imageUrl={participant.profileImg || undefined}
                            size="md"
                          />
                        </div>
                        {highlighted && (
                          <span className="bg-main-800 absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
                            HOST
                          </span>
                        )}
                      </div>
                      <Text
                        size="caption2"
                        weight="medium"
                        className="text-gray-700"
                      >
                        {participant.nickname}
                      </Text>
                      <Text
                        size="caption3"
                        weight="regular"
                        className={
                          highlighted ? 'text-main-800' : 'text-gray-500'
                        }
                      >
                        {participant.status}
                      </Text>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-4 border border-gray-200 bg-white p-5">
              <Text size="heading2" weight="bold" className="block text-gray-900">
                챌린지 목표
              </Text>
              {isFreeChallenge ? (
                <Text
                  size="body2"
                  weight="regular"
                  className="mt-3 block text-gray-500"
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
                      className="rounded-2 border border-gray-200 bg-gray-100 p-3"
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
            </section>
          </aside>
        </div>

        <section className="rounded-4 border border-gray-200 bg-white p-5">
          <DiaryCreateUnavailableDialog
            open={showCreateUnavailableDialog}
            onOpenChange={setShowCreateUnavailableDialog}
          />
          <LoginRequiredDialog
            open={showDiaryLikeDialog}
            onOpenChange={setShowDiaryLikeDialog}
          />
          <div className="flex flex-col gap-2 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
            <Text size="heading2" weight="bold" className="text-gray-900">
              챌린지 일지 리스트
            </Text>
            <Link
              href={`/challenge/${id}/diary`}
              className="text-main-800 text-sm font-semibold hover:underline"
            >
              전체 보기
            </Link>
          </div>

          {isDiariesLoading ? (
            <div className="mt-6 flex justify-center py-6">
              <Text size="body2" weight="regular" className="text-gray-500">
                일지를 불러오는 중입니다.
              </Text>
            </div>
          ) : previewDiaries.length === 0 ? (
            <div className="mt-6 flex justify-center py-6">
              <Text size="body2" weight="regular" className="text-gray-500">
                아직 등록된 일지가 없습니다.
              </Text>
            </div>
          ) : (
            <div className="-mx-2 mt-4 overflow-x-auto px-2 pb-3">
              <div className="flex w-max gap-3 py-1">
                {previewDiaries.map((diary) => (
                  <div key={diary.id} className="w-[200px] shrink-0">
                    <DiaryCard
                      imageUrl={
                        resolveDiaryImageUrl(diary.imgUrl?.[0]) ||
                        '/images/default-card.png'
                      }
                      percent={Math.min(
                        100,
                        Math.max(0, diary.diaryInfo?.achievementRate ?? 0)
                      )}
                      isLiked={diary.likeInfo.likedByMe}
                      likes={diary.likeInfo.likeCnt}
                      title={diary.title}
                      user={diary.author?.nickname || '익명'}
                      userImage={
                        resolveDiaryImageUrl(diary.author?.profileImage) ||
                        '/images/default-profile.png'
                      }
                      challengeLabel={
                        diary.challenge?.title ||
                        getCategoryLabel(diary.challenge?.category) ||
                        '챌린지'
                      }
                      onChallengeClick={() => {
                        const targetChallengeId =
                          diary.challenge?.challengeId ?? challengeId;
                        if (targetChallengeId > 0) {
                          router.push(`/challenge/${targetChallengeId}`);
                        }
                      }}
                      date={getRelativeDiaryDateLabel(
                        diary.diaryInfo?.createdAt ??
                          diary.diaryInfo?.challengedDate ??
                          ''
                      )}
                      emotion={mapFeelingToEmotion(
                        diary.diaryInfo?.feeling ?? 'NONE'
                      )}
                      onLikeToggle={() => handleDiaryLikeToggle(diary)}
                      onClick={() => router.push(`/diary/${diary.id}`)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
