import { DiaryBoardSkeleton } from '@component/skeletons/DiaryBoardSkeleton';
import DiaryListScreen from '@feature/diary/board/screen/DiaryListScreen';
import React, { Suspense } from 'react';

/**
 * 데이터 프리페치는 클라이언트 React Query(useDiaryList)로 이관했다.
 * 서버에서 쿠키를 읽지 않으므로 이 route 는 dynamic 강제에서 풀려
 * `<Link>` prefetch 로 RSC 셸이 미리 채워지고, 이동 시 QueryClient 캐시가
 * 즉시 서빙된다(캐시가 fresh 면 스켈레톤 없이 전환).
 *
 * Suspense 는 DiaryListScreen 의 useSearchParams 가 정적 prerender 를
 * CSR bailout 시키지 않도록 경계를 제공한다.
 */
export default function DiaryListPage(): React.ReactElement {
  return (
    <Suspense fallback={<DiaryBoardSkeleton />}>
      <DiaryListScreen />
    </Suspense>
  );
}
