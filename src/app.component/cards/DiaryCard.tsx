'use client';

import { Card, Icon, Text } from '@1d1s/design-system';
import { ChallengeChip } from '@component/cards/ChallengeChip';
import FadeInImage from '@component/FadeInImage';
import LikeBurst from '@component/LikeBurst';
import { Skeleton } from '@component/Skeleton';
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

// 감정별 무드 컬러 — 포인트 텍스트(달성률) / 체크 원 배경(달성 목표).
// 무드 SVG 얼굴색 팔레트(happy=main/피치, soso=mint, sad=blue)를 따르되,
// 흰 체크·텍스트 대비를 위해 한 단계 진한 톤을 쓴다.
const EMOTION_TONE: Record<DiaryEmotion, { fg: string; check: string }> = {
  happy: { fg: 'text-main-700', check: 'bg-main-700' },
  soso: { fg: 'text-mint-900', check: 'bg-mint-800' },
  sad: { fg: 'text-blue-600', check: 'bg-blue-500' },
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

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

// 일지 본문은 Tiptap HTML 로 저장된다. 카드 발췌(2줄)용으로 태그를 벗겨
// 플레인 텍스트만 남긴다. 렌더가 아닌 발췌라 정규식 스트립으로 충분하다.
function toPlainExcerpt(html: string | undefined): string {
  if (!html) {
    return '';
  }
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(
      /&(nbsp|amp|lt|gt|quot|#39);/gi,
      (entity) => HTML_ENTITIES[entity] ?? ' '
    )
    .replace(/\s+/g, ' ')
    .trim();
}

export interface DiaryCardGoal {
  challengeGoalName: string;
  isAchieved: boolean;
}

// 목표는 백엔드 정책상 최대 5개 — 전부 노출한다.
const MAX_GOALS = 5;

export interface DiaryCardProps {
  imageUrl?: string;
  profileImageUrl?: string;
  percent: number;
  isLiked: boolean;
  likes: number;
  title: string;
  /** Tiptap HTML 본문. 태그를 벗겨 최대 2줄 발췌로 보여준다. */
  content?: string;
  commentCount?: number;
  /** 일지 목표 체크리스트 (최대 5개 노출). */
  goals?: readonly DiaryCardGoal[] | null;
  /** 헤더 우측 날짜 라벨 (예: "7월 6일", "3일 전"). */
  dateLabel?: string;
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
  content,
  commentCount,
  goals,
  dateLabel,
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

  const tone = EMOTION_TONE[emotion];
  const hasImage = isValidNextImageSrc(imageUrl);
  const excerpt = toPlainExcerpt(content);
  const visibleGoals = (goals ?? []).slice(0, MAX_GOALS);

  return (
    <Card
      interactive
      radius="lg"
      {...rootInteractiveProps}
      className={cn(
        // 배경과의 구분을 위해 기본(gray-200)보다 한 단계 진한 보더
        'border-gray-300 p-4 transition-all duration-500 ease-out',
        'hover:shadow-warm',
        href && 'relative',
        className
      )}
    >
      {href ? (
        // z-[2]: 카드 정적 콘텐츠 위로 올려 카드 어디를 눌러도 링크에
        // 닿게 한다. 좋아요 버튼만 z-[3] 로 위에 둔다.
        <Link
          href={href}
          aria-label={`${title} 일지 보기`}
          className="absolute inset-0 z-[2]"
        />
      ) : null}

      {/* 헤더: 챌린지 칩 | 날짜 + 감정 */}
      <div className="flex items-center justify-between gap-2">
        <ChallengeChip title={challengeLabel} size="xs" className="min-w-0" />
        <span className="flex shrink-0 items-center gap-2">
          {dateLabel ? (
            <span className="text-[11px] font-medium text-gray-400">
              {dateLabel}
            </span>
          ) : null}
          {/* 무드 SVG는 정적 에셋이라 최적화가 불필요하고, next/image
              최적화기는 prod 에서 SVG를 차단하므로 unoptimized 로 서빙. */}
          <Image
            src={EMOTION_IMAGE[emotion].src}
            alt={EMOTION_IMAGE[emotion].alt}
            width={24}
            height={24}
            className="h-6 w-6"
            unoptimized
          />
        </span>
      </div>

      {/* 제목 — 최대 2줄 */}
      <Text
        size="body2"
        weight="extrabold"
        className={cn(
          'mt-2.5 line-clamp-2 leading-snug tracking-tight',
          'break-words text-gray-900'
        )}
      >
        {title}
      </Text>

      {/* 본문 발췌 — 있으면 최대 2줄 */}
      {excerpt ? (
        <p
          className={cn(
            'mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed',
            'break-words text-gray-600'
          )}
        >
          {excerpt}
        </p>
      ) : null}

      {/* 사진 — imageUrl 이 있으면 로드 전부터 16:9 고정 비율 박스를
          확보해 이미지가 늦게 도착해도 레이아웃 쉬프트가 없다. 로드
          전에는 스켈레톤 셔머가 자리를 지키고, 위로 이미지가
          페이드인된다. */}
      {imageUrl ? (
        <div
          className={cn(
            'relative mt-3 aspect-video overflow-hidden rounded-[10px]',
            'bg-gray-100'
          )}
        >
          <Skeleton shape="rect" className="absolute inset-0 rounded-none" />
          {hasImage ? (
            <FadeInImage
              src={imageUrl}
              alt={title}
              fill
              sizes="(min-width: 1024px) 360px, 90vw"
              className="object-cover"
              fallbackSrc="/images/default-card.png"
            />
          ) : null}
        </div>
      ) : null}

      {/* 목표 체크리스트 + 달성률(우측 고정) */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
          {/* 목표명은 중복될 수 있어 key 로 못 쓴다. 카드 내 목표 목록은
              고정 순서(재정렬 없음)라 인덱스 key 로 충분하다. */}
          {visibleGoals.map((goal, index) => (
            <li key={index} className="flex min-w-0 items-center gap-1.5">
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center',
                  'rounded-full',
                  goal.isAchieved
                    ? tone.check
                    : 'border-[1.5px] border-gray-300'
                )}
              >
                {goal.isAchieved ? (
                  <Icon
                    name="Check"
                    size={10}
                    className="text-white"
                    aria-label="달성"
                  />
                ) : null}
              </span>
              <span
                className={cn(
                  'truncate text-xs font-bold',
                  goal.isAchieved ? 'text-gray-800' : 'text-gray-400'
                )}
              >
                {goal.challengeGoalName}
              </span>
            </li>
          ))}
        </ul>
        <span
          className={cn('shrink-0 text-xs font-extrabold', tone.fg)}
        >
          달성 {percent}%
        </span>
      </div>

      {/* 푸터: 작성자 | 좋아요 + 댓글 */}
      <div
        className={cn(
          'mt-3 flex items-center justify-between gap-2',
          'border-t border-gray-100 pt-2.5'
        )}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              'relative h-5 w-5 shrink-0',
              'overflow-hidden rounded-full bg-gray-100'
            )}
            aria-hidden
          >
            {isValidNextImageSrc(profileImageUrl) ? (
              <FadeInImage
                src={profileImageUrl}
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
        <span className="flex shrink-0 items-center gap-1.5">
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
              'text-[11px] font-bold transition-colors',
              'hover:bg-red-50 motion-safe:active:scale-95',
              isLiked
                ? 'text-red-500'
                : 'text-gray-500 hover:text-red-400'
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
          {typeof commentCount === 'number' ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-1 text-[11px]',
                'font-bold text-gray-500'
              )}
              aria-label={`댓글 ${commentCount}개`}
            >
              {/* 디자인 시스템에 말풍선 아이콘이 없어 인라인 SVG 사용 */}
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
                aria-hidden
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
              {commentCount}
            </span>
          ) : null}
        </span>
      </div>
    </Card>
  );
}

// 일지 보드는 무한 스크롤로 수십 장이 누적되므로 동일 props 재렌더를 피하기
// 위해 React.memo 로 감싼다. 부모는 onClick/onLikeToggle 을 useCallback 으로
// 안정화해야 한다.
export default React.memo(DiaryCard);
