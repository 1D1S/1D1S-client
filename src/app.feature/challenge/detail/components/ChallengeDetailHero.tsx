'use client';

import { Stripe, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

const PILL_CLASS = cn(
  'inline-flex items-center rounded-full bg-white/95',
  'px-2.5 py-1 text-[11px] font-extrabold'
);

interface ChallengeDetailHeroProps {
  title: string;
  categoryLabel: string;
  typeLabel: string;
  metaLabel: string;
  imageUrl?: string | null;
  accent: string;
  gradient: string;
  bleed?: boolean;
  // 모바일에서는 콘텐츠 헤더가 카드 안으로 이동하므로 텍스트를 숨긴다.
  hideTextOnMobile?: boolean;
}

export function ChallengeDetailHero({
  title,
  categoryLabel,
  typeLabel,
  metaLabel,
  imageUrl,
  accent,
  gradient,
  bleed = false,
  hideTextOnMobile = false,
}: ChallengeDetailHeroProps): React.ReactElement {
  return (
    <div
      className={cn(
        'relative aspect-[21/9] w-full overflow-hidden',
        'lg:max-h-[360px]',
        !bleed && 'rounded-4'
      )}
      style={{ background: gradient }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          priority
          sizes="(min-width: 1024px) 1200px, 100vw"
          className="object-cover"
        />
      ) : (
        // 카드 placeholder 와 같은 불투명 톤으로 줄무늬를 그린다.
        // 이전엔 `rgba(255,255,255,0.16)` 반투명 흰색을 넘겨, 디자인 시스템의
        // `repeating-linear-gradient(..., color, color×98% + black×2%, ...)`
        // 양 밴드가 모두 반투명이 되어 카드의 또렷한 줄무늬와 달라 보였다.
        <div className="absolute inset-0" aria-hidden>
          <Stripe tone={accent} radius={0} />
        </div>
      )}
      {imageUrl ? (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t',
            'from-black/55 via-black/20 to-transparent'
          )}
          aria-hidden
        />
      ) : null}
      <div
        className={cn(
          'absolute inset-0 flex-col justify-end gap-2.5',
          'p-6 text-white md:p-8',
          hideTextOnMobile ? 'hidden lg:flex' : 'flex'
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={PILL_CLASS} style={{ color: accent }}>
            {categoryLabel}
          </span>
          <span className={PILL_CLASS} style={{ color: accent }}>
            {typeLabel}
          </span>
        </div>
        <Text
          as="h1"
          size="display2"
          weight="extrabold"
          className={cn(
            'break-keep whitespace-pre-wrap text-white',
            'tracking-[-0.6px] drop-shadow-sm'
          )}
        >
          {title}
        </Text>
        <Text
          size="body2"
          weight="medium"
          className="text-white/90 drop-shadow-sm"
        >
          {metaLabel}
        </Text>
      </div>
    </div>
  );
}
