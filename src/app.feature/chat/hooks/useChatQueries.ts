'use client';

import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { FRESH_ON_RETURN } from '@/app.lib/refetchPolicy';

import { chatApi } from '../api/chatApi';
import { CHAT_PAGE_SIZE, CHAT_QUERY_KEYS } from '../consts/queryKeys';
import { ChatMessagePage, ChatRoomList } from '../type/chat';

const EMPTY_ROOMS: ChatRoomList = { rooms: [], hiddenMemberIds: [] };

/**
 * 방 목록. 안 읽음 배지와 challengeId → roomId 매핑이 여기서 나온다.
 *
 * noPersist: 안 읽음 수와 마지막 메시지는 실시간으로 흐르는 값이라, 복원된
 * 스냅샷을 잠깐이라도 보여 주면 이미 읽은 방에 배지가 다시 뜬다.
 */
export function useChatRooms(options?: {
  enabled?: boolean;
}): UseQueryResult<ChatRoomList, Error> {
  return useQuery({
    queryKey: CHAT_QUERY_KEYS.rooms(),
    queryFn: () => chatApi.getRooms(),
    enabled: options?.enabled ?? true,
    meta: { noPersist: true },
    ...FRESH_ON_RETURN,
  });
}

/** 헤더 배지 — 방 전체 안 읽음 합. */
export function useChatUnreadTotal(options?: { enabled?: boolean }): number {
  const { data } = useChatRooms(options);
  return (data ?? EMPTY_ROOMS).rooms.reduce(
    (sum, room) => sum + room.unreadCount,
    0
  );
}

/**
 * 방 내역. 커서형·최신순이라 페이지를 이어 붙이면 그대로 "위로 갈수록
 * 과거" 가 된다. 화면은 column-reverse 로 그린다.
 */
export function useChatMessages(
  roomId: number
): UseInfiniteQueryResult<InfiniteData<ChatMessagePage>, Error> {
  return useInfiniteQuery({
    queryKey: CHAT_QUERY_KEYS.messages(roomId),
    queryFn: ({ pageParam }) =>
      chatApi.getMessages(roomId, {
        cursor: pageParam ?? undefined,
        size: CHAT_PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
    meta: { noPersist: true },
    // 방을 다시 열면 끊긴 동안 온 메시지를 채워야 한다(토픽은 지나간 것을
    // 다시 주지 않는다). 마운트 시점엔 페이지가 하나뿐이라 이 재요청은
    // 한 번이면 끝난다. 스크롤 도중의 갭 보충은 useChatRoom 의
    // refreshLatest 가 맡는다 — focus refetch 로 두면 쌓인 페이지를 전부
    // 다시 받는다.
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
