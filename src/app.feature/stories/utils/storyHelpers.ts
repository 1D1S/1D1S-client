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

// 시간 표시: 절대 시간을 받아 "방금", "N분 전", "N시간 전", "어제", "N일 전" 형식으로.
export function formatStoryDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return '방금';
  }
  if (diffMs < hour) {
    return `${Math.floor(diffMs / minute)}분 전`;
  }
  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)}시간 전`;
  }
  if (diffMs < 2 * day) {
    return '어제';
  }
  return `${Math.floor(diffMs / day)}일 전`;
}
