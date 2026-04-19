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

const emotionImageMap: Record<Emotion, { src: string; alt: string }> = {
  happy: { src: '/images/mood-happy.PNG', alt: '행복한 얼굴' },
  soso: { src: '/images/mood-soso.PNG', alt: '무표정 얼굴' },
  sad: { src: '/images/mood-sad.PNG', alt: '슬픈 얼굴' },
};

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

function CommentIcon(
  props: React.SVGProps<SVGSVGElement>
): React.ReactElement {
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
        d="M21 13a4 4 0 0 1-4 4H7l-4 4V6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface DiaryListItemProps {
  title: string;
  imageUrl?: string;
  percent: number;
  emotion: Emotion;
  likes: number;
  isLiked?: boolean;
  defaultLiked?: boolean;
  onLikeToggle?(nextLiked: boolean): void;
  commentCount?: number;
  user: string;
  userImage?: string;
  challengeLabel: string;
  totalMemberCount?: number;
  onChallengeClick?(): void;
  date: string;
  onClick?(): void;
  className?: string;
}

export function DiaryListItem({
  title,
  imageUrl,
  percent,
  emotion = 'happy',
  likes,
  isLiked: isLikedProp,
  defaultLiked = false,
  onLikeToggle,
  commentCount = 0,
  user,
  userImage,
  challengeLabel,
  totalMemberCount,
  onChallengeClick,
  date,
  onClick,
  className,
}: DiaryListItemProps): React.ReactElement {
  const isLikeControlled = typeof isLikedProp === 'boolean';
  const [internalIsLiked, setInternalIsLiked] = useState(defaultLiked);
  const [internalLikeCount, setInternalLikeCount] = useState(likes);
  const [prevLikes, setPrevLikes] = useState(likes);
  const isLiked = isLikeControlled ? isLikedProp : internalIsLiked;
  const likeCount = isLikeControlled ? likes : internalLikeCount;

  if (!isLikeControlled && prevLikes !== likes) {
    setPrevLikes(likes);
    setInternalLikeCount(likes);
  }

  const handleToggleLike = (event: React.MouseEvent): void => {
    event.stopPropagation();
    const nextLiked = !isLiked;
    const nextCount = Math.max(0, likeCount + (nextLiked ? 1 : -1));
    if (!isLikeControlled) {
      setInternalIsLiked(nextLiked);
      setInternalLikeCount(nextCount);
    }
    onLikeToggle?.(nextLiked);
  };

  const hasImage = Boolean(imageUrl && imageUrl.trim().length > 0);
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  const challengeTypeLabel =
    typeof totalMemberCount === 'number'
      ? totalMemberCount <= 1
        ? '개인'
        : '단체'
      : challengeLabel;

  return (
    <div
      className={cn(
        'rounded-4 hover:shadow-default flex min-w-[320px] gap-3 border border-gray-200 bg-white p-3 transition-all duration-200 ease-in-out hover:-translate-y-1 sm:min-w-[560px]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="rounded-l-3 relative -mt-3 -mb-3 -ml-3 w-[100px] shrink-0 self-stretch overflow-hidden bg-gray-100 sm:w-[140px]">
        {hasImage ? (
          <Image
            src={imageUrl as string}
            alt={title}
            width={128}
            height={128}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" logoSize="sm" />
        )}
        {hasImage ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-black/10 to-transparent" />
        ) : null}

        {/* Circular progress */}
        <div className="absolute top-2 left-2 z-10">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_4px_10px_rgba(34,34,34,0.18)]">
            <CircularProgress value={clampedPercent} size="sm" showPercentage />
          </div>
        </div>

        {/* Emotion */}
        <div className="absolute top-2 right-2 z-10">
          <Image
            src={emotionImageMap[emotion].src}
            alt={emotionImageMap[emotion].alt}
            width={36}
            height={36}
            className="h-9 w-9"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
        <Text
          as="p"
          size="body1"
          weight="bold"
          className="line-clamp-2 leading-snug text-gray-900"
        >
          {title}
        </Text>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onChallengeClick?.();
          }}
          className="rounded-1 block w-fit cursor-pointer px-1 py-0.5 text-left transition-colors hover:bg-gray-100"
        >
          <Text
            size="caption1"
            weight="medium"
            className="truncate text-blue-500"
          >
            {challengeTypeLabel}
          </Text>
        </button>

        <div className="h-px w-full bg-gray-200" />

        <div className="mt-auto flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <CircleAvatar imageUrl={userImage} size="sm" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text
                size="caption2"
                weight="bold"
                className="truncate text-gray-900"
              >
                {user}
              </Text>
              <Text
                size="caption2"
                weight="regular"
                className="shrink-0 text-gray-500"
              >
                {date}
              </Text>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-1 text-gray-500">
              <CommentIcon width={13} height={13} />
              <Text size="caption2" weight="medium" className="text-inherit">
                {commentCount}
              </Text>
            </span>
            <button
              type="button"
              onClick={handleToggleLike}
              className="flex shrink-0 cursor-pointer items-center gap-1 text-gray-500 transition-colors hover:text-red-500"
            >
              {isLiked ? (
                <HeartFilled width={15} height={15} className="text-red-500" />
              ) : (
                <Heart width={15} height={15} />
              )}
              <Text size="caption2" weight="medium" className="text-inherit">
                {likeCount}
              </Text>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
