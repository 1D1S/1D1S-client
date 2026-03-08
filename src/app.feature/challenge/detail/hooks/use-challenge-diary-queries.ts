import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { CHALLENGE_QUERY_KEYS } from '../../board/consts/query-keys';
import { challengeDetailApi } from '../api/challenge-detail-api';
import { ChallengeDiaryItem } from '../type/challenge-diary';

export function useChallengeDiaryList(
  challengeId: number
): UseQueryResult<ChallengeDiaryItem[], Error> {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.diaries(challengeId, {}),
    queryFn: () => challengeDetailApi.getChallengeDiaries(challengeId),
    enabled: Boolean(challengeId),
  });
}
