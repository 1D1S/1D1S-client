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
 * 받은 신청은 `fromMember*`(신청을 보낸 상대), 보낸 신청은 `toMember*`
 * (신청을 받은 상대) 키로 상대방 정보를 내려준다. 닉네임 키만 PascalCase
 * (`toMemberNickName`)로 내려오는 점에 주의.
 */
interface FriendRequestRaw {
  requestId: number;
  fromMemberId?: number;
  fromMemberNickname?: string | null;
  fromMemberProfileUrl?: string | null;
  toMemberId?: number;
  toMemberNickName?: string | null;
  toMemberProfileUrl?: string | null;
  status?: string;
  createdAt?: string;
}

function normalizeReceivedRequest(raw: FriendRequestRaw): FriendRequestSummary {
  return {
    requestId: raw.requestId,
    memberId: raw.fromMemberId ?? 0,
    nickname: raw.fromMemberNickname ?? '',
    profileUrl: raw.fromMemberProfileUrl ?? '',
    createdAt: raw.createdAt,
  };
}

function normalizeSentRequest(raw: FriendRequestRaw): FriendRequestSummary {
  return {
    requestId: raw.requestId,
    memberId: raw.toMemberId ?? 0,
    nickname: raw.toMemberNickName ?? '',
    profileUrl: raw.toMemberProfileUrl ?? '',
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
    return raw.map(normalizeSentRequest);
  },

  /** 받은 친구 신청 목록 */
  getReceivedRequests: async (): Promise<FriendRequestSummary[]> => {
    const raw = await requestData<FriendRequestRaw[]>(apiClient, {
      url: '/friends/requests/received',
      method: 'GET',
    });
    return raw.map(normalizeReceivedRequest);
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
