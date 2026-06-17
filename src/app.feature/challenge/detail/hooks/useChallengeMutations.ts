import { invalidateAll } from '@module/api/queryInvalidation';
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { MEMBER_QUERY_KEYS } from '../../../member/consts/queryKeys';
import { CHALLENGE_QUERY_KEYS } from '../../board/consts/queryKeys';
import {
  CreateChallengeRequest,
  CreateChallengeResponse,
  JoinChallengeRequest,
  JoinChallengeResponse,
  PokeChallengeResponse,
  UpdateChallengeRequest,
} from '../../board/type/challenge';
import { challengeWriteApi } from '../../write/api/challengeWriteApi';
import { challengeDetailApi } from '../api/challengeDetailApi';

// 챌린지 생성하기
export function useCreateChallenge(): UseMutationResult<
  CreateChallengeResponse,
  Error,
  CreateChallengeRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChallengeRequest) =>
      challengeWriteApi.createChallenge(data),
    onSuccess: () => {
      invalidateAll(queryClient, [
        CHALLENGE_QUERY_KEYS.lists(),
        CHALLENGE_QUERY_KEYS.randoms(),
        MEMBER_QUERY_KEYS.myPage(),
        MEMBER_QUERY_KEYS.sidebar(),
      ]);
    },
  });
}

// 챌린지 신청하기
export function useJoinChallenge(): UseMutationResult<
  JoinChallengeResponse,
  Error,
  { challengeId: number; data: JoinChallengeRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      challengeId,
      data,
    }: {
      challengeId: number;
      data: JoinChallengeRequest;
    }) => challengeDetailApi.joinChallenge(challengeId, data),
    onSuccess: (_, { challengeId }) => {
      invalidateAll(queryClient, [
        CHALLENGE_QUERY_KEYS.detail(challengeId),
        CHALLENGE_QUERY_KEYS.lists(),
      ]);
    },
  });
}

// 챌린지원 찌르기 — 조회 데이터를 바꾸지 않으므로 캐시 무효화는 하지 않는다.
export function usePokeChallengeMembers(): UseMutationResult<
  PokeChallengeResponse,
  Error,
  { challengeId: number; receiverMemberIds: number[] }
> {
  return useMutation({
    mutationFn: ({ challengeId, receiverMemberIds }) =>
      challengeDetailApi.pokeChallengeMembers(challengeId, {
        receiverMemberIds,
      }),
  });
}

// 챌린지 참여자 수락하기
export function useAcceptParticipant(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantId: number) =>
      challengeDetailApi.acceptParticipant(participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.details(),
      });
    },
  });
}

// 챌린지 참여자 거절하기
export function useRejectParticipant(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantId: number) =>
      challengeDetailApi.rejectParticipant(participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.details(),
      });
    },
  });
}

// 챌린지 탈퇴하기
export function useLeaveChallenge(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (challengeId: number) =>
      challengeDetailApi.leaveChallenge(challengeId),
    onSuccess: (_, challengeId) => {
      invalidateAll(queryClient, [
        CHALLENGE_QUERY_KEYS.detail(challengeId),
        CHALLENGE_QUERY_KEYS.lists(),
        CHALLENGE_QUERY_KEYS.members(),
      ]);
    },
  });
}

// 챌린지 좋아요 누르기
export function useLikeChallenge(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (challengeId: number) =>
      challengeDetailApi.likeChallenge(challengeId),
    onSuccess: (_, challengeId) => {
      invalidateAll(queryClient, [
        CHALLENGE_QUERY_KEYS.detail(challengeId),
        CHALLENGE_QUERY_KEYS.lists(),
        CHALLENGE_QUERY_KEYS.randoms(),
      ]);
    },
  });
}

// 챌린지 수정하기 (HOST 전용)
export function useUpdateChallenge(): UseMutationResult<
  void,
  Error,
  { challengeId: number; data: UpdateChallengeRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ challengeId, data }) =>
      challengeWriteApi.updateChallenge(challengeId, data),
    onSuccess: (_, { challengeId }) => {
      invalidateAll(queryClient, [
        CHALLENGE_QUERY_KEYS.detail(challengeId),
        CHALLENGE_QUERY_KEYS.lists(),
      ]);
    },
  });
}

// 참여자 목표 수정 (자유 목표 챌린지 전용, 시작 전에만 가능)
export function useUpdateParticipantGoal(): UseMutationResult<
  void,
  Error,
  { challengeId: number; goals: string[] }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ challengeId, goals }) =>
      challengeDetailApi.updateParticipantGoal(challengeId, goals),
    onSuccess: (_, { challengeId }) => {
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.detail(challengeId),
      });
    },
  });
}

// 챌린지 좋아요 취소하기
export function useUnlikeChallenge(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (challengeId: number) =>
      challengeDetailApi.unlikeChallenge(challengeId),
    onSuccess: (_, challengeId) => {
      invalidateAll(queryClient, [
        CHALLENGE_QUERY_KEYS.detail(challengeId),
        CHALLENGE_QUERY_KEYS.lists(),
        CHALLENGE_QUERY_KEYS.randoms(),
      ]);
    },
  });
}
