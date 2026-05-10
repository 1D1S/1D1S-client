'use client';

import { Card, ChallengeTag, Icon, Stripe, Text } from '@1d1s/design-system';
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
  const handleKeyDown = (
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
    <Card
      interactive
      radius="md"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'hover:shadow-[0_10px_28px_rgba(255,87,34,0.18)]',
        className
      )}
    >
      <Card.Thumb className="bg-main-100 aspect-[4/5]">
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
        <Card.Overlay position="top-left">
          <span
            className={cn(
              'inline-flex items-center gap-0.5',
              'rounded-full bg-white px-2 py-0.5',
              'text-brand text-[11px] font-extrabold shadow-sm'
            )}
          >
            <Icon name="Check" size={10} />
            {percent}%
          </span>
        </Card.Overlay>
        <Card.Overlay position="top-right">
          <span
            aria-hidden
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center',
              'rounded-full bg-white text-base shadow-sm'
            )}
          >
            {EMOTION_EMOJI[emotion]}
          </span>
        </Card.Overlay>
      </Card.Thumb>
      <Card.Body className="gap-1.5 p-3">
        <div className="flex">
          <ChallengeTag size="sm" className="max-w-full truncate">
            {challengeLabel}
          </ChallengeTag>
        </div>
        <Text
          size="caption2"
          weight="extrabold"
          className="truncate leading-snug tracking-tight text-gray-900"
        >
          {title}
        </Text>
        <Card.Meta>
          <span className="truncate text-[10px] font-medium text-gray-500">
            {user} · {date}
          </span>
          <button
            type="button"
            onClick={handleLikeClick}
            aria-pressed={isLiked}
            aria-label={isLiked ? '좋아요 취소' : '좋아요'}
            className={cn(
              'inline-flex shrink-0 cursor-pointer items-center gap-1',
              'font-bold text-gray-600'
            )}
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
        </Card.Meta>
      </Card.Body>
    </Card>
  );
}
