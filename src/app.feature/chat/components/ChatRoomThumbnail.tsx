'use client';

import { Stripe } from '@1d1s/design-system';
import { CategoryIcon, getCategoryStripeTone } from '@constants/categories';
import { cn } from '@module/utils/cn';
import { resolveDiaryImageUrl } from '@module/utils/diaryImageUrl';
import { BookOpen, Flag } from 'lucide-react';
import React from 'react';

interface ChatRoomThumbnailProps {
  url?: string | null;
  /** 챌린지면 그 카테고리. 일지는 비운다 — 소속 챌린지 카테고리를 빌려 쓰면
   *  "이 일지의 카테고리" 로 읽혀 혼동된다. */
  category?: string | null;
  /** 카테고리가 없을 때 그릴 아이콘. 챌린지·채팅방은 깃발, 일지는 책. */
  fallback?: 'challenge' | 'diary';
  className?: string;
}

/**
 * 목록·공유 카드가 함께 쓰는 썸네일. 대표 이미지가 없으면 카테고리 기본
 * 그림(줄무늬 + 카테고리 아이콘)을 채운다 — 에셋이 아니라 그리는 것이다.
 *
 * 챌린지 대표 이미지는 3:2 라 정사각에 넣으면 좌우가 잘려 답답하다.
 * 비율은 호출부가 className 으로 준다.
 */
export function ChatRoomThumbnail({
  url,
  category,
  fallback = 'challenge',
  className,
}: ChatRoomThumbnailProps): React.ReactElement {
  const resolved = resolveDiaryImageUrl(url);
  const FallbackIcon = fallback === 'diary' ? BookOpen : Flag;
  const wrapper = cn(
    'relative shrink-0 overflow-hidden rounded-[10px] bg-gray-100',
    // 둥근 모서리 안쪽을 확실히 자른다 — 이미지든 줄무늬 폴백이든
    // 코너가 테두리 밖으로 삐져나오지 않게(사파리 클리핑 보정).
    '[transform:translateZ(0)]',
    className
  );

  if (resolved) {
    return (
      <div className={wrapper}>
        {/* eslint-disable-next-line @next/next/no-img-element -- S3 호스트가
            환경마다 달라 next/image remotePatterns 로 고정할 수 없다. */}
        <img
          src={resolved}
          alt=""
          loading="lazy"
          // 비율이 제각각인 원본을 자리에 맞춰 가운데 기준으로 채운다.
          // object-center 는 기본값이지만, "왜 잘리는가" 가 의도된 동작임을
          // 남겨 둔다.
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <Stripe
        tone={
          category ? getCategoryStripeTone(category) : 'var(--color-main-300)'
        }
        className="absolute inset-0"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {category ? (
          <CategoryIcon category={category} className="h-4 w-4 text-white" />
        ) : (
          <FallbackIcon className="h-4 w-4 text-white" />
        )}
      </div>
    </div>
  );
}
