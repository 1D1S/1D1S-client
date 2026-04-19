import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { CHALLENGE_QUERY_KEYS } from '../../board/consts/queryKeys';
import { challengeDetailApi } from '../api/challengeDetailApi';
import { ChallengeDiaryListResponse } from '../type/challengeDiary';

export function useChallengeDiaryList(
  challengeId: number,
  size?: number
): UseQueryResult<ChallengeDiaryListResponse, Error> {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.diaries(challengeId, { size }),
    queryFn: () =>
      challengeDetailApi.getChallengeDiaries(challengeId, size),
    enabled: Boolean(challengeId),
  });
}
