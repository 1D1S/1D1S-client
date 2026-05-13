import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import type {
  FriendRelation,
  FriendRequestSummary,
  FriendSummary,
} from '../type/friend';

/**
 * 백엔드가 내려주는 친구 신청 원본 응답.
 *
 * 받은 신청은 `from*`, 보낸 신청은 `to*` 접두사로 상대방 정보를 내려준다.
 * 컴포넌트는 `FriendRequestSummary` 통일 형태를 쓰므로 API 레이어에서 정규화한다.
 */
interface FriendRequestRaw {
  requestId: number;
  fromMemberId?: number;
  fromMemberNickname?: string | null;
  fromMemberProfileUrl?: string | null;
  toMemberId?: number;
  toMemberNickname?: string | null;
  toMemberProfileUrl?: string | null;
  status?: string;
  createdAt?: string;
}

function normalizeRequest(
  raw: FriendRequestRaw,
  direction: 'received' | 'sent',
): FriendRequestSummary {
  const memberId =
    direction === 'received' ? raw.fromMemberId : raw.toMemberId;
  const nickname =
    direction === 'received' ? raw.fromMemberNickname : raw.toMemberNickname;
  const profileUrl =
    direction === 'received'
      ? raw.fromMemberProfileUrl
      : raw.toMemberProfileUrl;

  return {
    requestId: raw.requestId,
    memberId: memberId ?? 0,
    nickname: nickname ?? '',
    profileUrl: profileUrl ?? '',
    createdAt: raw.createdAt,
  };
}

export const friendApi = {
  /** 친구 목록 조회 */
  getFriends: async (): Promise<FriendSummary[]> =>
    requestData<FriendSummary[]>(apiClient, {
      url: '/friends',
      method: 'GET',
    }),

  /** 회원 관계 상태 조회 */
  getRelation: async (memberId: number): Promise<FriendRelation> =>
    requestData<FriendRelation>(apiClient, {
      url: `/friends/relation/${memberId}`,
      method: 'GET',
    }),

  /** 보낸 친구 신청 목록 */
  getSentRequests: async (): Promise<FriendRequestSummary[]> => {
    const raw = await requestData<FriendRequestRaw[]>(apiClient, {
      url: '/friends/requests/sent',
      method: 'GET',
    });
    return raw.map((item) => normalizeRequest(item, 'sent'));
  },

  /** 받은 친구 신청 목록 */
  getReceivedRequests: async (): Promise<FriendRequestSummary[]> => {
    const raw = await requestData<FriendRequestRaw[]>(apiClient, {
      url: '/friends/requests/received',
      method: 'GET',
    });
    return raw.map((item) => normalizeRequest(item, 'received'));
  },

  /** 차단 목록 조회 */
  getBlockedMembers: async (): Promise<FriendSummary[]> =>
    requestData<FriendSummary[]>(apiClient, {
      url: '/friends/block',
      method: 'GET',
    }),

  /** 친구 신청 */
  sendRequest: async (toMemberId: number): Promise<void> =>
    requestData<void>(apiClient, {
      url: '/friends/request',
      method: 'POST',
      data: { toMemberId },
    }),

  /** 친구 신청 수락 */
  acceptRequest: async (requestId: number): Promise<void> =>
    requestData<void>(apiClient, {
      url: `/friends/request/${requestId}/accept`,
      method: 'POST',
    }),

  /** 친구 신청 거절 */
  rejectRequest: async (requestId: number): Promise<void> =>
    requestData<void>(apiClient, {
      url: `/friends/request/${requestId}/reject`,
      method: 'POST',
    }),

  /** 친구 신청 취소 (보낸 신청 철회) */
  cancelRequest: async (requestId: number): Promise<void> =>
    requestData<void>(apiClient, {
      url: `/friends/request/${requestId}`,
      method: 'DELETE',
    }),

  /** 친구 삭제 */
  removeFriend: async (friendMemberId: number): Promise<void> =>
    requestData<void>(apiClient, {
      url: `/friends/${friendMemberId}`,
      method: 'DELETE',
    }),

  /** 회원 차단 */
  blockMember: async (blockedMemberId: number): Promise<void> =>
    requestData<void>(apiClient, {
      url: '/friends/block',
      method: 'POST',
      data: { blockedMemberId },
    }),

  /** 차단 해제 */
  unblockMember: async (blockedMemberId: number): Promise<void> =>
    requestData<void>(apiClient, {
      url: `/friends/block/${blockedMemberId}`,
      method: 'DELETE',
    }),
};
