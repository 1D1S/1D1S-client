import { CHALLENGE_QUERY_KEYS } from '@feature/challenge/board/consts/queryKeys';
import { DIARY_QUERY_KEYS } from '@feature/diary/board/consts/queryKeys';
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

export default async function MainPage(): Promise<React.ReactElement> {
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
