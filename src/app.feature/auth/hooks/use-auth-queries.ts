import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { authApi } from '../api/auth-api';
import { AUTH_QUERY_KEYS } from '../consts/query-keys';
import { OAuthProvider, SocialLoginResponse } from '../type/auth';

// 소셜 로그인 인가 코드로 로그인 처리
export function useSocialLogin(
  provider: OAuthProvider,
  code: string | null,
  state: string | null
): UseQueryResult<SocialLoginResponse, Error> {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.socialLogin(provider, code, state),
    queryFn: () => authApi.socialLogin(provider, code!, state!),
    enabled: Boolean(provider) && Boolean(code) && Boolean(state),
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
