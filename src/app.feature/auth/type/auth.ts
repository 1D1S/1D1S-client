export type JobType = 'STUDENT' | 'WORKER';
export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';
export type CategoryType =
  | 'DEV'
  | 'EXERCISE'
  | 'BOOK'
  | 'MUSIC'
  | 'STUDY'
  | 'LEISURE'
  | 'ECONOMY';
export type OAuthProvider = 'google' | 'kakao' | 'naver';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  message: string;
  data: TokenData;
}

export interface SocialLoginResponse {
  message: string;
  data: TokenData & {
    profileComplete: boolean;
  };
}

export interface SignUpInfoRequest {
  nickname: string;
  profileUrl?: string;
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
