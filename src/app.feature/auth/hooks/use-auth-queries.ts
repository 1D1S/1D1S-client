import {
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { authApi } from '../data/api';
import {
  SocialLoginResponse,
  OAuthProvider,
} from '../data/types';

export const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,
  socialLogin: (provider: OAuthProvider) => [...AUTH_QUERY_KEYS.all, 'socialLogin', provider] as const,
};

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