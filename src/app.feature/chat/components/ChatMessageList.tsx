'use client';

import { Text } from '@1d1s/design-system';
import { useInViewObserver } from '@module/hooks/useInViewObserver';
import { cn } from '@module/utils/cn';
import React, { useEffect } from 'react';

import { ChatMessage, ChatReadState, unreadCountFor } from '../type/chat';
import { formatDateDivider, isSameChatDay } from '../utils/chatFormat';
import {
  type ChatBubbleGroupPosition,
  ChatMessageBubble,
} from './ChatMessageBubble';

/** 시스템 안내. 대화가 아니라 표시이므로 가운데 칩으로 그린다. */
function SystemChip({ text }: { text: string }): React.ReactElement {
  return (
    <div className="flex justify-center py-1.5">
      <span className="bg-main-200 rounded-full px-3 py-1.5">
        <Text
          size="caption3"
          weight="medium"
          className="text-main-800 text-center"
        >
          {text}
        </Text>
      </span>
    </div>
  );
}

function DateDivider({ value }: { value: string }): React.ReactElement {
  return (
    <div className="flex justify-center pt-1 pb-3">
      <span className="rounded-full bg-gray-100 px-3 py-1">
        <Text size="caption3" weight="medium" className="text-gray-600">
          {formatDateDivider(value)}
        </Text>
      </span>
    </div>
  );
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  /** 내 회원 id. 좌우 정렬과 안 읽은 수 계산이 모두 이 값을 기준으로 한다. */
  myMemberId?: number;
  /** 방 멤버 전원의 읽음 위치. */
  readStates: ChatReadState[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage(): void;
  /** 떠 있는 배너에 가리지 않도록 리스트 위에 비워 둘 높이(실측값). */
  topInset: number;
  /** memberId -> 프로필 이미지. 메시지 계약에 없어 밖에서 넣어 준다. */
  senderAvatars?: Map<number, string>;
  /** 이 방에 쓸 수 있는가. 빈 화면 문구가 갈린다. */
  canSend: boolean;
  /** 보관된 방인가. 빈 화면 문구가 한 번 더 갈린다. */
  archived?: boolean;
  noticeId?: number | null;
  highlightId?: number | null;
  onRetry(message: ChatMessage): void;
  onOpenActions(message: ChatMessage): void;
}

/**
 * 역방향 리스트. 서버 내역이 최신순으로 오므로 그대로 앞에서부터 그리고,
 * `flex-col-reverse` 로 뒤집어 새 메시지가 아래에 쌓이게 한다 — 새 메시지가
 * 와도 스크롤이 튀지 않는다.
 */
export function ChatMessageList({
  messages,
  myMemberId,
  readStates,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  topInset,
  senderAvatars,
  canSend,
  archived = false,
  noticeId,
  highlightId,
  onRetry,
  onOpenActions,
}: ChatMessageListProps): React.ReactElement {
  const { ref, inView } = useInViewObserver();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <Text
          size="body2"
          className="text-center whitespace-pre-line text-gray-600"
        >
          {/* 못 보내는 방에서 "첫 메시지를 보내 보세요" 는 모순이다. */}
          {canSend
            ? '아직 대화가 없어요.\n첫 메시지를 보내 보세요.'
            : archived
              ? '대화 없이 보관된 채팅방이에요.'
              : '아직 대화가 없어요.'}
        </Text>
      </div>
    );
  }

  /**
   * 두 메시지가 한 묶음인가. 같은 사람이 **같은 날** 잇달아 보낸 것만
   * 묶는다 — 날짜 구분선이 사이에 들어가면 시각적으로 이미 끊긴다.
   */
  const grouped = (
    one: ChatMessage | undefined,
    two: ChatMessage | undefined
  ): boolean =>
    Boolean(
      one &&
        two &&
        one.type !== 'SYSTEM' &&
        two.type !== 'SYSTEM' &&
        one.senderId === two.senderId &&
        isSameChatDay(one.createdAt, two.createdAt)
    );

  const children: React.ReactNode[] = [];
  messages.forEach((message, index) => {
    // 최신순이라 index+1 이 시간상 **이전** 메시지다.
    const previous = messages[index + 1];
    // 날짜가 바뀌는 첫 메시지 위에 구분선. 가장 오래된 메시지도 위에
    // 아무것도 없으니 날짜를 보여 준다.
    const startsNewDay =
      !previous || !isSameChatDay(previous.createdAt, message.createdAt);
    // 최신순 배열이라 index-1 이 시간상 **다음** 메시지다.
    const next = messages[index - 1];
    const hasPrevious = grouped(previous, message);
    const hasNext = grouped(message, next);
    const group: ChatBubbleGroupPosition = hasPrevious
      ? hasNext
        ? 'mid'
        : 'last'
      : hasNext
        ? 'top'
        : 'single';

    children.push(
      message.type === 'SYSTEM' ? (
        <SystemChip
          key={`m-${message.id}-${index}`}
          text={message.content ?? ''}
        />
      ) : (
        <ChatMessageBubble
          senderImageUrl={senderAvatars?.get(message.senderId)}
          key={message.clientMessageId ?? `m-${message.id}-${index}`}
          message={message}
          isMine={message.senderId === myMemberId}
          unread={unreadCountFor(message, readStates)}
          group={group}
          // 묶음의 첫 줄에만 닉네임을 보여 준다(날짜가 갈리면 다시).
          showSender={!hasPrevious}
          isNotice={noticeId != null && message.id === noticeId}
          highlighted={highlightId != null && message.id === highlightId}
          onRetry={message.failed ? () => onRetry(message) : undefined}
          onOpenActions={onOpenActions}
        />
      )
    );

    if (startsNewDay) {
      // flex-col-reverse 라 DOM 상 뒤에 둔 것이 화면에서는 위에 온다.
      children.push(
        <DateDivider
          key={`d-${message.id}-${index}`}
          value={message.createdAt}
        />
      );
    }
  });

  return (
    <div
      className={cn(
        'flex h-full flex-col-reverse overflow-y-auto overscroll-contain',
        'px-4 pb-3'
      )}
      style={{ paddingTop: topInset + 12 }}
    >
      {children}
      {hasNextPage ? (
        <div ref={ref} className="flex justify-center py-4">
          <span
            className={cn(
              'h-4 w-4 animate-spin rounded-full border-2',
              'border-gray-300 border-t-transparent'
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
