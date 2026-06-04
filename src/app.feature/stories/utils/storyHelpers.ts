import { getRelativeTimeLabel } from '@module/utils/date';

import { StoryGroup, StoryItem } from '../type/story';

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

// createdAt(ISO) → epoch ms. 파싱 불가 시 0.
function toTime(iso: string): number {
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? 0 : time;
}

// 그룹 내 가장 최근 스토리의 작성 시각(ms).
function latestStoryTime(group: StoryGroup): number {
  return group.stories.reduce(
    (latest, story) => Math.max(latest, toTime(story.createdAt)),
    0
  );
}

// 그룹 내 스토리를 최신순(내림차순)으로 정렬한다.
function sortStoriesByRecent(stories: StoryItem[]): StoryItem[] {
  return [...stories].sort(
    (left, right) => toTime(right.createdAt) - toTime(left.createdAt)
  );
}

// 정렬 규칙(랜덤하게 보이지 않도록 시간 기준으로 고정):
//  1) 미시청 그룹이 위 — 읽지 않은 스토리를 먼저 보여준다.
//  2) 최근 스토리가 있는 그룹이 위 — 시간 내림차순.
// 각 그룹 내부 스토리도 최신순으로 정렬한다.
export function sortStoryGroups(groups: StoryGroup[]): StoryGroup[] {
  return groups
    .map((group) => ({
      ...group,
      stories: sortStoriesByRecent(group.stories),
    }))
    .sort((left, right) => {
      const leftSeen = isGroupAllSeen(left) ? 1 : 0;
      const rightSeen = isGroupAllSeen(right) ? 1 : 0;
      if (leftSeen !== rightSeen) {
        return leftSeen - rightSeen;
      }
      return latestStoryTime(right) - latestStoryTime(left);
    });
}

export function formatStoryDate(iso: string): string {
  return getRelativeTimeLabel(iso, '');
}
