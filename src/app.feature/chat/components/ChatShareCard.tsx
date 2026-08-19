'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { resolveDiaryImageUrl } from '@module/utils/diaryImageUrl';
import { BookOpen, ChevronRight, Flag, Youtube } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { ChatLinkPreview, ChatMessage, chatSharePath } from '../type/chat';
import { ChatRoomThumbnail } from './ChatRoomThumbnail';

// 공유 카드와 링크 미리보기의 폭. 둘이 제각각이면 말풍선 줄이 들쭉날쭉해
// 보인다 — 한 값을 같이 쓴다.
//
// `max-w-full` 이 핵심이다. 232px 고정만 두면 좁은 화면에서 말풍선
// 콘텐츠 폭(= 최대 80% 에서 시각 라벨과 좌우 패딩을 뺀 값)보다 카드가
// 넓어지는데, 말풍선이 `overflow-hidden` 이라 **오른쪽이 잘린 채** 그려진다
// (모바일에서 카드가 한쪽으로 쏠려 보이던 원인). 232px 는 이제 상한이고,
// 자리가 모자라면 카드가 말풍선에 맞춰 줄어든다.
const CARD_CLASS = cn(
  'w-[250px] max-w-full min-w-0 overflow-hidden rounded-[18px] border',
  'shadow-[0_2px_8px_-4px_rgba(0,0,0,0.10)]',
  // 라운드 + 보더 + 자식 이미지 조합에서 코너가 깨져 보이던 것을 막는다.
  // 사파리는 `overflow:hidden` 만으로는 둥근 모서리 안쪽을 늘 정확히
  // 자르지 않는다 — 새 합성 레이어를 만들면 클리핑이 확실해진다.
  '[transform:translateZ(0)]'
);

/**
 * 카드 안쪽 상단 이미지에 줄 라운드. 보더 두께(1px)만큼 작아야 테두리와
 * 이미지 사이에 각진 틈이 안 생긴다.
 */
const CARD_TOP_CLIP = 'rounded-t-[17px]';

/**
 * 공유 카드. 볼 수 없는 대상이면 눌리지 않는다 — 보낼 땐 공개였던 일지가
 * 나중에 비공개로 바뀌면 서버가 available=false 로 내려준다.
 */
export function ChatShareCard({
  message,
  isMine = false,
}: {
  message: ChatMessage;
  isMine?: boolean;
}): React.ReactElement {
  const share = message.share;
  const path = chatSharePath(message);
  const isDiary = message.type === 'DIARY_SHARE';
  const available = share?.available ?? false;
  const TypeIcon = isDiary ? BookOpen : Flag;

  const body = (
    <>
      {/* 대표 이미지가 없는 일지도 있다 — 빈칸 대신 자리를 지킨다. */}
      {available ? (
        <ChatRoomThumbnail
          url={share?.thumbnailUrl}
          category={share?.category}
          fallback={isDiary ? 'diary' : 'challenge'}
          className={cn('h-[118px] w-full rounded-none', CARD_TOP_CLIP)}
        />
      ) : null}
      <div className="flex flex-col px-3.5 pt-3 pb-3">
        <span
          className={cn(
            'inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-[3px]',
            'text-[10.5px] leading-none font-extrabold',
            // 일지는 브랜드, 챌린지는 보라 — 두 종류를 색으로 먼저 가른다.
            isDiary
              ? 'bg-main-200 text-main-900'
              : 'bg-[#ede7f6] text-[#5e35b1]'
          )}
        >
          <TypeIcon className="h-3 w-3" />
          {isDiary ? '일지' : '챌린지'}
        </span>
        <Text
          as="h4"
          size="caption1"
          weight="extrabold"
          className={cn(
            'mt-[7px] line-clamp-2 tracking-[-0.02em]',
            available ? 'text-gray-900' : 'text-gray-500'
          )}
        >
          {/* share 자체가 안 온 것과 "볼 권한이 없다" 는 다르다. 앞의 것을
              "볼 수 없는 게시물" 로 단정하면 멀쩡한 내 일지가 그렇게 보인다. */}
          {!share
            ? isDiary
              ? '일지'
              : '챌린지'
            : available
              ? (share.title ?? '')
              : '볼 수 없는 게시물이에요'}
        </Text>
        {available && share?.subtitle ? (
          <Text size="caption2" className="mt-1 line-clamp-2 text-gray-600">
            {share.subtitle}
          </Text>
        ) : null}
      </div>
      {/* 하단 CTA — 카드가 눌러서 가는 것임을 말로 밝힌다(디자인). */}
      {available ? (
        <div
          className={cn(
            'text-main-800 flex items-center justify-between border-t',
            'border-gray-100 px-3.5 py-2.5'
          )}
        >
          <Text size="caption2" weight="extrabold" className="text-inherit">
            {isDiary ? '일지 보기' : '챌린지 보기'}
          </Text>
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      ) : null}
    </>
  );

  // 내 메시지에서만 테두리에 브랜드 기를 준다 — 예전처럼 카드를 통째로
  // 오렌지로 감싸지 않는다(디자인이 지목한 그 테두리).
  const className = cn(
    CARD_CLASS,
    'bg-white text-left',
    isMine ? 'border-main-400' : 'border-gray-200'
  );
  if (!path) {
    return <div className={className}>{body}</div>;
  }
  return (
    <Link
      href={path}
      className={cn(className, 'block transition-colors hover:bg-gray-50')}
      onClick={(event) => event.stopPropagation()}
    >
      {body}
    </Link>
  );
}

/** 링크 미리보기. 탭하면 본문 링크와 같은 방식으로 연다. */
export function ChatLinkPreviewCard({
  preview,
}: {
  preview: ChatLinkPreview;
}): React.ReactElement {
  const image = resolveDiaryImageUrl(preview.imageUrl);
  const siteName = preview.siteName ?? '';
  // 유튜브 표시는 **배지에만** 빨강을 쓴다. 글씨나 테두리를 칠하지 않는다.
  const isYoutube = siteName.toLowerCase() === 'youtube';

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noreferrer noopener"
      onClick={(event) => event.stopPropagation()}
      className={cn(
        CARD_CLASS,
        'block border-gray-200 bg-white transition-colors hover:bg-gray-50'
      )}
    >
      {image ? (
        // 외부 OG 이미지라 next/image remotePatterns 로 호스트를 고정할 수 없다.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          loading="lazy"
          className={cn(
            'h-[118px] w-full object-cover object-center',
            CARD_TOP_CLIP
          )}
        />
      ) : null}
      <div className="flex flex-col gap-1 p-2.5">
        {siteName ? (
          isYoutube ? (
            <span
              className={cn(
                'inline-flex w-fit items-center gap-1 rounded px-1.5',
                'bg-[#ff0000] py-0.5 text-white'
              )}
            >
              <Youtube className="h-3 w-3" />
              <Text size="caption4" weight="extrabold" className="text-inherit">
                {siteName}
              </Text>
            </span>
          ) : (
            <Text size="caption4" weight="extrabold" className="text-gray-500">
              {siteName}
            </Text>
          )
        ) : null}
        {preview.title ? (
          <Text size="caption2" weight="bold" className="line-clamp-2 text-gray-900">
            {preview.title}
          </Text>
        ) : null}
        {preview.description ? (
          <Text size="caption3" className="line-clamp-2 text-gray-500">
            {preview.description}
          </Text>
        ) : null}
      </div>
    </a>
  );
}

/** 보여 줄 게 있는가. url 뿐이면 본문 링크와 다를 바 없다. */
export function hasLinkPreviewContent(
  preview?: ChatLinkPreview | null
): boolean {
  return Boolean(preview && (preview.title || preview.imageUrl));
}
