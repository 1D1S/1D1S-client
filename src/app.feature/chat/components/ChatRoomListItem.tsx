'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Bell, BellOff, BookOpen, Flag, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { canSendInRoom, ChatRoom } from '../type/chat';
import { formatRoomTime, roomPreview } from '../utils/chatFormat';
import { ChatRoomThumbnail } from './ChatRoomThumbnail';

/**
 * 마지막 메시지가 글이 아니면 앞에 작은 아이콘을 둔다 — 무엇이 왔는지
 * 한눈에 보이게. 글이면 아이콘 없이 문구만(과밀 방지).
 */
function PreviewIcon({ room }: { room: ChatRoom }): React.ReactElement | null {
  const className = 'h-3 w-3 shrink-0 text-gray-400';
  switch (room.lastMessage?.type) {
    case 'IMAGE':
      return <ImageIcon className={className} />;
    case 'CHALLENGE_SHARE':
      return <Flag className={className} />;
    case 'DIARY_SHARE':
      return <BookOpen className={className} />;
    default:
      return null;
  }
}

/** 방 이름 옆 작은 배지. 방장 표시와 상태 표시가 같은 pill 이다. */
function RoomChip({
  label,
  tone,
}: {
  label: string;
  tone: 'host' | 'state';
}): React.ReactElement {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-1.5 py-px text-[10px] leading-4',
        tone === 'host'
          ? 'bg-main-200 text-main-800 font-extrabold'
          : 'bg-gray-100 font-bold text-gray-600'
      )}
    >
      {label}
    </span>
  );
}

function StateChip({ room }: { room: ChatRoom }): React.ReactElement | null {
  // 종료와 읽기 전용은 다르다 — 종료돼도 방은 그대로 쓴다. 둘은 배타다.
  if (room.challengeEnded) {
    return <RoomChip label="종료" tone="state" />;
  }
  if (!canSendInRoom(room)) {
    return <RoomChip label="읽기 전용" tone="state" />;
  }
  return null;
}

interface ChatRoomListItemProps {
  room: ChatRoom;
  onToggleNotification(room: ChatRoom): void;
}

export function ChatRoomListItem({
  room,
  onToggleNotification,
}: ChatRoomListItemProps): React.ReactElement {
  const unread = room.unreadCount;
  const BellIcon = room.pushEnabled ? Bell : BellOff;

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 rounded-2xl border px-3.5 py-3',
        'transition-colors',
        // 안 읽은 방은 살짝 물들여 눈에 띄게 한다. 그림자는 쓰지 않는다.
        unread > 0
          ? 'bg-main-100 border-main-200'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      )}
    >
      {/* 카드 전체가 링크지만 종 버튼은 그 위에 따로 얹는다 — 링크 안에
          버튼을 중첩하면 마크업이 무효가 된다. */}
      <Link
        href={`/chat/rooms/${room.roomId}`}
        aria-label={`${room.challengeTitle} 채팅방 열기`}
        className="absolute inset-0 z-0 rounded-2xl"
      />

      {/* 어느 챌린지 방인지가 먼저 읽혀야 한다. 3:2 landscape. */}
      <ChatRoomThumbnail
        url={room.challengeThumbnailUrl}
        category={room.category}
        className="pointer-events-none z-[1] h-11 w-[66px]"
      />

      <div className="pointer-events-none z-[1] flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <Text size="body2" weight="bold" className="truncate text-gray-900">
            {room.challengeTitle}
          </Text>
          {room.myRole === 'HOST' ? (
            <RoomChip label="HOST" tone="host" />
          ) : null}
          <StateChip room={room} />
        </div>
        <div className="flex min-w-0 items-center gap-1">
          <PreviewIcon room={room} />
          <Text size="caption2" className="truncate text-gray-600">
            {roomPreview(room)}
          </Text>
        </div>
      </div>

      {/* 오른쪽 요소는 한 축에 모은다 — 안읽음 뱃지와 종이 따로 놀면
          행마다 눈이 흔들린다. */}
      <div className="z-[1] flex shrink-0 flex-col items-end gap-1.5">
        <Text size="caption4" className="pointer-events-none text-gray-400">
          {room.lastMessage ? formatRoomTime(room.lastMessage.createdAt) : ''}
        </Text>
        <div className="flex items-center gap-1.5">
          {unread > 0 ? (
            <span
              className={cn(
                'bg-main-600 pointer-events-none inline-flex min-w-5',
                'items-center justify-center rounded-full px-1.5 py-0.5',
                'text-[10px] leading-4 font-extrabold text-white'
              )}
            >
              {unread > 99 ? '99+' : unread}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => onToggleNotification(room)}
            aria-label={room.pushEnabled ? '알림 끄기' : '알림 켜기'}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full',
              'transition-colors hover:bg-white/70',
              room.pushEnabled ? 'text-gray-500' : 'text-gray-400'
            )}
          >
            <BellIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
