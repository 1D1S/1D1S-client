import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { bannerApi } from '../api/bannerApi';
import { BANNER_QUERY_KEYS } from '../consts/queryKeys';
import { Banner } from '../type/banner';

/**
 * 공개 배너(오늘 활성) 조회.
 *
 * 배너는 비핵심 UI 다. 엔드포인트 미배포(404)·권한(403)·일시 오류로 실패해도
 * 홈이 깨지면 안 되므로 queryFn 에서 오류를 삼켜 빈 배열을 돌려준다. 그러면
 * 전역 QueryCache onError(토스트)가 뜨지 않고, 소비처(HomeWarmBanner)가 빈
 * 배열을 보고 하드코딩 배너로 조용히 폴백한다.
 */
export function useBanners(): UseQueryResult<Banner[], Error> {
  return useQuery({
    queryKey: BANNER_QUERY_KEYS.list(),
    queryFn: async () => {
      try {
        return await bannerApi.getBanners();
      } catch {
        return [] as Banner[];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
