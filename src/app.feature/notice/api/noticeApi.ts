import { publicApiClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import { Notice, NoticeListData, NoticeListParams } from '../type/notice';

export const noticeApi = {
  // 공지 목록 — GET /notices (비인증 허용).
  // 정렬은 서버 책임(고정 먼저 → 고정끼리 오래된순 → 비고정 최신순).
  // 클라이언트는 정렬 파라미터를 보내지 않는다.
  getNotices: async (params?: NoticeListParams): Promise<NoticeListData> =>
    requestData<NoticeListData>(publicApiClient, {
      url: '/notices',
      method: 'GET',
      params,
    }),

  // 없는 공지는 404 NOTICE-001 — 상세 화면이 안내 문구로 처리한다.
  getNotice: async (id: string): Promise<Notice> =>
    requestData<Notice>(publicApiClient, {
      url: `/notices/${id}`,
      method: 'GET',
    }),
};
