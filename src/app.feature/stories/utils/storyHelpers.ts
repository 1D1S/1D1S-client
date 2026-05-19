import { getRelativeTimeLabel } from '@module/utils/date';

import { StoryGroup } from '../type/story';

// 그룹 내 모든 스토리가 읽혔는지 여부.
export function isGroupAllSeen(group: StoryGroup): boolean {
  return group.stories.every((story) => !story.hasUnreadJournal);
}

// 시청 우선순위 정렬: 미시청 그룹이 위, 모두 시청한 그룹은 아래.
export function sortStoryGroups(groups: StoryGroup[]): StoryGroup[] {
  return [...groups].sort((left, right) => {
    const leftSeen = isGroupAllSeen(left) ? 1 : 0;
    const rightSeen = isGroupAllSeen(right) ? 1 : 0;
    return leftSeen - rightSeen;
  });
}

export function formatStoryDate(iso: string): string {
  return getRelativeTimeLabel(iso, '');
}
