import { CHALLENGE_QUERY_KEYS } from '@feature/challenge/board/consts/queryKeys';
import { DIARY_QUERY_KEYS } from '@feature/diary/board/consts/queryKeys';
import HomeScreen from '@feature/home/screen/HomeScreen';
import {
  getServerRandomChallenges,
  getServerRandomDiaries,
} from '@module/api/serverApi';
import React from 'react';

import { Prefetch } from '@/app.lib/Prefetch';

const RANDOM_CHALLENGES_PARAMS = { size: 4 };
const RANDOM_DIARIES_PARAMS = { size: 12 };

export default function MainPage(): React.ReactElement {
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
      <HomeScreen />
    </Prefetch>
  );
}
