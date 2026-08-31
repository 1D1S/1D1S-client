import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchPublicChallenge } from './seo';

function mockResponse(body: unknown, ok = true): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(body),
    })
  );
}

function challengeBody(challengeType: string): unknown {
  return {
    data: {
      challengeSummary: {
        title: '비밀 스터디',
        thumbnailImage: 'https://cdn.example.com/a.png',
        challengeType,
      },
      challengeDetail: { description: '초대받은 사람만' },
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchPublicChallenge', () => {
  it('비공개 챌린지는 제목 한 글자도 내보내지 않는다', async () => {
    // 서버가 잠금을 안 걸고 200 + 상세를 준 상황(SEC-1).
    mockResponse(challengeBody('PRIVATE'));
    await expect(fetchPublicChallenge('12')).resolves.toBeNull();
  });

  it('공개 챌린지는 그대로 OG 에 싣는다', async () => {
    mockResponse(challengeBody('PUBLIC'));
    await expect(fetchPublicChallenge('12')).resolves.toEqual({
      title: '비밀 스터디',
      description: '초대받은 사람만',
      thumbnailImage: 'https://cdn.example.com/a.png',
      category: undefined,
      challengeType: 'PUBLIC',
      goalType: undefined,
      startDate: undefined,
      endDate: undefined,
      participantCnt: undefined,
    });
  });

  it('서버가 막아 준 경우(403 등)도 그대로 폴백한다', async () => {
    mockResponse({}, false);
    await expect(fetchPublicChallenge('12')).resolves.toBeNull();
  });
});
