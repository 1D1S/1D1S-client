import { getDateTimestamp, getRelativeTimeLabel } from '@module/utils/date';

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
// raw new Date(iso) 는 백엔드의 공백구분('YYYY-MM-DD HH:mm:ss')/마이크로초
// 타임스탬프를 Safari/Firefox 에서 Invalid Date 로 만들어 정렬이 전부 0으로
// 붕괴한다. date.ts 의 정규화 파서를 공유한다.
const toTime = getDateTimestamp;

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

// 정렬 규칙: 내 스토리는 항상 맨 앞에 고정한다. 그 외에는 가장 최근
// 스토리가 있는 그룹을 앞에 둔다(시간 내림차순). 시청 여부로 순서를 바꾸면,
// 방금 본 최신 스토리가 더 오래된 미시청 그룹 뒤로 밀려 "최신이 먼저 보이지
// 않는" 문제가 생기므로 시간만으로 정렬한다.
// (미시청 표시는 StoryRing 의 NEW 배지가 isGroupAllSeen 으로 별도 처리한다.)
// 각 그룹 내부 스토리도 최신순으로 정렬한다.
export function sortStoryGroups(groups: StoryGroup[]): StoryGroup[] {
  return groups
    .map((group) => ({
      ...group,
      stories: sortStoriesByRecent(group.stories),
    }))
    .sort((left, right) => {
      if (Boolean(left.isMyStory) !== Boolean(right.isMyStory)) {
        return left.isMyStory ? -1 : 1;
      }
      return latestStoryTime(right) - latestStoryTime(left);
    });
}

export function formatStoryDate(iso: string): string {
  return getRelativeTimeLabel(iso, '');
}
