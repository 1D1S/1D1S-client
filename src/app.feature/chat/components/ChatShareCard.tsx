'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { resolveDiaryImageUrl } from '@module/utils/diaryImageUrl';
import { BookOpen, Flag, Youtube } from 'lucide-react';
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
const CARD_CLASS =
  'w-[232px] max-w-full min-w-0 overflow-hidden rounded-[10px] border';

/**
 * 공유 카드. 볼 수 없는 대상이면 눌리지 않는다 — 보낼 땐 공개였던 일지가
 * 나중에 비공개로 바뀌면 서버가 available=false 로 내려준다.
 */
export function ChatShareCard({
  message,
}: {
  message: ChatMessage;
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
          className="h-[116px] w-full rounded-none"
        />
      ) : null}
      <div className="flex flex-col gap-1 p-2.5">
        <div className="text-main-700 flex items-center gap-1">
          <TypeIcon className="h-3 w-3" />
          <Text size="caption4" weight="extrabold" className="text-inherit">
            {isDiary ? '일지' : '챌린지'}
          </Text>
        </div>
        <Text
          size="caption2"
          weight="bold"
          className={cn(
            'line-clamp-2',
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
          <Text size="caption3" className="truncate text-gray-500">
            {share.subtitle}
          </Text>
        ) : null}
      </div>
    </>
  );

  const className = cn(CARD_CLASS, 'border-gray-200 bg-white text-left');
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
          className="h-[116px] w-full object-cover object-center"
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
