import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { authApi } from '../api/authApi';
import { AUTH_QUERY_KEYS } from '../consts/queryKeys';
import { OAuthProvider, SocialLoginResponse } from '../type/auth';

// 소셜 로그인 인가 코드로 로그인 처리
export function useSocialLogin(
  provider: OAuthProvider,
  code: string | null,
  state: string | null
): UseQueryResult<SocialLoginResponse, Error> {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.socialLogin(provider, code, state),
    queryFn: () => authApi.socialLogin(provider, code!, state ?? undefined),
    enabled: Boolean(provider) && Boolean(code),
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
