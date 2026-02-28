'use client';

import {
  Button,
  CircularProgress,
  ScheduleCalendar,
  type ScheduleCalendarCell,
  Text,
} from '@1d1s/design-system';
import { ChallengeGoalToggle } from '@feature/challenge/detail/components/challenge-goal-toggle';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleUserRound,
  Clock3,
  Flame,
  Heart,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useChallengeDetail } from '../../board/hooks/use-challenge-queries';
import {
  ChallengeGoal,
  Participant,
  ParticipantStatus,
} from '../../board/type/challenge';
import { CHALLENGE_DETAIL_WEEK_LABELS } from '../consts/challenge-detail-data';
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

function getMonthLabel(monthDate: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
  }).format(monthDate);
}

function getChallengeTypeLabel(challengeType: string): string {
  return challengeType === 'FIXED' ? '고정 목표' : '개인 목표';
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

function formatDateRange(startDate: string, endDate: string): string {
  const format = (date: string): string => date.replaceAll('-', '.');
  return `${format(startDate)} ~ ${format(endDate)}`;
}

function getDdayLabel(endDate: string): string {
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

function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getParticipantStatusLabel(status: ParticipantStatus): string {
  const labels: Record<ParticipantStatus, string> = {
    NONE: '미참여',
    PENDING: '승인 대기',
    REJECTED: '참여 거절',
    ACCEPTED: '참여 중',
    HOST: '호스트',
    PARTICIPANT: '참여자',
  };
  return labels[status] ?? status;
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
  const calendarCells: ScheduleCalendarCell[] = [];

  for (let cellIndex = 0; cellIndex < 42; cellIndex += 1) {
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

  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isGoalSelectionTouched, setIsGoalSelectionTouched] = useState(false);

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
  const canJoin = myStatus === 'NONE' || myStatus === 'REJECTED';

  const monthLabel = useMemo(
    () => getMonthLabel(calendarMonth),
    [calendarMonth]
  );
  const calendarRows = useMemo(
    () =>
      buildCalendarRows(
        calendarMonth,
        summary?.startDate ?? '',
        summary?.endDate ?? ''
      ),
    [calendarMonth, summary?.startDate, summary?.endDate]
  );
  const recentActivityLogs = useMemo(() => {
    const summaryLogs = [
      {
        key: 'participants-total',
        title: `현재 참여자 ${summary?.participantCnt ?? 0}명`,
        description: `최대 ${summary?.maxParticipantCnt ?? 0}명 중 ${summary?.participantCnt ?? 0}명이 참여 중입니다.`,
        status: '참여 현황',
      },
      {
        key: 'participants-pending',
        title: `승인 대기 ${pendingParticipants.length}건`,
        description:
          pendingParticipants.length > 0
            ? '호스트가 참여 승인/거절을 처리할 수 있습니다.'
            : '현재 처리할 참여 신청이 없습니다.',
        status: '신청 상태',
      },
    ];

    const participantLogs = participants.slice(0, 6).map((participant) => ({
      key: `participant-${participant.participantId}`,
      title: participant.nickname,
      description: `참여 상태: ${getParticipantStatusLabel(participant.status)}`,
      status: getParticipantStatusLabel(participant.status),
    }));

    return [...summaryLogs, ...participantLogs];
  }, [
    participants,
    pendingParticipants.length,
    summary?.maxParticipantCnt,
    summary?.participantCnt,
  ]);

  const isActionLoading =
    joinChallenge.isPending ||
    leaveChallenge.isPending ||
    likeChallenge.isPending ||
    unlikeChallenge.isPending;
  const effectiveSelectedGoals = isGoalSelectionTouched
    ? selectedGoals
    : goals.map((goal) => goal.content);

  const toggleGoal = (goal: string): void => {
    setIsGoalSelectionTouched(true);
    setSelectedGoals(() =>
      effectiveSelectedGoals.includes(goal)
        ? effectiveSelectedGoals.filter((prevGoal) => prevGoal !== goal)
        : [...effectiveSelectedGoals, goal]
    );
  };

  const handleJoinChallenge = (): void => {
    if (effectiveSelectedGoals.length === 0) {
      toast.error('최소 1개 이상의 목표를 선택해 주세요.');
      return;
    }

    joinChallenge.mutate(
      { challengeId, data: effectiveSelectedGoals },
      {
        onSuccess: () => {
          toast.success('챌린지 참여 신청이 완료되었습니다.');
        },
        onError: () => {
          toast.error('챌린지 참여 신청에 실패했습니다.');
        },
      }
    );
  };

  const handleLeaveChallenge = (): void => {
    leaveChallenge.mutate(challengeId, {
      onSuccess: () => {
        toast.success('챌린지에서 탈퇴했습니다.');
      },
      onError: () => {
        toast.error('챌린지 탈퇴에 실패했습니다.');
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
        onError: () => {
          toast.error('좋아요 취소에 실패했습니다.');
        },
      });
      return;
    }

    likeChallenge.mutate(challengeId, {
      onSuccess: () => {
        toast.success('챌린지 좋아요 성공했습니다.');
      },
      onError: () => {
        toast.error('좋아요 요청에 실패했습니다.');
      },
    });
  };

  const handleAcceptParticipant = (participantId: number): void => {
    acceptParticipant.mutate(participantId, {
      onSuccess: () => {
        toast.success('참여 신청을 수락했습니다.');
      },
      onError: () => {
        toast.error('참여 신청 수락에 실패했습니다.');
      },
    });
  };

  const handleRejectParticipant = (participantId: number): void => {
    rejectParticipant.mutate(participantId, {
      onSuccess: () => {
        toast.success('참여 신청을 거절했습니다.');
      },
      onError: () => {
        toast.error('참여 신청 거절에 실패했습니다.');
      },
    });
  };

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
          {error?.message ?? '챌린지 상세 정보를 불러오지 못했습니다.'}
        </Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-6">
        <section className="rounded-4 border border-gray-200 bg-white p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-1.5 bg-main-200 text-caption1 text-main-800 px-2.5 py-1 font-bold">
                {isHost ? 'HOST VIEW' : 'PARTICIPANT VIEW'}
              </span>
              <span className="rounded-1.5 text-caption1 bg-gray-100 px-2.5 py-1 font-medium text-gray-600">
                {getCategoryLabel(summary.category)} ·{' '}
                {getChallengeTypeLabel(summary.challengeType)}
              </span>
            </div>
            <Text size="body2" weight="medium" className="text-gray-600">
              {formatDateRange(summary.startDate, summary.endDate)} ({' '}
              {getDdayLabel(summary.endDate)} )
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
                  icon={<span className="text-main-800">◔</span>}
                  title={isHost ? '내 진척도' : '나의 참여 진척도'}
                  rightText={`${participationRate}%`}
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
                  rightText={`${goalCompletionRate}%`}
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

            <section className="rounded-4 border border-gray-200 bg-white p-5">
              <StatHeader
                icon={<Clock3 className="text-main-800 h-5 w-5" />}
                title="참여 활동 요약"
              />
              <div className="mt-3 divide-y divide-gray-200">
                {recentActivityLogs.map((log) => (
                  <div
                    key={log.key}
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-main-200 text-main-800 mt-1 flex h-10 w-10 items-center justify-center rounded-full">
                        <Check className="h-5 w-5" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <Text
                          size="heading2"
                          weight="bold"
                          className="text-gray-900"
                        >
                          {log.title}
                        </Text>
                        <div className="mt-1">
                          <Text
                            size="body2"
                            weight="regular"
                            className="whitespace-pre-wrap text-gray-600"
                          >
                            {log.description}
                          </Text>
                        </div>
                      </div>
                    </div>
                    <Text
                      size="caption1"
                      weight="medium"
                      className="text-gray-500"
                    >
                      {log.status}
                    </Text>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="flex min-w-0 flex-col gap-6">
            <section className="rounded-4 border border-gray-200 bg-white p-5">
              <Text size="caption1" weight="bold" className="text-gray-500">
                ACTIONS
              </Text>
              <div className="mt-3 flex flex-col gap-2.5">
                <Button size="large" className="w-full" asChild>
                  <Link href={`/diary/create?challengeId=${id}`}>
                    로그 작성하기
                  </Link>
                </Button>

                <Button
                  variant={summary.likeInfo.likedByMe ? 'default' : 'outlined'}
                  size="large"
                  className="w-full"
                  disabled={isActionLoading}
                  asChild
                >
                  <button type="button" onClick={handleToggleLike}>
                    <Heart className="h-4 w-4" />
                    {summary.likeInfo.likedByMe ? '좋아요 취소' : '좋아요'} (
                    {summary.likeInfo.likeCnt})
                  </button>
                </Button>

                {!isHost && canJoin ? (
                  <Button
                    variant="outlined"
                    size="large"
                    className="w-full"
                    onClick={handleJoinChallenge}
                    disabled={
                      joinChallenge.isPending ||
                      effectiveSelectedGoals.length === 0
                    }
                  >
                    챌린지 참여 신청
                  </Button>
                ) : null}

                {!isHost && isPending ? (
                  <Button
                    variant="outlined"
                    size="large"
                    className="w-full"
                    disabled
                  >
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
                    {summary.participantCnt} / {summary.maxParticipantCnt}
                  </Text>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="bg-mint-800 h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        summary.maxParticipantCnt > 0
                          ? (summary.participantCnt /
                              summary.maxParticipantCnt) *
                              100
                          : 0
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 text-gray-600">
                  <CalendarDays className="h-4 w-4" />
                  <Text size="body2" weight="medium">
                    {getDdayLabel(summary.endDate)} 남음
                  </Text>
                </div>
              </div>
            </section>

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
                        checked={effectiveSelectedGoals.includes(goal.content)}
                        onCheckedChange={() => toggleGoal(goal.content)}
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
      </div>
    </div>
  );
}
