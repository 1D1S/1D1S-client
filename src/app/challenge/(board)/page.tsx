import { ChallengeBoardSkeleton } from '@component/skeletons/ChallengeBoardSkeleton';
import { fetchPublicChallengeBoardPage } from '@feature/challenge/board/api/publicChallengeList';
import ChallengeBoardScreen from '@feature/challenge/board/screen/ChallengeBoardScreen';
import { buildPageMetadata } from '@module/metadata/seo';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = buildPageMetadata({
  title: '챌린지 | 1Day 1Streak',
  description: '지금 모집 중인 챌린지를 찾아 매일의 기록을 시작하세요.',
  path: '/challenge',
  type: 'website',
});

/**
 * 데이터 프리페치는 클라이언트 React Query(useChallengeList)로 이관했다.
 * 서버에서 쿠키를 읽지 않으므로 이 route 는 dynamic 강제에서 풀려
 * `<Link>` prefetch 로 RSC 셸이 미리 채워지고, 이동 시 QueryClient 캐시가
 * 즉시 서빙된다(캐시가 fresh 면 스켈레톤 없이 전환).
 *
 * Suspense 를 page 내부에 두는 이유:
 * route-level `loading.tsx` 는 해당 segment 의 모든 하위 라우트 (/challenge/[id]
 * 등) 까지 wrapping 하므로, 디테일 페이지 새로고침 시 보드 스켈레톤이 먼저
 * 노출되는 문제가 있다. Suspense 를 페이지 내부에 두면 이 segment 의 page
 * 에만 fallback 이 적용된다. (ChallengeBoardScreen 의 useSearchParams CSR
 * bailout 경계도 겸한다.)
 */
// 초기 HTML(=fallback)에 실을 챌린지 수. 목록 자체는 하이드레이션 후
// 무한스크롤이 채우므로 첫 화면 분량이면 충분하다.
const SSR_CHALLENGE_COUNT = 12;

export default async function ChallengeListPage(): Promise<React.ReactElement> {
  // 화면이 처음 요청하는 것과 **같은 조건**(모집중·진행중)으로 읽는다.
  // 같은 응답을 fallback 과 화면 양쪽에 넘겨, 하이드레이션 직후 스켈레톤으로
  // 되돌아가지 않게 한다.
  const initialPage = await fetchPublicChallengeBoardPage(SSR_CHALLENGE_COUNT);

  return (
    <Suspense
      fallback={<ChallengeBoardSkeleton challenges={initialPage.items} />}
    >
      <ChallengeBoardScreen initialPage={initialPage} />
    </Suspense>
  );
}
