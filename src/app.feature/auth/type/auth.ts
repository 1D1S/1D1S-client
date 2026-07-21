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

// Sign in with Apple (웹) 요청 body. (서버 확정 계약)
// - identityToken 만 필수. name/email 은 애플 "최초 인가" 때만 오므로 optional.
// - 응답은 구글 웹 로그인과 동일하게 Set-Cookie(accessToken/refreshToken)로
//   세션을 세우고 { data: { profileComplete } } 를 돌려준다(별도 토큰 저장 안 함).
// - nativeCodeChallenge 는 네이티브 쉘에서 시작된 경우에만 실린다(구글과 동일).
export interface AppleLoginRequest {
  identityToken: string;
  authorizationCode?: string;
  name?: string;
  email?: string;
  nativeCodeChallenge?: string;
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
