import type {
  GENDER_VALUES,
  JOB_VALUES,
  TOPIC_VALUES,
} from '../hooks/useSignUpForm';

export type JobType = (typeof JOB_VALUES)[number];
export type GenderType = (typeof GENDER_VALUES)[number];
export type CategoryType = (typeof TOPIC_VALUES)[number];
export type OAuthProvider = 'google' | 'kakao' | 'naver';

// 백엔드 응답 body 에는 accessToken / refreshToken 이 함께 내려오지만
// 프론트엔드는 사용하지 않는다. 실제 인증은 Set-Cookie(HttpOnly) 로 처리되며,
// body 에 토큰을 중복해서 두는 것은 보안상 노출 면을 늘릴 뿐이므로 의도적으로
// 타입에서 제외한다.
export interface SocialLoginResponse {
  message: string;
  data: {
    profileComplete: boolean;
    nativeLoginCode?: string;
    nativeLoginCodeExpiresInSeconds?: number;
  };
}

// Sign in with Apple (웹) 요청 body.
// name/email 은 애플이 "최초 인가" 때만 내려주므로 optional. platform 은 서버가
// 웹/네이티브 발급 경로를 구분하도록 항상 'web' 을 보낸다.
export interface AppleLoginRequest {
  identityToken: string;
  authorizationCode: string;
  name?: string;
  email?: string;
  platform: 'web';
}

export interface SignUpInfoRequest {
  nickname: string;
  phoneNumber: string;
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
