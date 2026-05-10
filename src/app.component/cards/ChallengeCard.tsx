'use client';

import { Icon, Stripe, Tag } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

export interface ChallengeCardProps {
  title: string;
  category: string;
  imageUrl?: string;
  currentParticipantCount: number;
  maxParticipantCount: number;
  remainingLabel: string;
  onClick?(): void;
  className?: string;
}

export default function ChallengeCard({
  title,
  category,
  imageUrl,
  currentParticipantCount,
  maxParticipantCount,
  remainingLabel,
  onClick,
  className,
}: ChallengeCardProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full flex-col overflow-hidden text-left',
        'rounded-3 border border-gray-200 bg-white',
        'transition-[transform,box-shadow,border-color] duration-200 ease-out',
        'hover:border-main-200 hover:-translate-y-1',
        'hover:shadow-[0_10px_28px_rgba(255,87,34,0.18)]',
        className
      )}
    >
      <div className="bg-main-100 relative h-[110px] w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 280px, 50vw"
            className="object-cover"
          />
        ) : (
          <Stripe tone="peach" />
        )}
      </div>
      <div className="flex flex-col gap-2 p-3.5">
        <div className="flex">
          <Tag tone="brand" size="xs">
            {category}
          </Tag>
        </div>
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
            'flex items-center justify-between',
            'text-[11px] text-gray-500'
          )}
        >
          <span className="inline-flex items-center gap-1">
            <Icon name="People" size={11} />
            {currentParticipantCount}/{maxParticipantCount}
          </span>
          <span className="text-brand font-bold">{remainingLabel}</span>
        </div>
      </div>
    </button>
  );
}
