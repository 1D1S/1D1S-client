import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { CHALLENGE_QUERY_KEYS } from '../../board/consts/query-keys';
import { challengeDetailApi } from '../api/challenge-detail-api';
import { ChallengeDiaryListResponse } from '../type/challenge-diary';

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
