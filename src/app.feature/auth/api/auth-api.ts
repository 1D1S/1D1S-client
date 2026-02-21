import { publicApiClient } from '@module/api/client';
import { requestBody } from '@module/api/request';

import {
  LogoutResponse,
  OAuthProvider,
  RefreshTokenResponse,
  SignUpInfoRequest,
  SignUpInfoResponse,
  SignUpInfoWithFileRequest,
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

  // 소셜 로그인 완료 응답
  getSocialLoginResult: async (
    provider: OAuthProvider
  ): Promise<SocialLoginResponse> =>
    requestBody<SocialLoginResponse>(publicApiClient, {
      url: `/login/oauth2/code/${provider}`,
      method: 'GET',
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

  // 추가 정보 입력 (프로필 이미지 포함)
  completeSignUpInfoWithFile: async (
    data: SignUpInfoWithFileRequest,
    accessToken: string
  ): Promise<SignUpInfoResponse> => {
    const formData = new FormData();

    // 텍스트 데이터 추가
    formData.append('nickname', data.nickname);
    formData.append('job', data.job);
    formData.append('birth', data.birth);
    formData.append('gender', data.gender);
    formData.append('isPublic', data.isPublic.toString());

    // 카테고리 배열 추가
    data.category.forEach((cat) => {
      formData.append('category', cat);
    });

    // 프로필 이미지 추가 (있는 경우)
    if (data.profileImage) {
      formData.append('profileImage', data.profileImage);
    }

    return requestBody<SignUpInfoResponse, FormData>(publicApiClient, {
      url: '/signup/info',
      method: 'PUT',
      data: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 로그아웃
  logout: async (accessToken: string): Promise<LogoutResponse> =>
    requestBody<LogoutResponse, Record<string, never>>(publicApiClient, {
      url: '/auth/logout',
      method: 'POST',
      data: {},
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
};
