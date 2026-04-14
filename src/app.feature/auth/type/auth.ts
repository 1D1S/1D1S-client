import type {
  GENDER_VALUES,
  JOB_VALUES,
  TOPIC_VALUES,
} from '../hooks/use-sign-up-form';

export type JobType = (typeof JOB_VALUES)[number];
export type GenderType = (typeof GENDER_VALUES)[number];
export type CategoryType = (typeof TOPIC_VALUES)[number];
export type OAuthProvider = 'google' | 'kakao' | 'naver';

export interface SocialLoginResponse {
  message: string;
  data: {
    profileComplete: boolean;
  } & Partial<{
    accessToken: string;
    refreshToken: string;
  }>;
}

export interface SignUpInfoRequest {
  nickname: string;
  profileImageKey?: string;
  job: JobType;
  birth: string; // yyyy-MM-dd format
  gender: GenderType;
  isPublic: boolean;
  category: CategoryType[];
}

export interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
}

export interface PresignedUrlResponse {
  message: string;
  data: {
    presignedUrl: string;
    objectKey: string;
  };
}

export interface SignUpInfoResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}
