'use client';

import { Card, Icon, Stripe, Text } from '@1d1s/design-system';
import FadeInImage from '@component/FadeInImage';
import { ChallengeChip } from '@feature/challenge/shared/components/ChallengeChip';
import { cn } from '@module/utils/cn';
import { createActivationKeydownHandler } from '@module/utils/event';
import Image from 'next/image';
import React from 'react';

export type DiaryEmotion = 'happy' | 'soso' | 'sad';

const EMOTION_IMAGE: Record<DiaryEmotion, { src: string; alt: string }> = {
  happy: { src: '/images/mood-happy.svg', alt: '행복한 얼굴' },
  soso: { src: '/images/mood-soso.svg', alt: '무표정 얼굴' },
  sad: { src: '/images/mood-sad.svg', alt: '슬픈 얼굴' },
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

function DiaryCard({
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
  const handleKeyDown = createActivationKeydownHandler<HTMLDivElement>(onClick);

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
        'transition-all duration-500 ease-out',
        'hover:shadow-warm',
        className
      )}
    >
      <Card.Thumb className="bg-main-100 aspect-[4/5]">
        {hasImage ? (
          <FadeInImage
            src={imageUrl as string}
            alt={title}
            fill
            sizes="(min-width: 1024px) 280px, 50vw"
            className="object-cover"
            fallbackSrc="/images/default-card.png"
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
          {/* 무드 SVG는 정적 에셋이라 최적화가 불필요하고, next/image 최적화기는
              prod 에서 SVG를 차단(dangerouslyAllowSVG=false)하므로 unoptimized 로
              /public 에서 직접 서빙한다. */}
          <Image
            src={EMOTION_IMAGE[emotion].src}
            alt={EMOTION_IMAGE[emotion].alt}
            width={32}
            height={32}
            className="h-8 w-8"
            unoptimized
          />
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
                <FadeInImage
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

// 일지 보드는 무한 스크롤로 수십 장이 누적되므로 동일 props 재렌더를 피하기
// 위해 React.memo 로 감싼다. 부모는 onClick/onLikeToggle 을 useCallback 으로
// 안정화해야 한다.
export default React.memo(DiaryCard);
