import { describe, expect, it } from 'vitest';

import type { StoryGroup } from '../type/story';
import { getStoryPreviewThumbnail } from './storyHelpers';

function makeGroup(overrides: Partial<StoryGroup>): StoryGroup {
  return {
    userId: 3,
    userName: '친구',
    profileImage: null,
    stories: [],
    ...overrides,
  };
}

describe('getStoryPreviewThumbnail', () => {
  it('그룹 최신 스토리의 실제 일지 썸네일을 돌려준다(감정/유저 해시 아님)', () => {
    const group = makeGroup({
      userId: 3, // 과거엔 이 값 % 3 으로 감정 얼굴을 임의 배정했다.
      stories: [
        {
          diaryId: 10,
          diaryTitle: '오늘의 일지',
          diaryThumbnail: 'https://cdn.example.com/thumb.jpg',
          createdAt: '2026-07-21T09:00:00',
          hasUnreadJournal: true,
        },
      ],
    });

    expect(getStoryPreviewThumbnail(group)).toBe(
      'https://cdn.example.com/thumb.jpg'
    );
  });

  it('썸네일이 없거나 스토리가 비면 null (감정 얼굴로 대체하지 않는다)', () => {
    expect(getStoryPreviewThumbnail(makeGroup({ stories: [] }))).toBeNull();
    expect(
      getStoryPreviewThumbnail(
        makeGroup({
          stories: [
            {
              diaryId: 1,
              diaryTitle: '',
              diaryThumbnail: null,
              createdAt: '2026-07-21T09:00:00',
              hasUnreadJournal: false,
            },
          ],
        })
      )
    ).toBeNull();
  });
});
