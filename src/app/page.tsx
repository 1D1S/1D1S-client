import HomeMobileHeader from '@feature/home/components/HomeMobileHeader';
import HomeScreen from '@feature/home/screen/HomeScreen';
import StoryRingSkeleton from '@feature/stories/components/StoryRingSkeleton';
import React, { Suspense } from 'react';

function HomeLoadingSkeleton(): React.ReactElement {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-7 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4">
        <div className="-mx-5 lg:-mx-8">
          <StoryRingSkeleton />
        </div>
        <div className="h-24 w-full animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-32 w-full animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-72 w-full animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}

/**
 * 홈의 랜덤 챌린지/일지 데이터는 클라이언트 React Query(useHomeRandomData)로
 * 이관했다. 서버에서 쿠키를 읽지 않으므로 이 route 는 dynamic 강제에서 풀려
 * `<Link>` prefetch 로 RSC 셸이 미리 채워지고, 로고 클릭 등으로 홈에 돌아올 때
 * QueryClient 캐시가 즉시 서빙된다.
 *
 * 트레이드오프: 서버 인증 힌트(initialHasAuthHint) 프리페치를 제거해, 하드
 * 로드(콜드) 첫 페인트에서 로그인 사용자가 한 프레임 비로그인 UI 를 볼 수
 * 있다. 클라이언트 네비게이션(SPA)에서는 hasMounted=true 라 이 시프트가
 * 없다. HomeScreen 은 mount 이후 useIsLoggedIn 으로 권위 있게 판정한다.
 *
 * Suspense 는 HomeScreen 의 useSearchParams CSR bailout 경계를 겸한다.
 */
export default function MainPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <HomeMobileHeader />
      <Suspense fallback={<HomeLoadingSkeleton />}>
        <HomeScreen />
      </Suspense>
    </div>
  );
}
