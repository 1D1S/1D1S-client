import { fetchPublicOfficialChallengePage } from '@feature/challenge/board/api/publicChallengeList';
import ExploreScreen from '@feature/explore/screen/ExploreScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '탐색 | 1Day 1Streak',
  description: '관심 있는 챌린지와 사람들의 기록을 둘러보세요.',
  path: '/explore',
  type: 'website',
});

/**
 * 공식 챌린지만 서버에서 미리 읽어 초기 HTML 에 싣는다.
 *
 * 나머지 섹션(오늘 시작해볼 챌린지·오늘의 응원)은 랜덤·개인화 데이터라
 * 색인 가치가 없고 매 요청 달라져 캐시도 못 쓴다. 그대로 클라이언트에서
 * 받는다.
 */
export default async function ExplorePage(): Promise<React.ReactElement> {
  const initialOfficialPage = await fetchPublicOfficialChallengePage();

  return <ExploreScreen initialOfficialPage={initialOfficialPage} />;
}
