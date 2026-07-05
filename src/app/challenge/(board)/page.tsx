import { ChallengeBoardSkeleton } from '@component/skeletons/ChallengeBoardSkeleton';
import { CHALLENGE_QUERY_KEYS } from '@feature/challenge/board/consts/queryKeys';
import ChallengeBoardScreen from '@feature/challenge/board/screen/ChallengeBoardScreen';
import { getServerChallengeList } from '@module/api/serverApi';
import React, { Suspense } from 'react';

import { Prefetch } from '@/app.lib/Prefetch';

const CHALLENGE_LIST_PARAMS = { limit: 12 };

async function ChallengeListContent(): Promise<React.ReactElement> {
  return (
    <Prefetch
      queries={[
        {
          type: 'infinite',
          queryKey: CHALLENGE_QUERY_KEYS.list(CHALLENGE_LIST_PARAMS),
          initialPageParam: undefined,
          queryFn: () => getServerChallengeList(CHALLENGE_LIST_PARAMS),
        },
      ]}
    >
      <ChallengeBoardScreen />
    </Prefetch>
  );
}

/**
 * Suspense 를 page 내부에 두는 이유:
 * route-level `loading.tsx` 는 해당 segment 의 모든 하위 라우트 (/challenge/[id]
 * 등) 까지 wrapping 하므로, 디테일 페이지 새로고침 시 보드 스켈레톤이 먼저
 * 노출되는 문제가 있다. Suspense 를 페이지 내부에 두면 이 segment 의 page
 * 에만 fallback 이 적용된다.
 */
export default function ChallengeListPage(): React.ReactElement {
  return (
    <Suspense fallback={<ChallengeBoardSkeleton />}>
      <ChallengeListContent />
    </Suspense>
  );
}
