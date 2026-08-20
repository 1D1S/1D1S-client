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
  // 디자인 .pic — 190x122 가로 프레임. 비율이 제각각인 원본을 가운데
  // 기준으로 채운다(원본은 눌러서 본다).
  const frame = 'h-[122px] w-[190px] overflow-hidden rounded-2xl bg-gray-100';

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
        className="h-full w-full object-cover object-center"
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
  /**
   * 사진·공유 카드는 스스로 배경과 테두리를 갖는다. 그래서 말풍선을
   * 투명하게 두는데(디자인이 걷어내려던 오렌지 띠), 그러면 캡션 글씨가
   * 배경 없이 뜬다 — 캡션은 **자기 말풍선**을 하나 더 갖는다.
   */
  const withCaption = (card: React.ReactNode): React.ReactElement => (
    <div
      className={cn(
        'flex flex-col gap-1.5',
        isMine ? 'items-end' : 'items-start'
      )}
    >
      {card}
      {caption ? (
        <div
          className={cn(
            'max-w-full rounded-2xl px-3.5 py-2.5',
            isMine
              ? 'bg-main-800 text-white'
              : 'border border-gray-200 bg-white'
          )}
        >
          <BubbleText value={caption} isMine={isMine} />
        </div>
      ) : null}
    </div>
  );

  switch (message.type) {
    case 'CHALLENGE_SHARE':
    case 'DIARY_SHARE':
      return withCaption(<ChatShareCard message={message} isMine={isMine} />);
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

function TimeLabel({
  message,
  unread,
  showTime,
  onRetry,
}: {
  message: ChatMessage;
  /** 이 메시지를 아직 안 읽은 사람 수. 0 이면 안 그린다. */
  unread: number;
  /** 연속 발화는 **마지막 말풍선에만** 시간을 붙인다(디자인). */
  showTime: boolean;
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
    <div className="flex flex-col items-end gap-px pb-0.5">
      {unread > 0 ? (
        <Text
          size="caption4"
          weight="extrabold"
          className="text-main-800 leading-none"
        >
          {unread}
        </Text>
      ) : null}
      {message.pending ? (
        <Text size="caption4" className="text-gray-400">
          보내는 중
        </Text>
      ) : showTime ? (
        <Text size="caption4" className="whitespace-nowrap text-gray-400">
          {formatBubbleTime(message.createdAt)}
        </Text>
      ) : null}
    </div>
  );
}

/** 아바타 지름과, 그만큼 버블을 들여쓸 폭(아바타 + gap). */
const AVATAR_SIZE = 'h-10 w-10';
const AVATAR_INDENT = 'pl-[48px]';

/**
 * 상대 프로필. 서버가 메시지에 프로필 이미지를 싣지 않아 **닉네임 첫 글자**를
 * 브랜드 톤 원에 넣는다 — 빈 회색 원보다 누구인지가 읽힌다. 이미지가
 * 계약에 생기면 이 자리만 바꾸면 된다.
 */
function SenderAvatar({ nickname }: { nickname: string }): React.ReactElement {
  return (
    <span
      aria-hidden
      className={cn(
        AVATAR_SIZE,
        'from-main-400 to-main-600 flex shrink-0 items-center justify-center',
        'rounded-full bg-gradient-to-br text-[15px] font-extrabold text-white'
      )}
    >
      {nickname.trim().charAt(0) || '?'}
    </span>
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

/**
 * 연속 발화 안에서의 위치. 말풍선 꼬리를 어디에 붙일지가 이걸로 정해진다 —
 * 같은 사람이 잇달아 보낸 묶음은 **처음(상대) / 마지막(나)** 한 군데만
 * 각이 서고 나머지는 둥글다.
 */
export type ChatBubbleGroupPosition = 'single' | 'top' | 'mid' | 'last';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  /** 연속 발화의 첫 줄에만 닉네임을 보여 준다. */
  showSender: boolean;
  /** 연속 발화 묶음에서의 위치. */
  group?: ChatBubbleGroupPosition;
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
  group = 'single',
  highlighted = false,
  unread = 0,
  onRetry,
  onOpenActions,
}: ChatMessageBubbleProps): React.ReactElement {
  const hidden = message.status === 'HIDDEN';
  // 사진·공유 카드는 자기 테두리/라운드를 갖는다 — 말풍선 패딩을 주면
  // 카드 둘레에 색 띠가 한 겹 더 생긴다(디자인이 걷어내려던 그 테두리).
  const isMedia =
    !hidden &&
    (message.type === 'IMAGE' ||
      message.type === 'CHALLENGE_SHARE' ||
      message.type === 'DIARY_SHARE');
  // 꼬리는 묶음의 바깥쪽 한 군데에만 붙는다. 상대는 맨 위, 나는 맨 아래다.
  const tail = isMine
    ? group === 'single' || group === 'last'
    : group === 'single' || group === 'top';
  const showTime = group === 'single' || group === 'last';

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
      {/* 카톡식 — 아바타가 **그룹 좌상단**에 서고 오른쪽에 닉네임,
          그 아래로 말풍선이 쌓인다. 연속 발화면 첫 줄에만 그린다. */}
      {!isMine && showSender ? (
        <div className="flex items-center gap-2 pb-1">
          <SenderAvatar nickname={message.senderNickname} />
          <Text size="caption2" weight="medium" className="text-gray-600">
            {message.senderNickname}
          </Text>
        </div>
      ) : null}
      <div
        className={cn(
          'flex max-w-[86%] items-end gap-1.5',
          isMine ? 'flex-row' : 'flex-row-reverse',
          // 말풍선은 아바타 폭만큼 들여써 닉네임 아래 선에 맞춘다.
          !isMine && AVATAR_INDENT
        )}
      >
        <div className="shrink-0 pb-0.5">
          <TimeLabel
            message={message}
            unread={unread}
            showTime={showTime}
            onRetry={onRetry}
          />
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
            'min-w-0 overflow-hidden rounded-2xl',
            isMedia ? 'p-0' : 'px-3.5 py-2.5',
            hidden
              ? 'bg-gray-100'
              : isMedia
                ? // 카드가 스스로 배경·테두리를 갖는다.
                  'bg-transparent'
                : isMine
                  ? 'bg-main-800 text-white'
                  : 'border border-gray-200 bg-white',
            // 꼬리 — 상대는 왼쪽 위, 나는 오른쪽 아래 모서리를 각지게.
            tail && (isMine ? 'rounded-br-[4px]' : 'rounded-tl-[4px]'),
            isNotice && 'border-main-800 border-[1.5px]',
            message.pending && 'opacity-70'
          )}
        >
          <ChatBubbleBody message={message} isMine={isMine} />
        </div>
      </div>
    </div>
  );
}
