'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { resolveDiaryImageUrl } from '@module/utils/diaryImageUrl';
import { openNativeImageViewer } from '@module/utils/nativeBridge';
import { ImageOff } from 'lucide-react';
import React, { useState } from 'react';

import { ChatMessage } from '../type/chat';
import { formatBubbleTime } from '../utils/chatFormat';
import { ChatLinkifiedText } from './ChatLinkifiedText';
import {
  ChatLinkPreviewCard,
  ChatShareCard,
  hasLinkPreviewContent,
} from './ChatShareCard';

/**
 * 사진 말풍선. 세로로 긴 사진이 말풍선을 화면 높이만큼 밀어내지 않도록
 * 정사각 썸네일로 자른다 — 원본 비율은 눌러서 본다.
 *
 * ponytail: 웹 라이트박스는 두지 않는다. 네이티브 쉘에서는 Flutter 뷰어가
 * 열리고, 브라우저에서는 새 탭으로 원본을 연다. 여러 장 넘겨 보기가
 * 필요해지면 그때 DiaryImageGallery 의 라이트박스를 공용으로 뽑는다.
 */
function ImageBody({ message }: { message: ChatMessage }): React.ReactElement {
  const [broken, setBroken] = useState(false);
  const url = resolveDiaryImageUrl(message.imageUrl);
  const frame = 'h-[200px] w-[200px] overflow-hidden rounded-[10px] bg-gray-100';

  // 아직 업로드 중이면 URL 이 없다 — 자리를 잡아 두고 진행 표시.
  if (!url) {
    return (
      <div className={cn(frame, 'flex items-center justify-center')}>
        <span
          className={cn(
            'h-4 w-4 animate-spin rounded-full border-2',
            'border-gray-300 border-t-transparent'
          )}
        />
      </div>
    );
  }

  if (broken) {
    return (
      <div className={cn(frame, 'flex items-center justify-center')}>
        <ImageOff className="h-5 w-5 text-gray-500" />
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label="사진 크게 보기"
      className={cn(frame, 'block cursor-zoom-in')}
      onClick={(event) => {
        event.stopPropagation();
        if (!openNativeImageViewer([url], 0)) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- S3 호스트가
          환경마다 달라 next/image remotePatterns 로 고정할 수 없다. */}
      <img
        src={url}
        alt="채팅 사진"
        loading="lazy"
        className="h-full w-full object-cover"
        onError={() => setBroken(true)}
      />
    </button>
  );
}

function BubbleText({
  value,
  isMine,
  muted = false,
}: {
  value: string;
  isMine: boolean;
  muted?: boolean;
}): React.ReactElement {
  return (
    <Text
      as="p"
      size="body2"
      className={cn(
        'break-words whitespace-pre-wrap',
        muted ? 'text-gray-500 italic' : isMine ? 'text-white' : 'text-gray-900'
      )}
    >
      <ChatLinkifiedText value={value} isMine={isMine} />
    </Text>
  );
}

/**
 * 말풍선 본문 — 타입별 렌더.
 *
 * 모르는 타입은 빈 말풍선 대신 안내를 그린다. 서버가 새 타입을 먼저
 * 배포해도 구버전 클라가 조용히 깨지지 않게 하기 위한 것이다.
 */
export function ChatBubbleBody({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}): React.ReactElement {
  if (message.status === 'HIDDEN') {
    // HIDDEN 은 관리자가 신고를 승인해 가린 것 하나뿐이다 — 채팅에는
    // 작성자 삭제 경로가 없다. "삭제된 메시지" 는 틀린 설명이다.
    return (
      <BubbleText
        value="신고가 접수되어 제한된 채팅입니다."
        isMine={isMine}
        muted
      />
    );
  }

  const caption = message.content?.trim();
  const withCaption = (card: React.ReactNode): React.ReactElement => (
    <div className="flex flex-col items-start">
      {card}
      {caption ? (
        <div className="px-1 pt-1.5">
          <BubbleText value={caption} isMine={isMine} />
        </div>
      ) : null}
    </div>
  );

  switch (message.type) {
    case 'CHALLENGE_SHARE':
    case 'DIARY_SHARE':
      return withCaption(<ChatShareCard message={message} />);
    case 'IMAGE':
      return withCaption(<ImageBody message={message} />);
    case 'TEXT': {
      const preview = message.linkPreview;
      if (!hasLinkPreviewContent(preview)) {
        return <BubbleText value={message.content ?? ''} isMine={isMine} />;
      }
      return (
        <div className="flex flex-col items-start gap-2">
          <BubbleText value={message.content ?? ''} isMine={isMine} />
          <ChatLinkPreviewCard preview={preview!} />
        </div>
      );
    }
    default:
      return (
        <BubbleText value="지원하지 않는 메시지입니다." isMine={isMine} muted />
      );
  }
}

/**
 * 안 읽은 수 색 — 카톡 관행대로 노랑. 브랜드 주황과 붙어 있어도 구분된다.
 */
const UNREAD_COLOR = 'text-[#f5a623]';

function TimeLabel({
  message,
  unread,
  onRetry,
}: {
  message: ChatMessage;
  /** 이 메시지를 아직 안 읽은 사람 수. 0 이면 안 그린다. */
  unread: number;
  onRetry?(): void;
}): React.ReactElement {
  if (message.failed) {
    return onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="text-red-500 underline underline-offset-2"
      >
        <Text size="caption4" weight="bold" className="text-inherit">
          전송 실패 · 다시 보내기
        </Text>
      </button>
    ) : (
      <Text size="caption4" className="text-red-500">
        전송 실패
      </Text>
    );
  }
  return (
    <div className="flex flex-col items-end">
      {unread > 0 ? (
        <Text size="caption4" weight="extrabold" className={UNREAD_COLOR}>
          {unread}
        </Text>
      ) : null}
      <Text size="caption4" className="text-gray-500">
        {message.pending ? '보내는 중' : formatBubbleTime(message.createdAt)}
      </Text>
    </div>
  );
}

const LONG_PRESS_MS = 450;

/** 터치 롱프레스. 스크롤로 손가락이 움직이면 취소한다. */
function useLongPress(onLongPress: () => void): {
  onTouchStart(): void;
  onTouchEnd(): void;
  onTouchMove(): void;
} {
  const timer = React.useRef<number | null>(null);
  const clear = (): void => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };
  return {
    onTouchStart: () => {
      clear();
      timer.current = window.setTimeout(onLongPress, LONG_PRESS_MS);
    },
    onTouchEnd: clear,
    onTouchMove: clear,
  };
}

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  /** 연속 발화의 첫 줄에만 닉네임을 보여 준다. */
  showSender: boolean;
  /** 공지로 지정된 메시지는 본문에서도 구분되게 한다. */
  isNotice: boolean;
  /** 원본 이동 직후 잠깐 강조. */
  highlighted?: boolean;
  /** 이 메시지를 아직 안 읽은 사람 수. */
  unread?: number;
  onRetry?(): void;
  onOpenActions?(message: ChatMessage): void;
}

export function ChatMessageBubble({
  message,
  isMine,
  showSender,
  isNotice,
  highlighted = false,
  unread = 0,
  onRetry,
  onOpenActions,
}: ChatMessageBubbleProps): React.ReactElement {
  const hidden = message.status === 'HIDDEN';
  const isImage = message.type === 'IMAGE' && !hidden;

  // 롱프레스(모바일) 와 우클릭(데스크톱) 이 같은 메뉴를 연다.
  const longPress = useLongPress(() => onOpenActions?.(message));

  return (
    <div
      // 공지 원본으로 보낼 때 scrollIntoView 로 찾는다.
      id={message.id > 0 ? `chat-message-${message.id}` : undefined}
      className={cn(
        'flex flex-col pb-2',
        isMine ? 'items-end' : 'items-start',
        highlighted && 'bg-main-100/60 -mx-2 rounded-xl px-2 py-1'
      )}
    >
      {!isMine && showSender ? (
        <Text size="caption3" weight="medium" className="pb-1 pl-1 text-gray-600">
          {message.senderNickname}
        </Text>
      ) : null}
      <div
        className={cn(
          'flex max-w-[80%] items-end gap-1.5',
          isMine ? 'flex-row' : 'flex-row-reverse'
        )}
      >
        <div className="shrink-0 pb-0.5">
          <TimeLabel message={message} unread={unread} onRetry={onRetry} />
        </div>
        <div
          role={onOpenActions ? 'button' : undefined}
          tabIndex={onOpenActions ? 0 : undefined}
          onContextMenu={(event) => {
            if (!onOpenActions) {
              return;
            }
            event.preventDefault();
            onOpenActions(message);
          }}
          {...longPress}
          className={cn(
            'min-w-0 overflow-hidden rounded-[14px]',
            isImage ? 'p-1.5' : 'px-3 py-2.5',
            hidden
              ? 'bg-gray-100'
              : isMine
                ? 'bg-main-600'
                : 'border border-gray-200 bg-white',
            isNotice && 'border-main-600 border-[1.5px]',
            message.pending && 'opacity-70'
          )}
        >
          <ChatBubbleBody message={message} isMine={isMine} />
        </div>
      </div>
    </div>
  );
}
