import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import type { ActivePopup } from '../type/popup';

export const popupApi = {
  // 오늘(KST) 게시 중 팝업 목록 (시작일 오름차순). 없으면 빈 배열.
  getActivePopups: (): Promise<ActivePopup[]> =>
    requestData<ActivePopup[]>(apiClient, {
      url: '/popups/active',
      method: 'GET',
    }),
};
