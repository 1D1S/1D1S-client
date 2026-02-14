import {
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { authApi } from '../api/auth-api';
import {
  SocialLoginResponse,
  OAuthProvider,
} from '../type/auth';
import { AUTH_QUERY_KEYS } from '../const/query-keys';
export { AUTH_QUERY_KEYS } from '../const/query-keys';

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
