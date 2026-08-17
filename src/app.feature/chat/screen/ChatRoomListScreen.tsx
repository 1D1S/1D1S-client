'use client';

import { FilterChip, Text } from '@1d1s/design-system';
import EmptyState from '@component/EmptyState';
import { SubPageShell } from '@component/layout/SubPageShell';
import { Skeleton } from '@component/Skeleton';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { useSignalPageReady } from '@module/hooks/useSignalPageReady';
import { toast } from '@module/providers/toast';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import React, { useState } from 'react';

import { ChatRoomListItem } from '../components/ChatRoomListItem';
import { useToggleChatPush } from '../hooks/useChatMutations';
import { useChatRooms } from '../hooks/useChatQueries';
import { ChatRoom } from '../type/chat';
import { isChatArchived } from '../utils/chatArchive';

function ListSkeleton(): React.ReactElement {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center gap-3 rounded-2xl border border-gray-200',
            'px-3.5 py-3'
          )}
        >
          <Skeleton shape="rounded" className="h-11 w-[66px] rounded-[10px]" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton shape="text" className="h-3.5 w-[55%]" />
            <Skeleton shape="text" className="h-3 w-[75%]" />
          </div>
        </div>
      ))}
    </div>
  );
}

const FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '진행 중' },
  { value: 'archived', label: '아카이브' },
] as const;

type ChatRoomFilter = (typeof FILTERS)[number]['value'];

export function ChatRoomListScreen(): React.ReactElement {
  const handleBack = useSafeBack('/');
  const [filter, setFilter] = useState<ChatRoomFilter>('all');
  const { data, isLoading, isError, refetch } = useChatRooms();
  // 재조회 중에도 값이 있으면 목록을 그대로 둔다. isLoading 만 보면 갱신될
  // 때마다 스켈레톤으로 갔다 돌아와 리스트 전체가 페이드된다.
  const showSkeleton = useMinimumLoading(isLoading && !data);
  useSignalPageReady('chat', !showSkeleton);
  const { mutate: togglePush } = useToggleChatPush();

  const handleToggle = (room: ChatRoom): void => {
    const enabled = !room.pushEnabled;
    togglePush(
      { roomId: room.roomId, enabled },
      {
        onSuccess: () =>
          toast.success(enabled ? '알림을 켰어요.' : '알림을 껐어요.'),
        onError: () => toast.error('알림 설정을 바꾸지 못했습니다.'),
      }
    );
  };

  const allRooms = data?.rooms ?? [];
  // ponytail: 지금은 클라에서 거른다 — 방 목록은 참여 중인 그룹 챌린지 수만큼
  // 이라 한 화면에 다 온다. 서버가 목록 아카이브 필터를 열면 이 두 줄이
  // queryKey 파라미터로 바뀐다.
  const rooms = allRooms.filter((room) => {
    if (filter === 'all') {
      return true;
    }
    return isChatArchived(room) === (filter === 'archived');
  });
  // 보관된 방이 하나도 없으면 필터 자체가 군더더기다.
  const hasArchived = allRooms.some((room) => isChatArchived(room));

  return (
    <SubPageShell
      title="채팅"
      description="참여 중인 그룹 챌린지의 채팅방이에요."
      onBack={handleBack}
    >
      {showSkeleton ? (
        <ListSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <Text size="body2" className="text-gray-600">
            채팅방을 불러오지 못했습니다.
          </Text>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-main-800 underline underline-offset-4"
          >
            <Text size="body2" weight="medium" className="text-inherit">
              다시 시도
            </Text>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {hasArchived ? (
            <div className="flex items-center gap-2">
              {FILTERS.map((option) => (
                <FilterChip
                  key={option.value}
                  size="sm"
                  active={filter === option.value}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </FilterChip>
              ))}
            </div>
          ) : null}

          {rooms.length === 0 ? (
            <EmptyState
              variant="challenge"
              title={
                filter === 'archived'
                  ? '보관된 채팅방이 없어요'
                  : allRooms.length === 0
                    ? '참여 중인 그룹 채팅이 없어요'
                    : '진행 중인 채팅방이 없어요'
              }
              description={
                allRooms.length === 0
                  ? '그룹 챌린지에 참여하면 채팅방이 열려요.'
                  : undefined
              }
            />
          ) : (
            // 카드 사이 간격이 구분 역할을 하므로 divider 를 두지 않는다.
            <div className="flex flex-col gap-2.5">
              {rooms.map((room) => (
                <ChatRoomListItem
                  key={room.roomId}
                  room={room}
                  onToggleNotification={handleToggle}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </SubPageShell>
  );
}
