'use client';

import {
  Button,
  CircularProgress,
  DiaryCard,
  ScheduleCalendar,
  type ScheduleCalendarCell,
  Text,
} from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/login-required-dialog';
import { ChallengeGoalToggle } from '@feature/challenge/detail/components/challenge-goal-toggle';
import { normalizeApiError, notifyApiError } from '@module/api/error';
import { authStorage } from '@module/utils/auth';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleUserRound,
  Flame,
  Heart,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';

import { useChallengeDetail } from '../../board/hooks/use-challenge-queries';
import {
  ChallengeGoal,
  Participant,
  ParticipantStatus,
} from '../../board/type/challenge';
import {
  CHALLENGE_DETAIL_DUMMY_DIARIES,
  CHALLENGE_DETAIL_WEEK_LABELS,
} from '../consts/challenge-detail-data';
import {
  useAcceptParticipant,
  useJoinChallenge,
  useLeaveChallenge,
  useLikeChallenge,
  useRejectParticipant,
  useUnlikeChallenge,
} from '../hooks/use-challenge-mutations';

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

function getMonthLabel(monthDate: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
  }).format(monthDate);
}

function getChallengeTypeLabel(challengeType: string): string {
  return challengeType === 'FIXED' ? '고정 목표' : '자유 목표';
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    DEV: '개발',
    HEALTH: '건강',
    STUDY: '공부',
    EXERCISE: '운동',
    HOBBY: '취미',
    OTHER: '기타',
    ALL: '전체',
  };

  return labels[category] ?? category;
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
    return `${format(startDate)} ~ 무기한`;
  }

  return `${format(startDate)} ~ ${format(endDate)}`;
}

function getDdayLabel(endDate: string): string {
  if (isEndlessChallengeEndDate(endDate)) {
    return '무기한';
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

  const { data, isLoading, isError, error } = useChallengeDetail(challengeId);

  const joinChallenge = useJoinChallenge();
  const leaveChallenge = useLeaveChallenge();
  const likeChallenge = useLikeChallenge();
  const unlikeChallenge = useUnlikeChallenge();
  const acceptParticipant = useAcceptParticipant();
  const rejectParticipant = useRejectParticipant();

  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [dismissed, setDismissed] = useState(false);
  const showAuthDialog = hasMounted && !authStorage.hasTokens() && !dismissed;
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [selectedGoalIds, setSelectedGoalIds] = useState<number[]>([]);
  const [isGoalSelectionTouched, setIsGoalSelectionTouched] = useState(false);
  const [dummyDiaries, setDummyDiaries] = useState(
    () => CHALLENGE_DETAIL_DUMMY_DIARIES
  );

  const summary = data?.challengeSummary;
  const detail = data?.challengeDetail;
  const goals = data?.challengeGoals ?? EMPTY_GOALS;
  const participants = data?.participants ?? EMPTY_PARTICIPANTS;

  const participationRate = Math.min(
    100,
    Math.max(0, detail?.participationRate ?? 0)
  );
  const goalCompletionRate = Math.min(
    100,
    Math.max(0, detail?.goalCompletionRate ?? 0)
  );

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

  const monthLabel = useMemo(
    () => getMonthLabel(calendarMonth),
    [calendarMonth]
  );
  const summaryStartDate = summary?.startDate ?? '';
  const summaryEndDate = summary?.endDate ?? '';
  const summaryDdayLabel = getDdayLabel(summaryEndDate);
  const summaryMaxParticipantCnt = summary?.maxParticipantCnt ?? 0;
  const canJoin = canJoinByStatus && summaryMaxParticipantCnt > 1;
  const calendarRows = useMemo(
    () => buildCalendarRows(calendarMonth, summaryStartDate, summaryEndDate),
    [calendarMonth, summaryEndDate, summaryStartDate]
  );
  const previewDummyDiaries = useMemo(
    () => dummyDiaries.slice(0, 10),
    [dummyDiaries]
  );

  const isActionLoading =
    joinChallenge.isPending ||
    leaveChallenge.isPending ||
    likeChallenge.isPending ||
    unlikeChallenge.isPending;
  const effectiveSelectedGoalIds = isGoalSelectionTouched
    ? selectedGoalIds
    : goals.map((goal) => goal.challengeGoalId);

  const toggleGoal = (goalId: number): void => {
    setIsGoalSelectionTouched(true);
    setSelectedGoalIds(() =>
      effectiveSelectedGoalIds.includes(goalId)
        ? effectiveSelectedGoalIds.filter((prevGoalId) => prevGoalId !== goalId)
        : [...effectiveSelectedGoalIds, goalId]
    );
  };

  const handleJoinChallenge = (): void => {
    if (summaryMaxParticipantCnt <= 1) {
      toast.error('최대 참여 인원이 2명 이상인 챌린지만 신청할 수 있습니다.');
      return;
    }

    if (effectiveSelectedGoalIds.length === 0) {
      toast.error('최소 1개 이상의 목표를 선택해 주세요.');
      return;
    }

    const selectedGoalContents = goals
      .filter((goal) => effectiveSelectedGoalIds.includes(goal.challengeGoalId))
      .map((goal) => goal.content);

    if (selectedGoalContents.length === 0) {
      toast.error('선택한 목표를 찾을 수 없습니다. 다시 선택해 주세요.');
      return;
    }

    joinChallenge.mutate(
      { challengeId, data: selectedGoalContents },
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

  const handleToggleDummyDiaryLike = (diaryId: number): void => {
    setDummyDiaries((prevDiaries) =>
      prevDiaries.map((diary) => {
        if (diary.diaryId !== diaryId) {
          return diary;
        }

        const nextLiked = !diary.isLiked;
        return {
          ...diary,
          isLiked: nextLiked,
          likes: Math.max(0, diary.likes + (nextLiked ? 1 : -1)),
        };
      })
    );
  };

  const renderActionsSection = (): React.ReactElement => (
    <section className="rounded-4 border border-gray-200 bg-white p-5">
      <Text size="caption1" weight="bold" className="text-gray-500">
        ACTIONS
      </Text>
      <div className="mt-3 flex flex-col gap-2.5">
        {isParticipating ? (
          <Button size="large" className="w-full" asChild>
            <Link href={`/diary/create?challengeId=${id}`}>일지 작성하기</Link>
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
            <Heart className="h-4 w-4" />
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
            disabled={
              joinChallenge.isPending || effectiveSelectedGoalIds.length === 0
            }
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
          <Text size="body1" weight="bold" className="text-gray-900">
            {summary!.participantCnt} / {summary!.maxParticipantCnt}
          </Text>
        </div>
        <div className="h-2 rounded-full bg-gray-200">
          <div
            className="bg-mint-800 h-full rounded-full"
            style={{
              width: `${Math.min(
                100,
                summary!.maxParticipantCnt > 0
                  ? (summary!.participantCnt / summary!.maxParticipantCnt) * 100
                  : 0
              )}%`,
            }}
          />
        </div>
        <div className="mt-3 flex items-center gap-2 text-gray-600">
          <CalendarDays className="h-4 w-4" />
          <Text size="body2" weight="medium">
            {summaryDdayLabel === '무기한'
              ? summaryDdayLabel
              : `${summaryDdayLabel} 남음`}
          </Text>
        </div>
      </div>
    </section>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <Text size="body1" weight="medium" className="text-gray-500">
          상세 정보를 불러오는 중입니다...
        </Text>
      </div>
    );
  }

  if (isError || !summary || !detail) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white px-4">
        <Text size="body1" weight="medium" className="text-red-600">
          {error
            ? normalizeApiError(error).message
            : '챌린지 상세 정보를 불러오지 못했습니다.'}
        </Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white px-4 py-6 md:px-6 lg:px-8">
      <LoginRequiredDialog
        open={showAuthDialog}
        onOpenChange={(open) => { if (!open) {setDismissed(true);} }}
        title="간편 가입 후에 둘러보세요!"
        description="챌린지 상세는 로그인 후 이용할 수 있습니다."
      />
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
              {formatDateRange(summary.startDate, summary.endDate)} ({' '}
              {summaryDdayLabel} )
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
            <Text
              as="p"
              size="body1"
              weight="regular"
              className="break-keep whitespace-pre-wrap text-gray-600"
            >
              {detail.description}
            </Text>
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
                  icon={<span className="text-main-800 pb-1.5 text-4xl">◔</span>}
                  title={isHost ? '내 진척도' : '나의 참여 진척도'}
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
                        참여율
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
                      개인 참여율 지표입니다.
                    </Text>
                  </div>
                </div>
              </section>

              <section className="rounded-4 border border-gray-200 bg-white p-5">
                <StatHeader
                  icon={<Flame className="text-main-800 h-5 w-5" />}
                  title="목표 달성률"
                />
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between">
                    <Text
                      size="body2"
                      weight="medium"
                      className="text-gray-700"
                    >
                      전체 목표 달성률
                    </Text>
                    <Text size="body2" weight="bold" className="text-main-800">
                      {goalCompletionRate}%
                    </Text>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="bg-main-700 h-full rounded-full"
                      style={{ width: `${goalCompletionRate}%` }}
                    />
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
                    <div
                      key={participant.participantId}
                      className="flex flex-col items-center gap-2.5"
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                          highlighted
                            ? 'border-main-700 bg-main-800 text-white'
                            : 'border-gray-200 bg-gray-100 text-gray-500'
                        }`}
                      >
                        {highlighted ? (
                          <Text size="caption1" weight="bold">
                            HOST
                          </Text>
                        ) : (
                          <CircleUserRound className="h-5 w-5" />
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
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-4 border border-gray-200 bg-white p-5">
              <Text size="heading2" weight="bold" className="text-gray-900">
                {canJoin ? '신청할 목표 선택' : '챌린지 목표'}
              </Text>
              <div className="mt-3 flex flex-col gap-2">
                {goals.map((goal) => (
                  <div
                    key={goal.challengeGoalId}
                    className="rounded-2 border border-gray-200 bg-gray-100 p-3"
                  >
                    {canJoin ? (
                      <ChallengeGoalToggle
                        checked={effectiveSelectedGoalIds.includes(
                          goal.challengeGoalId
                        )}
                        onCheckedChange={() => toggleGoal(goal.challengeGoalId)}
                        label={goal.content}
                      />
                    ) : (
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
                    )}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <section className="rounded-4 border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-2 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Text size="heading2" weight="bold" className="text-gray-900">
                챌린지 일지 리스트
              </Text>
              <span className="text-caption2 rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
                DUMMY
              </span>
            </div>
            <Link
              href={`/challenge/${id}/diary`}
              className="text-main-800 text-sm font-semibold hover:underline"
            >
              전체 보기
            </Link>
          </div>

          <Text size="caption2" weight="regular" className="mt-3 text-gray-500">
            {summary.title} 챌린지 일지 더미 데이터 미리보기(최대 10개)입니다.
          </Text>

          <div className="mt-4 overflow-x-auto">
            <div className="flex w-max gap-3 pb-2">
              {previewDummyDiaries.map((diary) => (
                <div key={diary.diaryId} className="w-[200px] shrink-0">
                  <DiaryCard
                    imageUrl={diary.imageUrl}
                    percent={diary.percent}
                    isLiked={diary.isLiked}
                    likes={diary.likes}
                    title={diary.title}
                    user={diary.user}
                    userImage={diary.userImage}
                    challengeLabel={diary.challengeLabel}
                    onChallengeClick={() => undefined}
                    date={diary.dateLabel}
                    emotion={diary.emotion}
                    onLikeToggle={() =>
                      handleToggleDummyDiaryLike(diary.diaryId)
                    }
                    onClick={() => undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
