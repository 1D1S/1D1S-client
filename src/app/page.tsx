import { CHALLENGE_QUERY_KEYS } from '@feature/challenge/board/consts/queryKeys';
import { DIARY_QUERY_KEYS } from '@feature/diary/board/consts/queryKeys';
import HomeMobileHeader from '@feature/home/components/HomeMobileHeader';
import HomeScreen from '@feature/home/screen/HomeScreen';
import {
  getServerRandomChallenges,
  getServerRandomDiaries,
} from '@module/api/serverApi';
import { hasServerAccessToken } from '@module/utils/serverAuth';
import React, { Suspense } from 'react';

import { Prefetch } from '@/app.lib/Prefetch';

const RANDOM_CHALLENGES_PARAMS = { size: 4 };
const RANDOM_DIARIES_PARAMS = { size: 12 };

function HomeLoadingSkeleton(): React.ReactElement {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-7 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4">
        <div className="-mx-5 lg:-mx-8">
          <div
            className="scrollbar-hide flex w-full gap-3 overflow-x-auto px-5 py-3.5 lg:px-8"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex w-[140px] shrink-0 flex-col gap-2"
              >
                <div className="aspect-4/5 w-full rounded-xl bg-gray-100" />
                <div className="flex flex-col gap-1 px-0.5">
                  <div className="h-3 w-3/4 rounded bg-gray-100" />
                  <div className="h-2.5 w-1/2 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-24 w-full animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-32 w-full animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-72 w-full animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}

async function MainPageContent(): Promise<React.ReactElement> {
  // SSR 시점에 인증 힌트를 미리 평가하여 클라이언트 hydration 직후
  // 비로그인 → 로그인 UI 점프(레이아웃 시프트)를 막는다.
  const initialHasAuthHint = await hasServerAccessToken();

  return (
    <Prefetch
      queries={[
        {
          queryKey: CHALLENGE_QUERY_KEYS.random(RANDOM_CHALLENGES_PARAMS),
          queryFn: () => getServerRandomChallenges(RANDOM_CHALLENGES_PARAMS),
        },
        {
          queryKey: DIARY_QUERY_KEYS.random(RANDOM_DIARIES_PARAMS),
          queryFn: () => getServerRandomDiaries(RANDOM_DIARIES_PARAMS),
        },
      ]}
    >
      {/* HomeScreen 내부에서 useSearchParams 사용 — prerender 시 CSR bailout
          되지 않도록 Suspense 경계를 둔다 */}
      <Suspense fallback={null}>
        <HomeScreen initialHasAuthHint={initialHasAuthHint} />
      </Suspense>
    </Prefetch>
  );
}

/**
 * page 자체를 async 로 두면 app/loading.tsx(전역 얇은 바)를 먼저 타게 된다.
 * 홈만 전역 로딩바가 노출되는 불균형을 막기 위해 내부 async 컴포넌트를
 * Suspense 로 감싸 홈 전용 스켈레톤을 fallback 으로 사용한다.
 */
export default function MainPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <HomeMobileHeader />
      <Suspense fallback={<HomeLoadingSkeleton />}>
        <MainPageContent />
      </Suspense>
    </div>
  );
}
