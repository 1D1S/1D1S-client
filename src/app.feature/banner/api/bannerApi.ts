import { publicApiClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import { Banner } from '../type/banner';

export const bannerApi = {
  // 공개 배너(오늘 활성) 목록 — GET /banners (서버 permitAll, 비인증 허용).
  // 정렬은 서버 책임(startDate asc, id asc).
  getBanners: async (): Promise<Banner[]> =>
    requestData<Banner[]>(publicApiClient, {
      url: '/banners',
      method: 'GET',
    }),
};
