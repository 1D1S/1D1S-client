'use client';

import { Text } from '@1d1s/design-system';
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
import { ChatSegmentedTabs } from '../components/ChatSegmentedTabs';
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
          className={cn('flex items-center gap-3 rounded-2xl px-2 py-3')}
        >
          <Skeleton shape="rounded" className="h-13 w-13 rounded-2xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton shape="text" className="h-3.5 w-[55%]" />
            <Skeleton shape="text" className="h-3 w-[75%]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// value 가 그대로 서버 파라미터다 — undefined 면 생략(전체).
const FILTERS = [
  { key: 'all', label: '전체', archived: undefined },
  { key: 'active', label: '진행 중', archived: false },
  { key: 'archived', label: '아카이브', archived: true },
] as const;

type ChatRoomFilterKey = (typeof FILTERS)[number]['key'];

export function ChatRoomListScreen(): React.ReactElement {
  const handleBack = useSafeBack('/');
  const [filterKey, setFilterKey] = useState<ChatRoomFilterKey>('all');
  const archived = FILTERS.find((item) => item.key === filterKey)?.archived;
  const { data, isLoading, isError, refetch } = useChatRooms({ archived });
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

  const rooms = data?.rooms ?? [];
  // 보관된 방이 하나도 없으면 필터 줄은 군더더기다. 다만 '전체' 가 아닌
  // 필터를 이미 고른 뒤에는 응답에 보관 방이 없어도 줄을 유지해야 한다 —
  // 안 그러면 '진행 중' 을 누르는 순간 필터가 사라져 되돌아갈 길이 없다.
  const showFilters =
    filterKey !== 'all' || rooms.some((room) => isChatArchived(room));

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
          {showFilters ? (
            <ChatSegmentedTabs<ChatRoomFilterKey>
              options={FILTERS.map((option) => ({
                value: option.key,
                label: option.label,
              }))}
              value={filterKey}
              onChange={setFilterKey}
            />
          ) : null}

          {rooms.length === 0 ? (
            <EmptyState
              variant="challenge"
              title={
                filterKey === 'archived'
                  ? '보관된 채팅방이 없어요'
                  : filterKey === 'active'
                    ? '진행 중인 채팅방이 없어요'
                    : '참여 중인 그룹 채팅이 없어요'
              }
              description={
                filterKey === 'all'
                  ? '그룹 챌린지에 참여하면 채팅방이 열려요.'
                  : undefined
              }
            />
          ) : (
            // 행이 스스로 패딩을 갖고, 안 읽은 방만 배경으로 구분된다 —
            // 카드 테두리도 divider 도 없다(디자인).
            <div className="flex flex-col gap-0.5">
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
