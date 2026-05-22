'use client';

import { Button, Card, ProgressBar, Text } from '@1d1s/design-system';
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
  ctaVariant?: 'default' | 'outlined';
  showCta?: boolean;
  ctaHint?: string;
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
  ctaVariant = 'default',
  showCta = true,
  ctaHint,
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
              'flex items-center gap-1 rounded-full px-2 py-1',
              'text-[11px] font-bold transition-colors',
              'disabled:opacity-50',
              likedByMe
                ? 'text-main-800 bg-main-200 hover:bg-main-300/70'
                : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <Heart
              className={cn(
                'h-3 w-3',
                likedByMe && 'fill-current'
              )}
            />
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
          {isInfinite ? '∞' : clamped}
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
            size="medium"
            variant={ctaVariant}
            fullWidth
            onClick={onCtaClick}
            disabled={ctaDisabled}
          >
            {ctaLabel}
          </Button>
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
