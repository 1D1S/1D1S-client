import axios from 'axios';
import {
  RefreshTokenResponse,
  SocialLoginResponse,
  SignUpInfoRequest,
  SignUpInfoResponse,
  SignUpInfoWithFileRequest,
  LogoutResponse,
  OAuthProvider,
} from '../type/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'https://api.example.com',
  timeout: 10000,
});

// Auth API는 토큰을 받기 위한 API이므로 기본 인터셉터는 설정하지 않음
// 필요한 경우 개별 요청에서 헤더 설정

export const authApi = {
  // 토큰 갱신
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.get('/auth/token', {
      headers: {
        'Authorization-Refresh': `Bearer ${refreshToken}`,
      },
    });
    return response.data;
  },

  // 소셜 로그인 완료 응답
  getSocialLoginResult: async (provider: OAuthProvider): Promise<SocialLoginResponse> => {
    const response = await api.get(`/login/oauth2/code/${provider}`);
    return response.data;
  },

  // 추가 정보 입력 (텍스트 데이터만)
  completeSignUpInfo: async (
    data: SignUpInfoRequest,
    accessToken: string
  ): Promise<SignUpInfoResponse> => {
    const response = await api.put('/signup/info', data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

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

    const response = await api.put('/signup/info', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 로그아웃
  logout: async (accessToken: string): Promise<LogoutResponse> => {
    const response = await api.post('/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },
};
