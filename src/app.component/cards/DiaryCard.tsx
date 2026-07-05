'use client';

import { Card, Icon, Stripe, Text } from '@1d1s/design-system';
import FadeInImage from '@component/FadeInImage';
import LikeBurst from '@component/LikeBurst';
import { ChallengeChip } from '@feature/challenge/shared/components/ChallengeChip';
import { cn } from '@module/utils/cn';
import { createActivationKeydownHandler } from '@module/utils/event';
import Image from 'next/image';
import Link from 'next/link';
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
  /** 지정 시 카드 전체가 <Link> 가 된다(stretched-link). 뷰포트 진입 시
   *  자동 prefetch 되고 onClick 은 무시된다. 로그인 게이팅처럼 이동 대신
   *  다른 동작이 필요하면 href 를 생략하고 onClick 을 사용한다. */
  href?: string;
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
  href,
  onClick,
  onLikeToggle,
  className,
}: DiaryCardProps): React.ReactElement {
  const handleKeyDown = createActivationKeydownHandler<HTMLDivElement>(onClick);
  // href 모드에서는 내부의 stretched-link 가 키보드 포커스/활성화를 담당
  // 하므로 루트에 button 시맨틱을 주지 않는다 (탭 스톱 중복 방지).
  const rootInteractiveProps = href
    ? {}
    : {
        role: 'button' as const,
        tabIndex: 0,
        onClick,
        onKeyDown: handleKeyDown,
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
      {...rootInteractiveProps}
      className={cn(
        'transition-all duration-500 ease-out',
        'hover:shadow-warm',
        href && 'relative',
        className
      )}
    >
      {href ? (
        // z-[2]: Card.Thumb(relative) 와 오버레이(z-[1]) 위로 올려 썸네일
        // 영역 클릭도 링크에 닿게 한다. 좋아요 버튼만 z-[3] 로 위에 둔다.
        <Link
          href={href}
          aria-label={`${title} 일지 보기`}
          className="absolute inset-0 z-[2]"
        />
      ) : null}
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
        {/* 배지/무드 오버레이는 장식 요소 — stretched-link 위에 떠서
            클릭 데드존이 되지 않도록 포인터 이벤트를 통과시킨다. */}
        <Card.Overlay position="top-left" className="pointer-events-none">
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
            <span
              className={cn(
                'inline-flex items-center rounded-full bg-gray-900/55',
                'px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm',
                'backdrop-blur-sm'
              )}
            >
              {percent}%
            </span>
          )}
        </Card.Overlay>
        <Card.Overlay position="top-right" className="pointer-events-none">
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
                // pointer-events-none: positioned 장식 요소가 stretched-link
                // 위 클릭 데드존이 되지 않게 한다.
                'pointer-events-none relative h-5 w-5 shrink-0',
                'overflow-hidden rounded-full bg-gray-100'
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
              // z-[3]: stretched-link(z-[2]) 위에 둬서 좋아요 클릭이
              // 링크로 새지 않게 한다.
              'group/like relative z-[3] inline-flex shrink-0',
              'cursor-pointer items-center gap-1 rounded-full px-2 py-1',
              'font-bold transition-colors',
              'hover:bg-red-50 motion-safe:active:scale-95',
              isLiked
                ? 'bg-red-50 text-red-500'
                : 'bg-gray-100 text-gray-600 hover:text-red-400'
            )}
          >
            <span className="relative inline-flex">
              <LikeBurst liked={isLiked} />
              <Icon
                name={isLiked ? 'HeartFilled' : 'Heart'}
                size={13}
                className={cn(
                  'transition',
                  isLiked
                    ? 'animate-heart-pop text-red-500'
                    : 'text-gray-400 group-hover/like:text-red-400'
                )}
              />
            </span>
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
