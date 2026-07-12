import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { popupApi } from '../api/popupApi';
import { POPUP_QUERY_KEYS } from '../consts/popupQueryKeys';
import type { ActivePopup } from '../type/popup';

// 로그인 사용자에게만 조회한다. 비로그인/비활성 시 요청하지 않고,
// 실패해도 조용히 빈 상태로 둔다(호출부에서 미노출 처리).
export function useActivePopups(
  enabled: boolean
): UseQueryResult<ActivePopup[], Error> {
  return useQuery({
    queryKey: POPUP_QUERY_KEYS.active(),
    queryFn: popupApi.getActivePopups,
    enabled,
  });
}
