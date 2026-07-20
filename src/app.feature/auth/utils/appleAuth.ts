// Sign in with Apple (웹) — Apple JS(AppleID.auth) 팝업 흐름.
//
// 구글 등 기존 소셜 로그인은 서버 리다이렉트 OAuth2(`/oauth2/authorization/*`)
// 지만, 애플은 요청 계약(클라에서 identityToken 획득 → POST /auth/apple/login)
// 에 맞춰 Apple JS 팝업으로 토큰을 받아 서버로 보낸다. usePopup:true 라
// 리다이렉트/콜백 라우트 없이 signIn() 이 토큰을 직접 돌려준다.

// Apple JS SDK(전역 window.AppleID). 필요한 부분만 좁게 타입핑한다.
interface AppleSignInResponse {
  authorization: { code: string; id_token: string; state?: string };
  // name/email 은 사용자의 "최초 인가" 때만 내려온다. 이후 로그인엔 없다.
  user?: {
    name?: { firstName?: string; lastName?: string };
    email?: string;
  };
}

interface AppleIDAuth {
  init(config: {
    clientId: string;
    scope: string;
    redirectURI: string;
    state?: string;
    usePopup: boolean;
  }): void;
  signIn(): Promise<AppleSignInResponse>;
}

declare global {
  interface Window {
    AppleID?: { auth: AppleIDAuth };
  }
}

const APPLE_SDK_URL =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/ko_KR/appleid.auth.js';

export interface AppleAuthConfig {
  clientId: string;
  redirectUri: string;
}

/**
 * env 로부터 애플 설정을 읽는다. Services ID(client_id)와 Return URL 이 모두
 * 있어야 유효하며, 하나라도 없으면 null 을 돌려 버튼을 숨기는 근거로 쓴다.
 */
export function getAppleAuthConfig(): AppleAuthConfig | null {
  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return null;
  }
  return { clientId, redirectUri };
}

// SDK 는 애플 버튼을 처음 누를 때만 지연 로드한다(모든 페이지 로드 비용 회피).
let sdkPromise: Promise<void> | null = null;

function loadAppleSdk(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Apple SDK: window 없음'));
  }
  if (window.AppleID) {
    return Promise.resolve();
  }
  if (sdkPromise) {
    return sdkPromise;
  }
  sdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = APPLE_SDK_URL;
    script.async = true;
    script.onload = (): void => resolve();
    script.onerror = (): void => {
      sdkPromise = null; // 실패 시 다음 클릭에서 재시도 가능하게 캐시 해제
      reject(new Error('Apple SDK 로드 실패'));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export interface AppleCredential {
  identityToken: string;
  authorizationCode: string;
  name?: string;
  email?: string;
}

/**
 * 애플 팝업 로그인. SDK 로드 → init → signIn 팝업 → 토큰/최초 name·email 반환.
 * env 미설정이면 호출 전에 걸러야 한다(getAppleAuthConfig).
 */
export async function signInWithApple(): Promise<AppleCredential> {
  const config = getAppleAuthConfig();
  if (!config) {
    throw new Error('Apple 로그인 env(NEXT_PUBLIC_APPLE_*) 미설정');
  }
  await loadAppleSdk();
  if (!window.AppleID) {
    throw new Error('Apple SDK 사용 불가');
  }

  window.AppleID.auth.init({
    clientId: config.clientId,
    scope: 'name email',
    redirectURI: config.redirectUri,
    usePopup: true,
  });

  const res = await window.AppleID.auth.signIn();
  const fullName = res.user?.name
    ? [res.user.name.firstName, res.user.name.lastName]
        .filter(Boolean)
        .join(' ')
        .trim()
    : '';

  return {
    identityToken: res.authorization.id_token,
    authorizationCode: res.authorization.code,
    // 최초 로그인에만 존재. 이후엔 undefined 로 보내고 서버가 기존 값을 쓴다.
    name: fullName || undefined,
    email: res.user?.email || undefined,
  };
}
