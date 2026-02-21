import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { CHALLENGE_QUERY_KEYS } from '../../board/consts/query-keys';
import {
  CreateChallengeRequest,
  CreateChallengeResponse,
  JoinChallengeRequest,
  JoinChallengeResponse,
} from '../../board/type/challenge';
import { challengeWriteApi } from '../../write/api/challenge-write-api';
import { challengeDetailApi } from '../api/challenge-detail-api';

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
      // 챌린지 리스트 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.lists(),
      });
      // 랜덤 챌린지 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.includes('random'),
      });
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
      // 해당 챌린지 상세 정보 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.detail(challengeId),
      });
      // 챌린지 리스트 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.lists(),
      });
    },
  });
}

// 챌린지 참여자 수락하기
export function useAcceptParticipant(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantId: number) =>
      challengeDetailApi.acceptParticipant(participantId),
    onSuccess: () => {
      // 모든 챌린지 상세 정보 무효화
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
      // 모든 챌린지 상세 정보 무효화
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
      // 해당 챌린지 상세 정보 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.detail(challengeId),
      });
      // 챌린지 리스트 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.lists(),
      });
      // 멤버 챌린지 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.includes('member'),
      });
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
      // 해당 챌린지 상세 정보 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.detail(challengeId),
      });
      // 챌린지 리스트 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.lists(),
      });
      // 랜덤 챌린지 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.includes('random'),
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
      // 해당 챌린지 상세 정보 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.detail(challengeId),
      });
      // 챌린지 리스트 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.lists(),
      });
      // 랜덤 챌린지 무효화
      queryClient.invalidateQueries({
        queryKey: CHALLENGE_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.includes('random'),
      });
    },
  });
}
