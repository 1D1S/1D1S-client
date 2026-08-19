'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { BellOff, BookOpen, Flag, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { ChatRoom } from '../type/chat';
import { canSendInChatRoom, isChatArchived } from '../utils/chatArchive';
import { formatRoomTime, roomPreview } from '../utils/chatFormat';
import { ChatRoomThumbnail } from './ChatRoomThumbnail';

function PreviewKindLabel({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}): React.ReactElement {
  return (
    <span className="text-main-800 flex shrink-0 items-center gap-0.5 text-xs font-bold">
      {icon}
      {label}
    </span>
  );
}

/**
 * 마지막 메시지가 글이 아니면 **뒤에** 타입을 밝힌다.
 *
 * 예전엔 앞에 회색 아이콘만 뒀는데, 그러면 "무엇이 왔는지" 가 본문에 묻힌다.
 * 디자인은 브랜드 색 라벨로 뒤에 세워 눈에 들어오게 했다.
 */
function PreviewKind({ room }: { room: ChatRoom }): React.ReactElement | null {
  const kind = room.lastMessage?.type;
  if (kind === 'IMAGE') {
    return <PreviewKindLabel icon={<ImageIcon className="h-3 w-3" />} label="사진" />;
  }
  if (kind === 'CHALLENGE_SHARE') {
    return <PreviewKindLabel icon={<Flag className="h-3 w-3" />} label="챌린지" />;
  }
  if (kind === 'DIARY_SHARE') {
    return <PreviewKindLabel icon={<BookOpen className="h-3 w-3" />} label="일지" />;
  }
  return null;
}

/** 방 이름 옆 각진 칩. 알약이 아니라 radius 5 다(디자인). */
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
        'shrink-0 rounded-[5px] px-1.5 py-[2.5px] text-[9.5px]',
        'leading-none font-extrabold tracking-[0.03em]',
        tone === 'host'
          ? 'bg-main-200 text-main-900'
          : 'bg-gray-100 text-gray-500'
      )}
    >
      {label}
    </span>
  );
}

function StateChip({ room }: { room: ChatRoom }): React.ReactElement | null {
  // 셋은 배타다. 아카이브는 이미 "종료 + 읽기 전용" 이라, 셋을 나란히
  // 세우면 같은 사실을 세 번 말하게 된다.
  if (isChatArchived(room)) {
    return <RoomChip label="아카이브" tone="state" />;
  }
  if (room.challengeEnded) {
    return <RoomChip label="종료" tone="state" />;
  }
  if (!canSendInChatRoom(room)) {
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
  const archived = isChatArchived(room);

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-2xl px-2 py-3',
        // 보더 없이 **안 읽은 방만** 물들여 구분한다. 카드 테두리를 걷어낸
        // 자리를 여백과 배경이 대신한다(디자인).
        unread > 0 ? 'bg-main-100' : 'hover:bg-gray-50',
        archived && 'opacity-60'
      )}
    >
      {/* 카드 전체가 링크지만 종 버튼은 그 위에 따로 얹는다 — 링크 안에
          버튼을 중첩하면 마크업이 무효가 된다. */}
      <Link
        href={`/chat/rooms/${room.roomId}`}
        aria-label={`${room.challengeTitle} 채팅방 열기`}
        className="absolute inset-0 z-0 rounded-2xl"
      />

      {/* 52 정사각. 챌린지 대표 이미지는 3:2 라 가운데를 기준으로 잘린다. */}
      <ChatRoomThumbnail
        url={room.challengeThumbnailUrl}
        category={room.category}
        className="pointer-events-none z-[1] h-13 w-13 rounded-2xl"
      />

      <div className="pointer-events-none z-[1] flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 items-center gap-1.5">
          <Text
            as="b"
            size="caption1"
            weight="extrabold"
            className="min-w-0 truncate tracking-[-0.02em] text-gray-900"
          >
            {room.challengeTitle}
          </Text>
          {room.myRole === 'HOST' ? (
            <RoomChip label="HOST" tone="host" />
          ) : null}
          <StateChip room={room} />
        </div>
        <div className="mt-1 flex min-w-0 items-center gap-1.5">
          {room.lastMessage ? (
            <Text size="caption2" className="shrink-0 text-gray-500">
              {room.lastMessage.senderNickname}
            </Text>
          ) : null}
          <Text size="caption2" className="min-w-0 truncate text-gray-600">
            {roomPreview(room)}
          </Text>
          <PreviewKind room={room} />
        </div>
      </div>

      <div className="z-[1] flex min-w-13 shrink-0 flex-col items-end gap-[7px] pt-0.5">
        <Text size="caption3" className="pointer-events-none text-gray-400">
          {room.lastMessage ? formatRoomTime(room.lastMessage.createdAt) : ''}
        </Text>
        <div className="flex items-center gap-1.5">
          {unread > 0 ? (
            <span
              className={cn(
                'bg-main-800 pointer-events-none inline-flex h-[19px]',
                'min-w-[19px] items-center justify-center rounded-full px-1.5',
                'text-[11px] font-extrabold text-white'
              )}
            >
              {unread > 99 ? '99+' : unread}
            </span>
          ) : null}
          {/* 알림이 켜져 있는 것이 기본이라 아이콘을 그리지 않는다 —
              꺼 둔 방만 표시해야 목록이 조용해진다(디자인). */}
          <button
            type="button"
            onClick={() => onToggleNotification(room)}
            aria-label={room.pushEnabled ? '알림 끄기' : '알림 켜기'}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full',
              'transition-colors hover:bg-white/70',
              room.pushEnabled ? 'text-transparent' : 'text-gray-300'
            )}
          >
            <BellOff className="h-[15px] w-[15px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
