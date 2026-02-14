import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { challengeApi } from '../../board/api/challenge-api';
import {
  CreateChallengeRequest,
  CreateChallengeResponse,
  JoinChallengeRequest,
  JoinChallengeResponse,
} from '../../board/type/challenge';
import { CHALLENGE_QUERY_KEYS } from '../../board/const/query-keys';

// 챌린지 생성하기
export function useCreateChallenge(): UseMutationResult<
  CreateChallengeResponse,
  Error,
  CreateChallengeRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChallengeRequest) => challengeApi.createChallenge(data),
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
    mutationFn: ({ challengeId, data }: { challengeId: number; data: JoinChallengeRequest }) =>
      challengeApi.joinChallenge(challengeId, data),
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
    mutationFn: (participantId: number) => challengeApi.acceptParticipant(participantId),
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
    mutationFn: (participantId: number) => challengeApi.rejectParticipant(participantId),
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
    mutationFn: (challengeId: number) => challengeApi.leaveChallenge(challengeId),
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
    mutationFn: (challengeId: number) => challengeApi.likeChallenge(challengeId),
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
    mutationFn: (challengeId: number) => challengeApi.unlikeChallenge(challengeId),
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
