'use client';

import { ChallengeTag, Icon, Stripe } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

export type DiaryEmotion = 'happy' | 'soso' | 'sad';

const EMOTION_EMOJI: Record<DiaryEmotion, string> = {
  happy: '😊',
  soso: '😌',
  sad: '😔',
};

export interface DiaryCardProps {
  imageUrl?: string;
  percent: number;
  isLiked: boolean;
  likes: number;
  title: string;
  user: string;
  date: string;
  challengeLabel: string;
  emotion: DiaryEmotion;
  onClick?(): void;
  onLikeToggle?(): void;
  className?: string;
}

export default function DiaryCard({
  imageUrl,
  percent,
  isLiked,
  likes,
  title,
  user,
  date,
  challengeLabel,
  emotion,
  onClick,
  onLikeToggle,
  className,
}: DiaryCardProps): React.ReactElement {
  const handleCardKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  const handleLikeClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.stopPropagation();
    onLikeToggle?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleCardKeyDown}
      className={cn(
        'group flex w-full cursor-pointer flex-col overflow-hidden',
        'rounded-3 border border-gray-200 bg-white text-left',
        'transition-[transform,box-shadow,border-color] duration-200 ease-out',
        'hover:border-main-200 hover:-translate-y-1',
        'hover:shadow-[0_10px_28px_rgba(255,87,34,0.18)]',
        className
      )}
    >
      <div className="bg-main-100 relative aspect-[4/5] w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 280px, 50vw"
            className="object-cover"
          />
        ) : (
          <Stripe tone="cream" />
        )}
        <span
          className={cn(
            'absolute top-2 left-2 inline-flex items-center gap-0.5',
            'rounded-full bg-white px-2 py-0.5',
            'text-brand text-[11px] font-extrabold shadow-sm'
          )}
        >
          <Icon name="Check" size={10} />
          {percent}%
        </span>
        <span
          aria-hidden
          className={cn(
            'absolute top-2 right-2 inline-flex h-6 w-6',
            'items-center justify-center rounded-full bg-white text-base',
            'shadow-sm'
          )}
        >
          {EMOTION_EMOJI[emotion]}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <div className="flex">
          <ChallengeTag size="sm" className="max-w-full truncate">
            {challengeLabel}
          </ChallengeTag>
        </div>
        <div
          className={cn(
            'truncate text-[13px] font-extrabold text-gray-900',
            'leading-snug tracking-tight'
          )}
        >
          {title}
        </div>
        <div className="flex items-center justify-between">
          <span className="truncate text-[10px] font-medium text-gray-500">
            {user} · {date}
          </span>
          <button
            type="button"
            onClick={handleLikeClick}
            className={cn(
              'inline-flex shrink-0 cursor-pointer items-center gap-1',
              'text-[11px] font-bold text-gray-600'
            )}
            aria-pressed={isLiked}
            aria-label={isLiked ? '좋아요 취소' : '좋아요'}
          >
            <Icon
              name={isLiked ? 'HeartFilled' : 'Heart'}
              size={13}
              className={cn(
                'transition',
                isLiked ? 'animate-heart-pop text-red-500' : 'text-gray-400'
              )}
            />
            {likes}
          </button>
        </div>
      </div>
    </div>
  );
}
