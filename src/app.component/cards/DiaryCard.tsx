'use client';

import { Card, Icon, Stripe, Text } from '@1d1s/design-system';
import { ChallengeChip } from '@feature/challenge/shared/components/ChallengeChip';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

export type DiaryEmotion = 'happy' | 'soso' | 'sad';

const EMOTION_EMOJI: Record<DiaryEmotion, string> = {
  happy: '😊',
  soso: '😌',
  sad: '😔',
};

const EMOTION_STRIPE_TONE: Record<DiaryEmotion, 'peach' | 'mint' | 'sky'> = {
  happy: 'peach',
  soso: 'mint',
  sad: 'sky',
};

// next/image는 절대 URL이거나 / 시작 상대 경로만 허용한다. 백엔드가 raw key를
// 줄 때 next/image의 URL 파서가 throw 하므로 안전한 형태만 통과시킨다.
function isValidNextImageSrc(src: string | undefined): src is string {
  if (!src) {
    return false;
  }
  if (src.startsWith('/')) {
    return true;
  }
  return /^(https?:|data:|blob:)/i.test(src);
}

export interface DiaryCardProps {
  imageUrl?: string;
  profileImageUrl?: string;
  percent: number;
  isLiked: boolean;
  likes: number;
  title: string;
  user: string;
  challengeLabel: string;
  emotion: DiaryEmotion;
  onClick?(): void;
  onLikeToggle?(): void;
  className?: string;
}

export default function DiaryCard({
  imageUrl,
  profileImageUrl,
  percent,
  isLiked,
  likes,
  title,
  user,
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

  const isComplete = percent >= 100;
  const tone = EMOTION_STRIPE_TONE[emotion];
  const hasImage = isValidNextImageSrc(imageUrl);
  const hasProfileImage = isValidNextImageSrc(profileImageUrl);

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
        {hasImage ? (
          <Image
            src={imageUrl as string}
            alt={title}
            fill
            sizes="(min-width: 1024px) 280px, 50vw"
            className="object-cover"
          />
        ) : (
          <Stripe tone={tone} />
        )}
        <Card.Overlay position="top-left">
          {isComplete ? (
            <span
              className={cn(
                'bg-brand inline-flex items-center gap-1 rounded-full',
                'px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm'
              )}
            >
              <span aria-hidden>✨</span>
              완료
            </span>
          ) : (
            <span className="text-xs font-extrabold text-gray-800">
              {percent}%
            </span>
          )}
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
        <Text
          size="caption2"
          weight="extrabold"
          className="truncate leading-snug tracking-tight text-gray-900"
        >
          {title}
        </Text>
        <ChallengeChip
          title={challengeLabel}
          size="xs"
          className="self-start"
        />
        <Card.Meta>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <span
              className={cn(
                'relative h-5 w-5 shrink-0 overflow-hidden rounded-full',
                'bg-gray-100'
              )}
              aria-hidden
            >
              {hasProfileImage ? (
                <Image
                  src={profileImageUrl as string}
                  alt=""
                  fill
                  sizes="20px"
                  className="object-cover"
                />
              ) : null}
            </span>
            <span className="truncate text-[11px] font-medium text-gray-500">
              {user}
            </span>
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
