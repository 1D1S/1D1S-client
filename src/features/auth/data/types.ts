export type JobType = 'STUDENT' | 'EMPLOYEE' | 'OTHER';
export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';
export type CategoryType = 'DEV' | 'EXERCISE' | 'BOOK' | 'MUSIC' | 'STUDY' | 'LEISURE' | 'ECONOMY';
export type OAuthProvider = 'google' | 'kakao' | 'naver';

export interface TokenData {
  accessToken: string;
  responseToken: string;
}

export interface RefreshTokenResponse {
  message: string;
  data: TokenData;
}

export interface SocialLoginResponse {
  message: string;
  data: TokenData & {
    isProfileComplete: boolean;
  };
}

export interface SignUpInfoRequest {
  nickname: string;
  job: JobType;
  birth: string; // yyyy-MM-dd format
  gender: GenderType;
  isPublic: boolean;
  category: CategoryType[];
}

export interface SignUpInfoResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export interface SignUpInfoWithFileRequest {
  nickname: string;
  job: JobType;
  birth: string;
  gender: GenderType;
  isPublic: boolean;
  category: CategoryType[];
  profileImage?: File;
}