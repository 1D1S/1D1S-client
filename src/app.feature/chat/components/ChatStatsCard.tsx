'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Flame, TrendingUp } from 'lucide-react';
import React from 'react';

import { ChatStatsShare } from '../type/chat';
import { weekDayFlags } from '../utils/chatStatsWeek';

/** 월요일 시작. 서버 weekStart 가 월요일이라 순서를 맞춘다. */
const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

const CARD_CLASS = cn(
  'w-[250px] max-w-full min-w-0 overflow-hidden rounded-[18px] border',
  'shadow-[0_2px_8px_-4px_rgba(0,0,0,0.10)]',
  // 공유 카드와 같은 이유 — 사파리가 둥근 모서리 안쪽을 정확히 자르게.
  '[transform:translateZ(0)]'
);

/**
 * 이번 주 7일 점. 쓴 날은 채우고 안 쓴 날은 비운다.
 *
 * 날짜는 서버가 준 weekStart 에서 세어 만든다 — 기기 시계로 "이번 주" 를
 * 다시 계산하면 박제된 주와 어긋나고, 자정이나 시간대 경계에서 보는
 * 사람마다 다른 주가 그려진다.
 */
function WeekDots({ stats }: { stats: ChatStatsShare }): React.ReactElement {
  const flags = weekDayFlags(stats.weekStart, stats.weekDates);
  return (
    <div className="flex items-center justify-between gap-1">
      {WEEKDAY_LABELS.map((label, index) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <Text size="caption4" weight="bold" className="text-gray-500">
            {label}
          </Text>
          <span
            className={cn(
              'h-6 w-6 rounded-full',
              flags[index]
                ? 'bg-main-600'
                : 'border border-gray-200 bg-gray-100'
            )}
          />
        </div>
      ))}
    </div>
  );
}

/** 큰 숫자 하나로 밀어붙이는 레이아웃 — 스트릭 두 종이 공유한다. */
function BigStreak({
  value,
  caption,
}: {
  value: number;
  caption: string;
}): React.ReactElement {
  return (
    <div className="flex items-end gap-1.5">
      <Text
        size="heading1"
        weight="extrabold"
        className="text-main-800 leading-none"
      >
        {value}
      </Text>
      <Text size="body2" weight="bold" className="pb-0.5 text-gray-700">
        일
      </Text>
      <Text size="caption3" className="ml-auto pb-1 text-gray-500">
        {caption}
      </Text>
    </div>
  );
}

/**
 * 통계 자랑 카드. 서버가 박제한 값을 **그대로** 그린다.
 *
 * variant 는 레이아웃만 고르고 숫자는 셋 다 항상 채워져 오므로, 여기서
 * 다시 계산하거나 오늘 기준으로 보정하지 않는다.
 */
export function ChatStatsCard({
  stats,
  isMine = false,
}: {
  stats: ChatStatsShare;
  isMine?: boolean;
}): React.ReactElement {
  // variant 가 없던 시절 카드는 WEEK 로 읽는다(계약).
  const variant = stats.variant ?? 'WEEK';
  const isWeek = variant === 'WEEK';
  const Icon = isWeek ? TrendingUp : Flame;
  const title = isWeek
    ? '이번 주 기록'
    : variant === 'CURRENT_STREAK'
      ? '현재 스트릭'
      : '최장 스트릭';

  return (
    <div
      className={cn(
        CARD_CLASS,
        'bg-white text-left',
        isMine ? 'border-main-400' : 'border-gray-200'
      )}
    >
      <div className="flex flex-col gap-3 px-3.5 pt-3 pb-3">
        <span
          className={cn(
            'bg-main-200 text-main-900 inline-flex w-fit items-center gap-1',
            'rounded-md px-1.5 py-[3px] text-[10.5px] leading-none',
            'font-extrabold'
          )}
        >
          <Icon className="h-3 w-3" />
          {title}
        </span>

        {isWeek ? (
          <>
            <WeekDots stats={stats} />
            <Text size="caption2" weight="bold" className="text-gray-800">
              이번 주 일지 {stats.weekDiaryCount}개
            </Text>
          </>
        ) : (
          <BigStreak
            value={
              variant === 'CURRENT_STREAK'
                ? stats.currentStreak
                : stats.maxStreak
            }
            caption={
              variant === 'CURRENT_STREAK' ? '연속 작성 중' : '역대 최장'
            }
          />
        )}
      </div>

      <div
        className={cn(
          'flex items-center justify-between border-t border-gray-100',
          'px-3.5 py-2.5 text-gray-500'
        )}
      >
        <Text size="caption3" className="text-inherit">
          전체 일지
        </Text>
        <Text size="caption3" weight="extrabold" className="text-gray-700">
          {stats.totalDiaryCount}개
        </Text>
      </div>
    </div>
  );
}
