'use client';

import { Icon, Stripe, Tag } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

interface HomeChallengeMiniCardProps {
  title: string;
  category: string;
  imageUrl?: string;
  currentParticipantCount: number;
  maxParticipantCount: number;
  remainingLabel: string;
  onClick?(): void;
}

export default function HomeChallengeMiniCard({
  title,
  category,
  imageUrl,
  currentParticipantCount,
  maxParticipantCount,
  remainingLabel,
  onClick,
}: HomeChallengeMiniCardProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: 200 }}
      className={cn(
        'group flex shrink-0 flex-col gap-2.5',
        'rounded-4 border border-gray-200 bg-white p-3.5 text-left',
        'transition duration-200 ease-out',
        'hover:border-main-200 hover:shadow-warm hover:-translate-y-0.5'
      )}
    >
      <div
        style={{ height: 100 }}
        className={cn(
          'rounded-2.5 relative w-full overflow-hidden',
          'bg-main-100'
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="200px"
            className="object-cover"
          />
        ) : (
          <Stripe tone="peach" />
        )}
      </div>
      <Tag tone="brand" size="xs">
        {category}
      </Tag>
      <div
        className={cn(
          'line-clamp-2 min-h-[2.6em] text-[13px] font-extrabold',
          'leading-snug tracking-tight text-gray-900'
        )}
      >
        {title}
      </div>
      <div
        className={cn(
          'mt-auto flex items-center justify-between',
          'text-[11px] text-gray-500'
        )}
      >
        <span className="inline-flex items-center gap-1">
          <Icon name="People" size={11} />
          {currentParticipantCount}/{maxParticipantCount}
        </span>
        <span className="text-brand font-bold">{remainingLabel}</span>
      </div>
    </button>
  );
}
