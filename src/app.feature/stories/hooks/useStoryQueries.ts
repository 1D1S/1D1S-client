import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { storyApi } from '../api/storyApi';
import { STORY_QUERY_KEYS } from '../consts/queryKeys';
import { StoriesResponse } from '../type/story';

export function useStories(options?: {
  enabled?: boolean;
}): UseQueryResult<StoriesResponse, Error> {
  return useQuery({
    queryKey: STORY_QUERY_KEYS.list(),
    queryFn: () => storyApi.getStories(),
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
  });
}
