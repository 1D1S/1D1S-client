'use client';

import { Button, Card, ProgressBar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
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
  isInfinite?: boolean;
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
  isInfinite = false,
}: ChallengeProgressCardProps): React.ReactElement {
  const clamped = Math.min(100, Math.max(0, progressPercent));

  return (
    <Card radius="lg" className="p-5 md:p-6">
      <div
        className={cn(
          'flex flex-col gap-4',
          'md:flex-row md:items-center md:gap-6'
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Text size="caption1" weight="bold" className="text-gray-500">
              현재 진행률
            </Text>
            <Text size="caption2" weight="medium" className="text-gray-500">
              {participantsLabel} · {remainingLabel}
            </Text>
          </div>
          <div className="flex items-baseline gap-1">
            <Text
              size="display2"
              weight="extrabold"
              className="text-brand tracking-[-0.6px]"
            >
              {isInfinite ? '∞' : clamped}
            </Text>
            {isInfinite ? null : (
              <Text size="body1" weight="bold" className="text-gray-500">
                %
              </Text>
            )}
          </div>
          <ProgressBar
            value={clamped}
            size="md"
            infinite={isInfinite}
            showValueText={false}
          />
        </div>
        {showCta ? (
          <div className="md:w-[180px] md:shrink-0">
            <Button
              size="large"
              variant={ctaVariant}
              className="w-full"
              onClick={onCtaClick}
              disabled={ctaDisabled}
            >
              {ctaLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
