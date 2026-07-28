import { describe, expect, it } from 'vitest';

import { CHALLENGE_TAB_IDS, isChallengeTab } from './challengeTabs';

describe('isChallengeTab', () => {
  it('유효한 탭 id 를 통과시킨다', () => {
    CHALLENGE_TAB_IDS.forEach((id) => {
      expect(isChallengeTab(id)).toBe(true);
    });
  });

  it('알 수 없는 값·null 은 거른다', () => {
    expect(isChallengeTab('unknown')).toBe(false);
    expect(isChallengeTab('')).toBe(false);
    expect(isChallengeTab(null)).toBe(false);
  });
});
