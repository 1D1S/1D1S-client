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
}

export function ChallengeDetailHero({
  title,
  categoryLabel,
  typeLabel,
  metaLabel,
  imageUrl,
  accent,
  gradient,
}: ChallengeDetailHeroProps): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-4 relative h-[200px] w-full overflow-hidden md:h-[220px]'
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
        <div
          className="absolute inset-0"
          style={{ background: gradient }}
          aria-hidden
        >
          <Stripe tone="rgba(255,255,255,0.16)" radius={0} />
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
          'absolute inset-0 flex flex-col justify-end gap-2.5',
          'p-6 text-white md:p-8'
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
