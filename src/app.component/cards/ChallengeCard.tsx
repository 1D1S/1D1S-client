'use client';

import { Card, CircleAvatar, Icon, Stripe } from '@1d1s/design-system';
import FadeInImage from '@component/FadeInImage';
import { cn } from '@module/utils/cn';
import { createActivationKeydownHandler } from '@module/utils/event';
import { CalendarDays, Camera, Target, Users } from 'lucide-react';
import Link from 'next/link';
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
  // 인증샷 필수 챌린지 — 카메라 배지로 표시한다.
  isPhotoRequired?: boolean;
  // 공식 챌린지 — 브랜드 링/글로우 + "공식" 배지로 강조한다.
  isOfficial?: boolean;
  participants?: ChallengeCardParticipant[];
  /** 지정 시 카드 전체가 <Link> 가 된다(stretched-link). 뷰포트 진입 시
   *  자동 prefetch 되고 onClick 은 무시된다. 로그인 게이팅처럼 이동 대신
   *  다른 동작이 필요하면 href 를 생략하고 onClick 을 사용한다. */
  href?: string;
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
  isPhotoRequired = false,
  isOfficial = false,
  participants,
  href,
  onClick,
  className,
}: ChallengeCardProps): React.ReactElement {
  const handleKeyDown = createActivationKeydownHandler<HTMLDivElement>(onClick);
  // href 모드에서는 내부의 stretched-link 가 키보드 포커스/활성화를 담당
  // 하므로 루트에 button 시맨틱을 주지 않는다 (탭 스톱 중복 방지).
  const rootInteractiveProps = href
    ? {}
    : {
        role: 'button' as const,
        tabIndex: 0,
        onClick,
        onKeyDown: handleKeyDown,
      };

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
      {...rootInteractiveProps}
      className={cn(
        'transition-all duration-500 ease-out',
        'hover:shadow-warm',
        isOfficial &&
          'ring-main-800 shadow-[0_10px_30px_-8px_rgba(255,89,0,0.45)] ring-2',
        isEnded && 'opacity-60',
        href && 'relative',
        className
      )}
    >
      {href ? (
        // z-[2]: Card.Thumb(relative) 와 오버레이(z-[1]) 위로 올려 썸네일
        // 영역 클릭도 링크에 닿게 한다.
        <Link
          href={href}
          aria-label={`${title} 챌린지 보기`}
          className="absolute inset-0 z-[2]"
        />
      ) : null}
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
              {/* 커버 이미지가 없는 챌린지: 깨진 플레이스홀더처럼 보이던 작은
                  글리프 대신, 카테고리 아이콘 배지 + 라벨로 "의도된 기본 커버"를
                  그린다. 색은 stripeTone(카테고리 색)을 그대로 쓴다. */}
              <div
                className={cn(
                  'pointer-events-none absolute inset-0 z-[1] flex',
                  'flex-col items-center justify-center gap-1.5 text-white'
                )}
              >
                {isOfficial ? (
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center',
                      'rounded-full bg-white shadow-md'
                    )}
                  >
                    <Icon name="Logo" size={22} className="text-main-800" />
                  </span>
                ) : categoryIcon ? (
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center',
                      'rounded-full bg-white/20 ring-1 ring-white/30',
                      '[&_svg]:!h-5 [&_svg]:!w-5'
                    )}
                  >
                    {categoryIcon}
                  </span>
                ) : null}
                {isOfficial ? (
                  <span
                    className={cn(
                      'rounded-full bg-white px-2 py-0.5',
                      'text-[11px] font-extrabold tracking-tight',
                      'text-main-800 shadow-md'
                    )}
                  >
                    공식 챌린지
                  </span>
                ) : category ? (
                  <span
                    className={cn(
                      'text-[11px] font-bold tracking-tight',
                      'text-white/95 drop-shadow-sm'
                    )}
                  >
                    {category}
                  </span>
                ) : null}
              </div>
            </>
          )}
          <div
            className={cn(
              // pointer-events-none: stretched-link 위의 장식 배지가 클릭
              // 데드존이 되지 않도록 포인터 이벤트를 통과시킨다.
              'pointer-events-none absolute top-2 right-2 z-10 flex',
              'items-center gap-1'
            )}
          >
            {isPhotoRequired ? (
              <span
                aria-label="인증샷 필수"
                className={cn(
                  'inline-flex items-center gap-1 rounded-full',
                  'bg-main-800 px-2 py-1 text-[10px] font-bold text-white',
                  'shadow-sm'
                )}
              >
                <Camera className="h-3 w-3" />
                인증샷
              </span>
            ) : null}
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
          {/* pointer-events-none: 아바타(내부적으로 relative)가
              stretched-link 위 클릭 데드존이 되지 않게 한다. */}
          <span
            className={cn(
              'pointer-events-none inline-flex min-h-8 items-center gap-2'
            )}
          >
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
