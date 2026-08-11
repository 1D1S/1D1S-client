import { Tag, Text } from '@1d1s/design-system';
import LikeBurst from '@component/LikeBurst';
import { cn } from '@module/utils/cn';
import { Heart } from 'lucide-react';
import React from 'react';

import { ChallengeCompletedBadge } from '../../shared/components/ChallengeCompletedBadge';

interface ChallengeDetailMobileHeaderProps {
  categoryLabel: string;
  typeLabel: string;
  title: string;
  metaLabel: string;
  /** 내 완료 여부(서버 판정) — true 일 때만 완료 딱지를 붙인다. */
  myCompleted?: boolean;
  likedByMe: boolean;
  likeCnt: number;
  isLikePending: boolean;
  onToggleLike(): void;
  // 기간 대비 진행률(%) — 참여율이 아니라 "며칠째 진행 중"이다.
  progressPercent: number;
  // 예: "3일째 / 총 30일". 무제한이면 "12일째".
  progressCaption: string;
  isInfinite?: boolean;
}

// 모바일 컨텐츠 헤더 — 히어로 위로 오버레이. 탭 위 고정 노출.
// ChallengeDetailScreen 에서 분리한 프레젠테이션 블록(마크업/클래스 불변).
export function ChallengeDetailMobileHeader({
  categoryLabel,
  typeLabel,
  title,
  metaLabel,
  myCompleted = false,
  likedByMe,
  likeCnt,
  isLikePending,
  onToggleLike,
  progressPercent,
  progressCaption,
  isInfinite = false,
}: ChallengeDetailMobileHeaderProps): React.ReactElement {
  return (
    <div
      className={cn(
        'relative z-10 -mt-5 rounded-t-[20px] bg-white px-5 pt-5 pb-1',
        'lg:hidden'
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag tone="brand" size="sm">
          {categoryLabel}
        </Tag>
        <Tag tone="gray" size="sm">
          {typeLabel}
        </Tag>
        {myCompleted ? <ChallengeCompletedBadge label="내 완료" /> : null}
      </div>
      <Text
        as="h1"
        size="heading1"
        weight="extrabold"
        className="mt-2.5 block tracking-[-0.5px] break-keep text-gray-900"
      >
        {title}
      </Text>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <Text
          size="caption1"
          weight="regular"
          className="min-w-0 flex-1 text-gray-500"
        >
          {metaLabel}
        </Text>
        <button
          type="button"
          onClick={onToggleLike}
          disabled={isLikePending}
          aria-label={likedByMe ? '좋아요 취소' : '좋아요'}
          className={cn(
            'relative flex shrink-0 cursor-pointer items-center gap-1',
            'rounded-full border px-2.5 py-1 text-[12px] font-bold',
            'transition-colors disabled:cursor-default disabled:opacity-50',
            likedByMe
              ? 'border-main-800 bg-main-100 text-main-800'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          )}
        >
          <LikeBurst liked={likedByMe} />
          <Heart className={cn('h-3.5 w-3.5', likedByMe && 'fill-current')} />
          {likeCnt}
        </button>
      </div>

      {/* 모바일 진행률 요약 — 우측 rail 대신 컴팩트 바 */}
      <div
        className={cn(
          'mt-3.5 flex items-center gap-2.5 rounded-[12px]',
          'border-main-300 bg-main-100 border px-3.5 py-2.5'
        )}
      >
        <Text size="caption1" weight="bold" className="shrink-0 text-gray-600">
          진행률
        </Text>
        <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-white">
          <div
            className="bg-main-800 h-full rounded-full"
            style={{ width: `${isInfinite ? 100 : progressPercent}%` }}
          />
        </div>
        <Text
          size="body2"
          weight="extrabold"
          className="text-main-800 shrink-0 tabular-nums"
        >
          {progressCaption}
        </Text>
      </div>
    </div>
  );
}
