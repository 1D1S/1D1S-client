'use client';

import { Button, Card, ProgressBar, Text } from '@1d1s/design-system';
import { CountUp } from '@component/CountUp';
import LikeBurst from '@component/LikeBurst';
import { cn } from '@module/utils/cn';
import { Heart } from 'lucide-react';
import React from 'react';

interface ChallengeProgressCardProps {
  progressPercent: number;
  participantsLabel: string;
  remainingLabel: string;
  ctaLabel: string;
  onCtaClick(): void;
  ctaDisabled?: boolean;
  ctaVariant?: 'primary' | 'secondary';
  showCta?: boolean;
  ctaHint?: string;
  secondaryCtaLabel?: string;
  onSecondaryCtaClick?(): void;
  secondaryCtaVariant?: 'primary' | 'secondary';
  isInfinite?: boolean;
  likeCount?: number;
  likedByMe?: boolean;
  onToggleLike?(): void;
  isLikePending?: boolean;
}

export function ChallengeProgressCard({
  progressPercent,
  participantsLabel,
  remainingLabel,
  ctaLabel,
  onCtaClick,
  ctaDisabled = false,
  ctaVariant = 'primary',
  showCta = true,
  ctaHint,
  secondaryCtaLabel,
  onSecondaryCtaClick,
  secondaryCtaVariant = 'secondary',
  isInfinite = false,
  likeCount,
  likedByMe = false,
  onToggleLike,
  isLikePending = false,
}: ChallengeProgressCardProps): React.ReactElement {
  const clamped = Math.min(100, Math.max(0, progressPercent));
  const showLikeButton = onToggleLike != null;

  return (
    <Card radius="lg" className="p-[18px]">
      <div className="flex items-center justify-between">
        <Text size="caption1" weight="bold" className="text-gray-500">
          현재 진행률
        </Text>
        {showLikeButton ? (
          <button
            type="button"
            onClick={onToggleLike}
            disabled={isLikePending}
            aria-label={likedByMe ? '좋아요 취소' : '좋아요'}
            className={cn(
              'relative flex cursor-pointer items-center gap-1 rounded-full',
              'border px-2 py-1 text-[11px] font-bold transition-colors',
              'disabled:cursor-default disabled:opacity-50',
              likedByMe
                ? 'border-main-800 bg-main-100 text-main-800'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            <LikeBurst liked={likedByMe} />
            <Heart className={cn('h-3 w-3', likedByMe && 'fill-current')} />
            {likeCount ?? 0}
          </button>
        ) : null}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <Text
          size="display2"
          weight="extrabold"
          className="text-main-800 leading-none tracking-[-0.6px]"
        >
          {isInfinite ? '∞' : <CountUp value={clamped} />}
        </Text>
        {isInfinite ? null : (
          <Text size="body1" weight="bold" className="text-gray-500">
            %
          </Text>
        )}
      </div>
      <div className="mt-2.5">
        <ProgressBar
          value={clamped}
          size="sm"
          infinite={isInfinite}
          showValueText={false}
          fillClassName="animate-bar-fill"
        />
      </div>
      <div
        className={cn(
          'mt-3 flex items-center justify-between gap-2',
          'text-[12px] text-gray-500'
        )}
      >
        <span>{participantsLabel}</span>
        <span>{remainingLabel}</span>
      </div>
      {showCta ? (
        <div className="mt-3.5">
          <Button
            size="md"
            variant={ctaVariant}
            fullWidth
            onClick={onCtaClick}
            disabled={ctaDisabled}
          >
            {ctaLabel}
          </Button>
          {secondaryCtaLabel && onSecondaryCtaClick ? (
            <Button
              size="md"
              variant={secondaryCtaVariant}
              fullWidth
              onClick={onSecondaryCtaClick}
              className="mt-2"
            >
              {secondaryCtaLabel}
            </Button>
          ) : null}
          {ctaHint ? (
            <Text
              size="caption1"
              weight="regular"
              className="mt-2 block text-center text-gray-500"
            >
              {ctaHint}
            </Text>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
