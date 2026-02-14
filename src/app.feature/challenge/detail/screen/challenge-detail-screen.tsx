'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  CircularProgress,
  ScheduleCalendar,
  type ScheduleCalendarCell,
  Text,
} from '@1d1s/design-system';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleUserRound,
  Clock3,
  Flame,
  PencilLine,
  Settings,
  UserRound,
} from 'lucide-react';
import {
  CHALLENGE_DETAIL_PARTICIPANTS,
  CHALLENGE_DETAIL_PENDING_MEMBERS,
  CHALLENGE_DETAIL_RECENT_LOGS,
  CHALLENGE_DETAIL_WEEK_LABELS,
} from '../consts/challenge-detail-data';

interface ChallengeDetailContentProps {
  id: string;
}

type UserRole = 'host' | 'participant';

function getMonthLabel(monthDate: Date): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(monthDate);
}

function getActivityBars(dayOfMonth: number): Array<{ width: string; tone: 'main' | 'soft' }> {
  if (dayOfMonth % 6 === 0) {
    return [{ width: '82%', tone: 'main' }];
  }
  if (dayOfMonth % 4 === 0) {
    return [{ width: '72%', tone: 'main' }, { width: '54%', tone: 'soft' }];
  }
  if (dayOfMonth % 3 === 0) {
    return [{ width: '68%', tone: 'soft' }];
  }
  return [];
}

function buildCalendarRows(baseMonth: Date, userRole: UserRole): ScheduleCalendarCell[][] {
  const year = baseMonth.getFullYear();
  const month = baseMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const calendarCells: ScheduleCalendarCell[] = [];

  for (let cellIndex = 0; cellIndex < 42; cellIndex += 1) {
    if (cellIndex < firstWeekday) {
      const previousMonthDay = daysInPreviousMonth - firstWeekday + cellIndex + 1;
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

    const bars = getActivityBars(currentDay);
    const highlighted = userRole === 'host' && currentDay % 5 === 0;
    const subtitle = currentDay % 7 === 0 ? `${(currentDay % 3) + 1}건` : undefined;
    const title = currentDay % 9 === 0 ? '인증' : undefined;

    calendarCells.push({
      day: currentDay,
      title,
      subtitle,
      bars,
      highlighted,
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
}: {
  name: string;
  joinedAt: string;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between rounded-2 border border-gray-200 bg-gray-100 px-3 py-2.5">
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
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-main-200 text-main-800"
          aria-label="참여 승인"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-200 text-gray-500"
          aria-label="참여 거절"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ChallengeDetailContent({ id }: ChallengeDetailContentProps): React.ReactElement {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const userRole: UserRole = roleParam === 'participant' ? 'participant' : 'host';
  const isHost = userRole === 'host';

  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date(2025, 1, 1));

  const monthLabel = useMemo(() => getMonthLabel(calendarMonth), [calendarMonth]);
  const calendarRows = useMemo(
    () => buildCalendarRows(calendarMonth, userRole),
    [calendarMonth, userRole]
  );

  return (
    <div className="min-h-screen w-full bg-white px-4 py-4">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
        <section className="rounded-4 border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-1.5 bg-main-200 px-2.5 py-1 text-caption1 font-bold text-main-800">
                {isHost ? 'HOST VIEW' : 'PARTICIPANT VIEW'}
              </span>
              <span className="rounded-1.5 bg-gray-100 px-2.5 py-1 text-caption1 font-medium text-gray-600">
                {'<>'} 개발 챌린지
              </span>
            </div>
            <Text size="body2" weight="medium" className="text-gray-600">
              2025.01.25 ~ 2025.02.22 (D-21)
            </Text>
          </div>

          <Text size="display1" weight="bold" className="mt-3 text-gray-900">
            [고라니 밥주기] {id}
          </Text>
          <Text size="body1" weight="regular" className="mt-2 text-gray-600">
            매일 아침 고라니에게 밥을 주고 기록하는 챌린지입니다. {isHost
              ? '호스트로서 챌린지를 꾸준히 운영하고 참여자를 관리해보세요.'
              : '참여자로서 목표를 달성하고 기록을 쌓아보세요.'}
          </Text>
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-4">
            {isHost ? (
              <section className="rounded-4 border border-main-300 bg-white p-4">
                <div className="flex items-center gap-2">
                  <CircleAlert className="h-5 w-5 text-main-800" />
                  <Text size="heading2" weight="bold" className="text-gray-900">
                    참여 인원 대기
                  </Text>
                  <span className="rounded-full bg-main-200 px-2 py-0.5 text-caption1 font-bold text-main-800">
                    {CHALLENGE_DETAIL_PENDING_MEMBERS.length}명
                  </span>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {CHALLENGE_DETAIL_PENDING_MEMBERS.map((member) => (
                    <PendingMemberItem
                      key={member.name}
                      name={member.name}
                      joinedAt={member.joinedAt}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-4 border border-gray-200 bg-white p-4">
                <StatHeader
                  icon={<span className="text-main-800">◔</span>}
                  title={isHost ? '내 진척도' : '나의 참여 진척도'}
                  rightText={isHost ? 'Rank #1 (Host)' : 'Rank #7'}
                />
                <div className="mt-4 flex items-center gap-4">
                  <CircularProgress value={isHost ? 95 : 78} size="lg" showPercentage />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <Text size="caption1" weight="medium" className="text-gray-600">
                        평균 달성률
                      </Text>
                      <Text size="body2" weight="bold" className="text-gray-900">
                        {isHost ? '92M' : '79M'}
                      </Text>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200">
                      <div className={`h-full rounded-full bg-main-700 ${isHost ? 'w-[95%]' : 'w-[78%]'}`} />
                    </div>
                    <Text size="caption1" weight="regular" className="mt-3 text-gray-600">
                      {isHost
                        ? '호스트로서 모범을 보이고 계시네요. 계속 힘내세요.'
                        : '꾸준히 목표를 수행하고 있어요. 지금처럼 유지해보세요.'}
                    </Text>
                  </div>
                </div>
              </section>

              <section className="rounded-4 border border-gray-200 bg-white p-4">
                <StatHeader
                  icon={<Flame className="h-5 w-5 text-main-800" />}
                  title="스트릭 & 목표"
                  rightText={isHost ? '30 Days' : '12 Days'}
                />
                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <Text size="body2" weight="medium" className="text-gray-700">
                        아침 밥주기
                      </Text>
                      <Text size="body2" weight="bold" className="text-main-800">
                        {isHost ? '100%' : '82%'}
                      </Text>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div className={`h-full rounded-full bg-main-700 ${isHost ? 'w-full' : 'w-[82%]'}`} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <Text size="body2" weight="medium" className="text-gray-700">
                        물통 확인하기
                      </Text>
                      <Text size="body2" weight="bold" className="text-gray-600">
                        {isHost ? '98%' : '64%'}
                      </Text>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full bg-main-600/70 ${isHost ? 'w-[98%]' : 'w-[64%]'}`}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="rounded-4 border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <StatHeader icon={<CalendarDays className="h-5 w-5 text-main-800" />} title="활동 캘린더" />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-gray-200 p-1.5 text-gray-600 transition hover:bg-gray-100"
                    aria-label="이전 달"
                    onClick={() =>
                      setCalendarMonth(
                        (prevMonth) =>
                          new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1)
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <Text size="body2" weight="bold" className="min-w-[120px] text-center text-gray-700">
                    {monthLabel}
                  </Text>
                  <button
                    type="button"
                    className="rounded-full border border-gray-200 p-1.5 text-gray-600 transition hover:bg-gray-100"
                    aria-label="다음 달"
                    onClick={() =>
                      setCalendarMonth(
                        (prevMonth) =>
                          new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1)
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

            <section className="rounded-4 border border-gray-200 bg-white p-4">
              <StatHeader icon={<Clock3 className="h-5 w-5 text-main-800" />} title="최근 활동 로그" />
              <div className="mt-3 divide-y divide-gray-200">
                {CHALLENGE_DETAIL_RECENT_LOGS.map((log) => (
                  <div key={log.title} className="flex items-start justify-between gap-3 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-main-200 text-main-800">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <Text size="heading2" weight="bold" className="text-gray-900">
                          {log.title}
                        </Text>
                        <Text size="body2" weight="regular" className="mt-1 text-gray-600">
                          {log.description}
                        </Text>
                        {log.badge ? (
                          <span className="mt-2 inline-flex rounded-1.5 bg-gray-100 px-2.5 py-1 text-caption1 font-medium text-gray-600">
                            {log.badge}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <Text size="caption1" weight="medium" className="text-gray-500">
                      {log.time}
                    </Text>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="flex min-w-0 flex-col gap-4">
            <section className="rounded-4 border border-gray-200 bg-white p-4">
              <Text size="caption1" weight="bold" className="text-gray-500">
                {isHost ? 'HOST ACTIONS' : 'PARTICIPANT ACTIONS'}
              </Text>
              <div className="mt-3 flex flex-col gap-2.5">
                <Button size="large" className="w-full">
                  <PencilLine className="h-4 w-4" />
                  로그 작성하기
                </Button>

                {isHost ? (
                  <>
                    <Button variant="outlined" size="large" className="w-full">
                      <Settings className="h-4 w-4" />
                      정보 수정하기
                    </Button>
                    <Button variant="ghost" size="large" className="w-full text-gray-600">
                      챌린지 삭제
                    </Button>
                  </>
                ) : (
                  <Button variant="outlined" size="large" className="w-full">
                    챌린지 나가기
                  </Button>
                )}
              </div>
            </section>

            <section className="rounded-4 border border-gray-200 bg-white p-4">
              <Text size="heading2" weight="bold" className="text-gray-900">
                참여 현황
              </Text>
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <Text size="body2" weight="medium" className="text-gray-600">
                    참여율
                  </Text>
                  <Text size="body1" weight="bold" className="text-gray-900">
                    12 / 20
                  </Text>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-full w-[60%] rounded-full bg-mint-800" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-gray-600">
                  <CalendarDays className="h-4 w-4" />
                  <Text size="body2" weight="medium">
                    D-21 남음
                  </Text>
                </div>
              </div>
            </section>

            <section className="rounded-4 border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <Text size="heading2" weight="bold" className="text-gray-900">
                  참여자 목록
                </Text>
                {isHost ? (
                  <Text size="caption1" weight="bold" className="text-main-800">
                    +초대
                  </Text>
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {CHALLENGE_DETAIL_PARTICIPANTS.map((member) => (
                  <div key={member.name} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                        member.highlighted
                          ? 'border-main-700 bg-main-800 text-white'
                          : 'border-gray-200 bg-gray-100 text-gray-500'
                      }`}
                    >
                      {member.highlighted ? (
                        <Text size="caption1" weight="bold">
                          ME
                        </Text>
                      ) : (
                        <CircleUserRound className="h-5 w-5" />
                      )}
                    </div>
                    <Text size="caption2" weight="medium" className="text-gray-700">
                      {member.name}
                    </Text>
                    <Text
                      size="caption3"
                      weight="regular"
                      className={member.highlighted ? 'text-main-800' : 'text-gray-500'}
                    >
                      {member.role}
                    </Text>
                  </div>
                ))}

                {isHost ? (
                  <button
                    type="button"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 text-gray-400"
                    aria-label="참여자 초대"
                  >
                    +5
                  </button>
                ) : null}
              </div>
            </section>

            <section className="rounded-4 border border-gray-200 bg-white p-4">
              <Text size="heading2" weight="bold" className="text-gray-900">
                {isHost ? '나의 목표 리스트' : '내가 선택한 목표'}
              </Text>
              <div className="mt-3 flex flex-col gap-2">
                <div className="rounded-2 border border-main-200 bg-main-100 p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 text-main-800">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <Text size="body2" weight="bold" className="text-gray-900">
                        매일 아침 7시 특식 인증
                      </Text>
                      <Text size="caption2" weight="regular" className="text-gray-600">
                        고정목표
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="rounded-2 border border-gray-200 bg-gray-100 p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 text-gray-500">○</div>
                    <div>
                      <Text size="body2" weight="bold" className="text-gray-900">
                        물 2L 마시기
                      </Text>
                      <Text size="caption2" weight="regular" className="text-gray-600">
                        개인목표
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
