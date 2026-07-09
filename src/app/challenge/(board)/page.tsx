import { ChallengeBoardSkeleton } from '@component/skeletons/ChallengeBoardSkeleton';
import ChallengeBoardScreen from '@feature/challenge/board/screen/ChallengeBoardScreen';
import React, { Suspense } from 'react';

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
export default function ChallengeListPage(): React.ReactElement {
  return (
    <Suspense fallback={<ChallengeBoardSkeleton />}>
      <ChallengeBoardScreen />
    </Suspense>
  );
}
