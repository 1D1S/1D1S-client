import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import type { MyTodayChallenge } from '../type/todayChallenge';

export const homeApi = {
  // 진행 중 챌린지의 오늘(KST) 작성 여부 + 목표 목록. 없으면 빈 배열.
  getMyTodayChallenges: (): Promise<MyTodayChallenge[]> =>
    requestData<MyTodayChallenge[]>(apiClient, {
      url: '/challenges/my/today',
      method: 'GET',
    }),
};
