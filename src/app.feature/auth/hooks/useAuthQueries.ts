import { peekNativeOAuth } from '@module/utils/nativeBridge';
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
    queryFn: () =>
      authApi.socialLogin(
        provider,
        code!,
        state ?? undefined,
        peekNativeOAuth() ?? undefined
      ),
    enabled: Boolean(provider) && Boolean(code),
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // 로그인 실패는 전역 에러 토스트를 띄우지 않는다 — 콜백이 조용히
    // /login 으로 돌려보낸다(탈퇴 계정 재로그인 시 서버 메시지 노출 방지).
    // noPersist: 응답에 nativeLoginCode 등 일회성 인증 데이터가 담겨
    // localStorage RQ persist 대상에서 제외한다.
    meta: { skipGlobalErrorToast: true, noPersist: true },
  });
}
