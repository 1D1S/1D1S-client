'use client';

import { notifyApiError } from '@module/api/errorNotify';
import { toast } from '@module/providers/toast';
import { useState } from 'react';

import { usePokeChallengeMembers } from './useChallengeMutations';

interface UsePokeMembersResult {
  /** 이번 세션에서 이미 찌른 챌린지원 memberId 목록 */
  pokedMemberIds: number[];
  /** 현재 찌르기 요청 중인 대상 memberId (없으면 null) */
  pokingMemberId: number | null;
  handlePokeMember(memberId: number): void;
}

/**
 * 챌린지원 콕 찌르기 상태/핸들러. ChallengeDetailScreen 에서 분리.
 */
export function usePokeMembers(challengeId: number): UsePokeMembersResult {
  const pokeChallengeMembers = usePokeChallengeMembers();
  const [pokedMemberIds, setPokedMemberIds] = useState<number[]>([]);
  const [pokingMemberId, setPokingMemberId] = useState<number | null>(null);

  const handlePokeMember = (memberId: number): void => {
    if (pokeChallengeMembers.isPending) {
      return;
    }
    setPokingMemberId(memberId);
    pokeChallengeMembers.mutate(
      { challengeId, receiverMemberIds: [memberId] },
      {
        onSuccess: (result) => {
          const pokedIds = result?.pokedMemberIds ?? [];
          if (pokedIds.includes(memberId)) {
            setPokedMemberIds((prev) =>
              Array.from(new Set([...prev, ...pokedIds]))
            );
            toast.success('콕 찔렀어요!');
          } else {
            // 오늘 이미 일지를 썼거나 오늘 이미 찔러 대상에서 제외된 경우
            toast('오늘은 찌를 수 없는 챌린지원이에요.');
          }
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
        onSettled: () => {
          setPokingMemberId(null);
        },
      }
    );
  };

  return { pokedMemberIds, pokingMemberId, handlePokeMember };
}
