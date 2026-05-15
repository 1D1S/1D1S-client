import { DiaryBoardSkeleton } from '@component/skeletons/DiaryBoardSkeleton';
import { DIARY_QUERY_KEYS } from '@feature/diary/board/consts/queryKeys';
import DiaryListScreen from '@feature/diary/board/screen/DiaryListScreen';
import { getServerDiaryList } from '@module/api/serverApi';
import React, { Suspense } from 'react';

import { Prefetch } from '@/app.lib/Prefetch';

const DIARY_LIST_PARAMS = { size: 12 };

async function DiaryListContent(): Promise<React.ReactElement> {
  return (
    <Prefetch
      queries={[
        {
          type: 'infinite',
          queryKey: DIARY_QUERY_KEYS.list(DIARY_LIST_PARAMS),
          initialPageParam: undefined,
          queryFn: () => getServerDiaryList(DIARY_LIST_PARAMS),
        },
      ]}
    >
      <DiaryListScreen />
    </Prefetch>
  );
}

/**
 * Suspense 를 page 내부에 두는 이유는 ChallengeListPage 의 주석 참조.
 */
export default function DiaryListPage(): React.ReactElement {
  return (
    <Suspense fallback={<DiaryBoardSkeleton />}>
      <DiaryListContent />
    </Suspense>
  );
}
