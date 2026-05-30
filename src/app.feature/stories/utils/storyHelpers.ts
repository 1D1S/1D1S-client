import { getRelativeTimeLabel } from '@module/utils/date';

import { StoryGroup } from '../type/story';

const STRIPE_TONES = ['peach', 'mint', 'sky'] as const;
export type StoryStripeTone = (typeof STRIPE_TONES)[number];

// 썸네일이 없을 때 스토리 카드/뷰어에 표시할 Stripe 색을 userId 기준으로
// 고정 배정한다. 같은 사용자는 항상 같은 색을 받는다.
export function pickStoryStripeTone(userId: number): StoryStripeTone {
  const index = Math.abs(userId) % STRIPE_TONES.length;
  return STRIPE_TONES[index];
}

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
