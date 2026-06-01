'use client';

import { Card, CircleAvatar, Stripe } from '@1d1s/design-system';
import FadeInImage from '@component/FadeInImage';
import { cn } from '@module/utils/cn';
import { createActivationKeydownHandler } from '@module/utils/event';
import { CalendarDays, Target, Users } from 'lucide-react';
import React, { useMemo } from 'react';

export type ChallengeCardGoalType = 'FIXED' | 'FLEXIBLE';

export interface ChallengeCardParticipant {
  memberId: number;
  nickname: string;
  profileImg: string | null;
}

export interface ChallengeCardProps {
  title: string;
  category: string;
  categoryIcon?: React.ReactNode;
  stripeTone?: string;
  imageUrl?: string;
  currentParticipantCount: number;
  maxParticipantCount?: number;
  remainingLabel: string;
  startDate?: string;
  endDate?: string;
  isInfinite?: boolean;
  goalType?: ChallengeCardGoalType;
  isGroup?: boolean;
  isEnded?: boolean;
  participants?: ChallengeCardParticipant[];
  onClick?(): void;
  className?: string;
}

const AVATAR_TONES = ['peach', 'rose', 'peach'] as const;

const GOAL_TYPE_LABELS: Record<ChallengeCardGoalType, string> = {
  FIXED: '고정 목표',
  FLEXIBLE: '자유 목표',
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function pad2(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

function formatFullDate(date: Date): string {
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(
    date.getDate()
  )}`;
}

function formatShortDate(date: Date): string {
  return `${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
}

interface PeriodInfo {
  rangeLabel: string;
  durationLabel: string | null;
}

function buildPeriodInfo(
  startDate?: string,
  endDate?: string,
  isInfinite?: boolean
): PeriodInfo | null {
  if (!startDate) {
    return null;
  }

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const startLabel = formatFullDate(start);

  if (isInfinite) {
    return { rangeLabel: `${startLabel} ~ 무제한`, durationLabel: null };
  }

  if (!endDate) {
    return { rangeLabel: startLabel, durationLabel: null };
  }

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) {
    return { rangeLabel: startLabel, durationLabel: null };
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  const endLabel = sameYear ? formatShortDate(end) : formatFullDate(end);
  const days = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1
  );

  return {
    rangeLabel: `${startLabel} ~ ${endLabel}`,
    durationLabel: `${days}일`,
  };
}

function ChallengeCard({
  title,
  category,
  categoryIcon,
  stripeTone = 'var(--main-600)',
  imageUrl,
  currentParticipantCount,
  maxParticipantCount,
  remainingLabel,
  startDate,
  endDate,
  isInfinite = false,
  goalType,
  isGroup = true,
  isEnded = false,
  participants,
  onClick,
  className,
}: ChallengeCardProps): React.ReactElement {
  const handleKeyDown = createActivationKeydownHandler<HTMLDivElement>(onClick);

  const stripeLabel = categoryIcon ?? category;
  const participationLabel = isGroup ? '단체' : '개인';
  const goalLabel = goalType ? GOAL_TYPE_LABELS[goalType] : null;
  const visibleParticipants = (participants ?? []).slice(0, 3);
  const visibleAvatars =
    visibleParticipants.length > 0
      ? visibleParticipants.length
      : Math.min(3, Math.max(0, currentParticipantCount));
  const extraCount = Math.max(0, currentParticipantCount - visibleAvatars);
  // 날짜 파싱·포맷팅은 startDate/endDate/isInfinite 가 바뀔 때만 재계산.
  // 보드 스크롤·필터 변경처럼 부모가 재렌더돼도 동일 props 면 캐시 유지.
  const period = useMemo(
    () => buildPeriodInfo(startDate, endDate, isInfinite),
    [startDate, endDate, isInfinite]
  );
  const hasMaxCount =
    typeof maxParticipantCount === 'number' && maxParticipantCount > 0;
  const participantCountLabel = hasMaxCount
    ? `${currentParticipantCount}/${maxParticipantCount}명`
    : `${currentParticipantCount}명`;

  return (
    <Card
      interactive
      radius="md"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'transition-all duration-500 ease-out',
        'hover:shadow-warm',
        isEnded && 'opacity-60',
        className
      )}
    >
      <Card.Thumb className="px-3 pt-3">
        <div className="bg-main-100 relative aspect-[21/9] overflow-hidden rounded-lg">
          {imageUrl ? (
            <FadeInImage
              src={imageUrl}
              alt={title}
              fill
              sizes="(min-width: 1024px) 280px, 50vw"
              className="object-cover"
            />
          ) : (
            <>
              <Stripe tone={stripeTone} />
              {stripeLabel ? (
                <span
                  className={cn(
                    'absolute inset-0 flex items-center justify-center',
                    'pointer-events-none'
                  )}
                >
                  <span
                    className={cn(
                      'rounded-[3px] bg-white px-1.5 py-0.5',
                      'font-mono text-[10px] tracking-[0.3px] text-black/45'
                    )}
                  >
                    {stripeLabel}
                  </span>
                </span>
              ) : null}
            </>
          )}
          <div
            className={cn(
              'absolute top-2 right-2 z-10 flex items-center gap-1'
            )}
          >
            {goalLabel ? (
              <span
                className={cn(
                  'inline-flex items-center rounded-full bg-white/95',
                  'px-2 py-1 text-[10px] font-bold text-gray-700',
                  'shadow-sm'
                )}
              >
                {goalLabel}
              </span>
            ) : null}
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1',
                'text-[11px] font-bold shadow-sm',
                isGroup ? 'bg-main-800 text-white' : 'bg-white text-gray-900'
              )}
            >
              {participationLabel}
            </span>
          </div>
        </div>
      </Card.Thumb>
      <Card.Body>
        <Card.Title className="min-h-[2.6em]">{title}</Card.Title>
        <ul
          className={cn(
            'mt-1 flex flex-col gap-1 text-[11px] text-gray-500',
            'sm:text-xs'
          )}
        >
          {period ? (
            <li className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {period.rangeLabel}
                {period.durationLabel ? (
                  <span className="text-gray-400">
                    {' · '}
                    {period.durationLabel}
                  </span>
                ) : null}
              </span>
            </li>
          ) : null}
          <li className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              <span className="font-semibold text-gray-700">
                {participantCountLabel}
              </span>{' '}
              참여중
            </span>
          </li>
          {goalLabel ? (
            <li className="flex items-center gap-1.5 sm:hidden">
              <Target className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{goalLabel}</span>
            </li>
          ) : null}
        </ul>
        <Card.Meta className="mt-2 border-t border-gray-100 pt-2">
          {/* 참여자가 0명일 때도 행 높이가 줄지 않도록 아바타 슬롯 높이를
              고정해 종료 라벨의 수직 위치를 다른 카드와 맞춘다. */}
          <span className="inline-flex min-h-8 items-center gap-2">
            <span className="flex -space-x-2">
              {visibleParticipants.length > 0
                ? visibleParticipants.map((participant, index) => (
                    <CircleAvatar
                      key={participant.memberId}
                      size="sm"
                      tone={AVATAR_TONES[index % AVATAR_TONES.length]}
                      imageUrl={participant.profileImg ?? undefined}
                      alt={participant.nickname}
                      ring
                    />
                  ))
                : Array.from({ length: visibleAvatars }).map((_, index) => (
                    <CircleAvatar
                      key={index}
                      size="sm"
                      tone={AVATAR_TONES[index % AVATAR_TONES.length]}
                      ring
                    />
                  ))}
            </span>
            {extraCount > 0 ? (
              <span className="text-gray-500">+{extraCount}</span>
            ) : null}
          </span>
          <span className="text-brand font-bold">{remainingLabel}</span>
        </Card.Meta>
      </Card.Body>
    </Card>
  );
}

// 보드/리스트에서 12+ 개 카드를 렌더하므로 React.memo 로 동일 props 시 재렌더를
// 건너뛴다. 부모(ChallengeBoardScreen) 는 onClick 을 useCallback 으로 안정화해야
// 효과를 얻는다.
export default React.memo(ChallengeCard);
