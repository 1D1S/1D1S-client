import type { SidebarChallenge } from '@feature/member/type/member';
import { formatDateISO } from '@module/utils/date';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChallengeSummary as DiaryChallengeSummary } from '../../board/type/diary';
import {
  getDiaryImageUrls,
  getFirstSelectableAchievedDate,
  getSubmitButtonLabel,
  hasSelectableAchievedDate,
  isSelectableAchievedDate,
  mapDiaryChallengeToChallengeListItem,
  mapSidebarChallengeToChallengeListItem,
  parseDateValue,
  parsePositiveInteger,
  revokeObjectUrlIfNeeded,
} from './diaryFormHelpers';

describe('parsePositiveInteger', () => {
  it('parses a positive integer string', () => {
    expect(parsePositiveInteger('5')).toBe(5);
  });

  it('returns null for zero', () => {
    expect(parsePositiveInteger('0')).toBeNull();
  });

  it('returns null for a negative number', () => {
    expect(parsePositiveInteger('-3')).toBeNull();
  });

  it('returns null for a non-integer', () => {
    expect(parsePositiveInteger('3.5')).toBeNull();
  });

  it('returns null for null', () => {
    expect(parsePositiveInteger(null)).toBeNull();
  });
});

describe('parseDateValue', () => {
  it('parses a date-only string as local midnight', () => {
    expect(parseDateValue('2026-07-10')?.getTime()).toBe(
      new Date(2026, 6, 10).getTime()
    );
  });

  it('returns null for null/undefined', () => {
    expect(parseDateValue(null)).toBeNull();
    expect(parseDateValue(undefined)).toBeNull();
  });

  it('returns null for an invalid string', () => {
    expect(parseDateValue('nope')).toBeNull();
  });
});

describe('achieved-date selection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 10, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts today', () => {
    expect(isSelectableAchievedDate(new Date(2026, 6, 10))).toBe(true);
  });

  it('accepts two days back (the min)', () => {
    expect(isSelectableAchievedDate(new Date(2026, 6, 8))).toBe(true);
  });

  it('rejects three days back', () => {
    expect(isSelectableAchievedDate(new Date(2026, 6, 7))).toBe(false);
  });

  it('rejects a future date', () => {
    expect(isSelectableAchievedDate(new Date(2026, 6, 11))).toBe(false);
  });

  it('rejects dates before the challenge start', () => {
    const result = isSelectableAchievedDate(
      new Date(2026, 6, 9),
      '2026-07-10'
    );
    expect(result).toBe(false);
  });

  it('returns today as the first selectable date', () => {
    const result = getFirstSelectableAchievedDate(new Set());
    expect(result && formatDateISO(result)).toBe('2026-07-10');
  });

  it('skips disabled dates to the next selectable one', () => {
    const disabled = new Set(['2026-07-10']);
    const result = getFirstSelectableAchievedDate(disabled);
    expect(result && formatDateISO(result)).toBe('2026-07-09');
  });

  it('reports availability via hasSelectableAchievedDate', () => {
    const allDisabled = new Set([
      '2026-07-10',
      '2026-07-09',
      '2026-07-08',
    ]);
    expect(hasSelectableAchievedDate(new Set())).toBe(true);
    expect(hasSelectableAchievedDate(allDisabled)).toBe(false);
  });
});

describe('getSubmitButtonLabel', () => {
  const base = {
    isCreating: false,
    isUpdating: false,
    isUploadingImage: false,
    isEditMode: false,
  };

  it('prioritizes the creating state', () => {
    expect(getSubmitButtonLabel({ ...base, isCreating: true })).toBe(
      '작성 중...'
    );
  });

  it('shows the updating state', () => {
    expect(getSubmitButtonLabel({ ...base, isUpdating: true })).toBe(
      '수정 중...'
    );
  });

  it('shows the image upload state', () => {
    expect(getSubmitButtonLabel({ ...base, isUploadingImage: true })).toBe(
      '이미지 업로드 중...'
    );
  });

  it('shows the edit-mode idle label', () => {
    expect(getSubmitButtonLabel({ ...base, isEditMode: true })).toBe(
      '수정 완료'
    );
  });

  it('shows the create idle label', () => {
    expect(getSubmitButtonLabel(base)).toBe('작성 완료');
  });
});

const likeInfo = { likedByMe: true, likeCnt: 3 };

describe('mapDiaryChallengeToChallengeListItem', () => {
  it('maps and normalizes a diary challenge summary', () => {
    const summary: DiaryChallengeSummary = {
      challengeId: 1,
      title: '챌린지',
      category: 'UNKNOWN',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      maxParticipantCnt: 10,
      goalType: 'SOMETHING',
      participationType: 'SOLO',
      participantCnt: 4,
      thumbnailImage: null,
      likeInfo,
    };
    expect(mapDiaryChallengeToChallengeListItem(summary)).toEqual({
      challengeId: 1,
      title: '챌린지',
      category: 'DEV',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      maxParticipantCnt: 10,
      goalType: 'FLEXIBLE',
      participationType: 'INDIVIDUAL',
      participantCnt: 4,
      liked: true,
      likeCnt: 3,
      thumbnailImage: undefined,
    });
  });
});

describe('mapSidebarChallengeToChallengeListItem', () => {
  it('maps a sidebar challenge, keeping known enum values', () => {
    const sidebar: SidebarChallenge = {
      challengeId: 2,
      title: '사이드바',
      category: 'EXERCISE',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      maxParticipantCnt: 5,
      goalType: 'FIXED',
      participationType: 'GROUP',
      participantCnt: 2,
      thumbnailImage: 'thumb.png',
      likeInfo: { likedByMe: false, likeCnt: 0 },
    };
    expect(mapSidebarChallengeToChallengeListItem(sidebar)).toMatchObject({
      category: 'EXERCISE',
      goalType: 'FIXED',
      participationType: 'GROUP',
      liked: false,
      likeCnt: 0,
      thumbnailImage: 'thumb.png',
    });
  });
});

describe('getDiaryImageUrls', () => {
  it('returns an empty array for a null diary', () => {
    expect(getDiaryImageUrls(null)).toEqual([]);
  });

  it('extracts raw image strings without resolving', () => {
    const diary = { imgUrl: 'bucket/a.png' };
    expect(getDiaryImageUrls(diary as never)).toEqual(['bucket/a.png']);
  });
});

describe('revokeObjectUrlIfNeeded', () => {
  it('revokes blob urls only', () => {
    const spy = vi.fn();
    URL.revokeObjectURL = spy;
    revokeObjectUrlIfNeeded('blob:abc');
    revokeObjectUrlIfNeeded('https://a.com/x.png');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('blob:abc');
  });
});
