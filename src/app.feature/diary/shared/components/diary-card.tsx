'use client';

import {
  CircleAvatar,
  CircularProgress,
  cn,
  ImagePlaceholder,
  Text,
} from '@1d1s/design-system';
import Image from 'next/image';
import React, { useState } from 'react';

type Emotion = 'happy' | 'soso' | 'sad';

function Heart(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function HeartFilled(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="currentColor"
      />
    </svg>
  );
}

interface ImageSectionProps {
  imageUrl?: string;
  alt: string;
  emotion: Emotion;
  percent: number;
  isLiked: boolean;
  likeCount: number;
  onToggleLike(): void;
}

function ImageSection({
  imageUrl,
  alt,
  percent,
  emotion,
  isLiked,
  likeCount,
  onToggleLike,
}: ImageSectionProps): React.ReactElement {
  const emotionEmojiMap: Record<Emotion, string> = {
    happy: '😎',
    soso: '🙂',
    sad: '🥲',
  };
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const hasImage = Boolean(imageUrl && imageUrl.trim().length > 0);

  return (
    <div className="relative aspect-4/5 w-full overflow-hidden bg-gray-100">
      {hasImage ? (
        <Image
          src={imageUrl as string}
          alt={alt}
          fill
          className="h-full w-full object-cover"
        />
      ) : (
        <ImagePlaceholder className="h-full w-full" logoSize="lg" />
      )}
      {hasImage ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-black/15 to-transparent" />
      ) : null}

      <div className="absolute top-3 left-3 z-20">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_6px_14px_rgba(34,34,34,0.2)] sm:h-12 sm:w-12">
          <CircularProgress
            value={clampedPercent}
            size="sm"
            showPercentage={true}
          />
        </div>
      </div>

      <div className="absolute top-3 right-3 z-20 text-2xl leading-none sm:text-3xl">
        <span role="img" aria-label={emotion}>
          {emotionEmojiMap[emotion]}
        </span>
      </div>

      <div className="absolute bottom-3 left-3 z-20">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleLike();
          }}
          className="bg-main-800 hover:bg-main-900 inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-white shadow-[0_4px_10px_rgba(34,34,34,0.25)] transition-colors"
        >
          {isLiked ? (
            <HeartFilled width={14} height={14} className="text-white" />
          ) : (
            <Heart width={14} height={14} className="text-white" />
          )}
          <Text size="body2" weight="bold" className="text-white">
            {likeCount}
          </Text>
        </button>
      </div>
    </div>
  );
}

interface TextSectionProps {
  title: string;
  user: string;
  userImage?: string;
  challengeLabel: string;
  onChallengeClick?(): void;
  onUserClick?(): void;
  date: string;
}

function TextSection({
  title,
  user,
  userImage,
  challengeLabel,
  onChallengeClick,
  onUserClick,
  date,
}: TextSectionProps): React.ReactElement {
  return (
    <div className="flex w-full flex-col gap-2 p-3 sm:gap-3 sm:p-4">
      <Text
        as="p"
        size="body2"
        weight="bold"
        className="line-clamp-2 min-h-8 leading-tight text-gray-900 sm:min-h-10 sm:text-xl"
      >
        {title}
      </Text>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onChallengeClick?.();
        }}
        className={cn(
          'rounded-1 block w-full cursor-pointer px-1 py-0.5 text-left transition-colors',
          'hover:bg-gray-100'
        )}
      >
        <Text
          size="caption1"
          weight="medium"
          className="block w-full truncate text-blue-500 sm:text-lg"
        >
          {challengeLabel}
        </Text>
      </button>

      <div className="h-px w-full bg-gray-200" />

      <div
        className={cn(
          'flex items-center gap-2 sm:gap-3',
          onUserClick &&
            'rounded-1 cursor-pointer px-1 py-0.5 transition-colors hover:bg-gray-100'
        )}
        role={onUserClick ? 'button' : undefined}
        tabIndex={onUserClick ? 0 : undefined}
        onClick={
          onUserClick
            ? (event) => {
                event.stopPropagation();
                onUserClick();
              }
            : undefined
        }
        onKeyDown={
          onUserClick
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.stopPropagation();
                  onUserClick();
                }
              }
            : undefined
        }
      >
        <CircleAvatar imageUrl={userImage} size="sm" />
        <div className="flex flex-col gap-0.5 sm:gap-1">
          <Text
            size="caption1"
            weight="bold"
            className="text-gray-900 sm:text-lg"
          >
            {user}
          </Text>
          <Text
            size="caption3"
            weight="regular"
            className="text-gray-500 sm:text-sm"
          >
            {date}
          </Text>
        </div>
      </div>
    </div>
  );
}

export interface DiaryCardProps {
  imageUrl?: string;
  percent: number;
  likes: number;
  isLiked?: boolean;
  defaultLiked?: boolean;
  onLikeToggle?(nextLiked: boolean): void;
  title: string;
  user: string;
  userImage?: string;
  challengeLabel: string;
  totalMemberCount?: number;
  onChallengeClick?(): void;
  /** 프로필(아바타 + 이름) 클릭 시 호출되는 콜백. 지정하면 프로필 영역이 클릭 가능해집니다. */
  onUserClick?(): void;
  date: string;
  emotion: Emotion;
  onClick?(): void;
}

export function DiaryCard({
  imageUrl,
  percent,
  likes,
  isLiked: isLikedProp,
  defaultLiked = false,
  onLikeToggle,
  title,
  user,
  userImage,
  challengeLabel,
  totalMemberCount,
  onChallengeClick,
  onUserClick,
  date,
  emotion = 'happy',
  onClick,
}: DiaryCardProps): React.ReactElement {
  const isLikeControlled = typeof isLikedProp === 'boolean';
  const [internalIsLiked, setInternalIsLiked] = useState<boolean>(defaultLiked);
  const [internalLikeCount, setInternalLikeCount] = useState<number>(likes);
  const [prevLikes, setPrevLikes] = useState(likes);
  const isLiked = isLikeControlled ? isLikedProp : internalIsLiked;
  const likeCount = isLikeControlled ? likes : internalLikeCount;

  if (!isLikeControlled && prevLikes !== likes) {
    setPrevLikes(likes);
    setInternalLikeCount(likes);
  }

  const handleToggleLike = (): void => {
    const nextLiked = !isLiked;
    const nextLikeCount = Math.max(0, likeCount + (nextLiked ? 1 : -1));

    if (!isLikeControlled) {
      setInternalIsLiked(nextLiked);
      setInternalLikeCount(nextLikeCount);
    }
    onLikeToggle?.(nextLiked);
  };

  const challengeTypeLabel =
    typeof totalMemberCount === 'number'
      ? totalMemberCount <= 1
        ? '개인'
        : '단체'
      : challengeLabel;

  return (
    <div
      className={cn('block w-full', onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <div className="rounded-4 overflow-hidden border border-gray-200 bg-white transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
        <ImageSection
          imageUrl={imageUrl}
          alt={title}
          percent={percent}
          emotion={emotion}
          isLiked={isLiked}
          likeCount={likeCount}
          onToggleLike={handleToggleLike}
        />

        <TextSection
          title={title}
          user={user}
          userImage={userImage}
          challengeLabel={challengeTypeLabel}
          onChallengeClick={onChallengeClick}
          onUserClick={onUserClick}
          date={date}
        />
      </div>
    </div>
  );
}
