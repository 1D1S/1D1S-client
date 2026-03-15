import { apiClient, publicApiClient } from '@module/api/client';
import { requestBody } from '@module/api/request';

import {
  LogoutResponse,
  OAuthProvider,
  PresignedUrlRequest,
  PresignedUrlResponse,
  RefreshTokenResponse,
  SignUpInfoRequest,
  SignUpInfoResponse,
  SocialLoginResponse,
} from '../type/auth';

export const authApi = {
  // 토큰 갱신
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> =>
    requestBody<RefreshTokenResponse>(publicApiClient, {
      url: '/auth/token',
      method: 'GET',
      headers: {
        'Authorization-Refresh': `Bearer ${refreshToken}`,
      },
    }),

  // 소셜 로그인 인가 코드 전달
  socialLogin: async (
    provider: OAuthProvider,
    code: string,
    state: string
  ): Promise<SocialLoginResponse> =>
    requestBody<SocialLoginResponse>(publicApiClient, {
      url: `/login/oauth2/code/${provider}`,
      method: 'GET',
      params: { code, state },
      withCredentials: true,
    }),

  // 추가 정보 입력 (텍스트 데이터만)
  completeSignUpInfo: async (
    data: SignUpInfoRequest,
    accessToken: string
  ): Promise<SignUpInfoResponse> =>
    requestBody<SignUpInfoResponse, SignUpInfoRequest>(publicApiClient, {
      url: '/signup/info',
      method: 'PUT',
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),

  // presigned URL 발급
  getPresignedUrl: async (
    data: PresignedUrlRequest,
    accessToken: string
  ): Promise<PresignedUrlResponse> =>
    requestBody<PresignedUrlResponse, PresignedUrlRequest>(publicApiClient, {
      url: '/image/presigned-url',
      method: 'POST',
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),

  // 로그아웃
  logout: async (): Promise<LogoutResponse> =>
    requestBody<LogoutResponse, Record<string, never>>(apiClient, {
      url: '/auth/logout',
      method: 'POST',
      data: {},
    }),
};
