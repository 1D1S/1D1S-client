import { apiClient, publicApiClient } from '@module/api/client';
import { requestBody } from '@module/api/request';
import { refreshAccessTokenOnce } from '@module/api/tokenRefresh';

import {
  AppleLoginRequest,
  LogoutResponse,
  OAuthProvider,
  PresignedUrlRequest,
  PresignedUrlResponse,
  SignUpInfoRequest,
  SignUpInfoResponse,
  SocialLoginResponse,
} from '../type/auth';

export const authApi = {
  // 소셜 로그인 인가 코드 전달
  socialLogin: async (
    provider: OAuthProvider,
    code: string,
    state?: string,
    nativeCodeChallenge?: string
  ): Promise<SocialLoginResponse> =>
    requestBody<SocialLoginResponse>(publicApiClient, {
      url: `/login/oauth2/code/${provider}`,
      method: 'GET',
      params: { code, state, nativeCodeChallenge },
      withCredentials: true,
    }),

  // Sign in with Apple (웹) — 클라에서 받은 identityToken 등을 서버로 전달.
  // 서버가 Set-Cookie(HttpOnly)로 세션을 세우고 SocialLoginResponse 를 돌려준다.
  appleLogin: async (
    data: AppleLoginRequest
  ): Promise<SocialLoginResponse> =>
    requestBody<SocialLoginResponse, AppleLoginRequest>(publicApiClient, {
      url: '/auth/apple/login',
      method: 'POST',
      data,
      withCredentials: true,
    }),

  // 추가 정보 입력 (텍스트 데이터만)
  completeSignUpInfo: async (
    data: SignUpInfoRequest
  ): Promise<SignUpInfoResponse> =>
    requestBody<SignUpInfoResponse, SignUpInfoRequest>(apiClient, {
      url: '/signup/info',
      method: 'PUT',
      data,
    }),

  // presigned URL 발급
  getPresignedUrl: async (
    data: PresignedUrlRequest
  ): Promise<PresignedUrlResponse> =>
    requestBody<PresignedUrlResponse, PresignedUrlRequest>(apiClient, {
      url: '/image/presigned-url',
      method: 'POST',
      data,
    }),

  // 토큰 재발급 (refresh token cookie → 새 access token)
  // 회전 레이스 방지를 위해 전역 single-flight 를 공유한다.
  refreshToken: async (): Promise<void> => refreshAccessTokenOnce(),

  // 로그아웃
  //
  // 네이티브 쉘 통지는 여기가 아니라 useLogout 의 onSettled 가 한다. 여기서
  // 알리면 로컬 인증 힌트(localStorage/쿠키/사이드바 캐시)를 지우기 *전*이라,
  // 통지를 받은 쉘이 리로드한 탭들이 그 힌트를 읽고 로그인 상태로 되돌아간다.
  logout: async (): Promise<LogoutResponse> =>
    requestBody<LogoutResponse, Record<string, never>>(apiClient, {
      url: '/auth/logout',
      method: 'POST',
      data: {},
    }),
};
