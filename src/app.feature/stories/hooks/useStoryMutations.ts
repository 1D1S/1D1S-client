import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { storyApi } from '../api/storyApi';
import { STORY_QUERY_KEYS } from '../consts/queryKeys';
import { StoriesResponse } from '../type/story';

export function useViewStory(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (diaryId: number) => storyApi.viewStory(diaryId),
    onSuccess: (_, diaryId) => {
      const queryKey = STORY_QUERY_KEYS.list();
      // 시청 성공 시 캐시를 직접 갱신: hasUnreadJournal=false,
      // 그룹 내 모든 스토리가 읽혔다면 unreadCount 도 감소시킨다.
      queryClient.setQueryData<StoriesResponse>(queryKey, (prev) => {
        if (!prev) {
          return prev;
        }

        let unreadDelta = 0;

        const nextGroups = prev.storyGroups.map((group) => {
          const matchedIndex = group.stories.findIndex(
            (story) => story.diaryId === diaryId
          );
          if (matchedIndex === -1) {
            return group;
          }

          const story = group.stories[matchedIndex];
          if (!story.hasUnreadJournal) {
            return group;
          }

          unreadDelta += 1;

          const nextStories = group.stories.map((current, index) =>
            index === matchedIndex
              ? { ...current, hasUnreadJournal: false }
              : current
          );
          return { ...group, stories: nextStories };
        });

        return {
          ...prev,
          storyGroups: nextGroups,
          unreadCount: Math.max(0, prev.unreadCount - unreadDelta),
        };
      });
    },
  });
}
