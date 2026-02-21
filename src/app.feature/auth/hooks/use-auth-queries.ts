import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { authApi } from '../api/auth-api';
import { AUTH_QUERY_KEYS } from '../consts/query-keys';
import { OAuthProvider,SocialLoginResponse } from '../type/auth';

// 소셜 로그인 결과 조회
export function useSocialLoginResult(
  provider: OAuthProvider,
  enabled = true
): UseQueryResult<SocialLoginResponse, Error> {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.socialLogin(provider),
    queryFn: () => authApi.getSocialLoginResult(provider),
    enabled: Boolean(provider) && enabled,
    retry: false, // 인증 관련은 재시도하지 않음
    refetchOnWindowFocus: false, // 창 포커스 시 재요청하지 않음
  });
}
