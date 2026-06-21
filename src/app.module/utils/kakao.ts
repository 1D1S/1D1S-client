// Kakao JS SDK 로더 + 초기화 헬퍼.
// SDK는 브라우저에서만 동작하므로, 버튼 클릭 시점에 lazy 로드한다.
// NEXT_PUBLIC_KAKAO_JS_KEY 환경변수가 있어야 init이 성공한다.

const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

interface KakaoLink {
  mobileWebUrl: string;
  webUrl: string;
}

export interface KakaoFeedSettings {
  objectType: 'feed';
  content: {
    title: string;
    description?: string;
    imageUrl: string;
    link: KakaoLink;
  };
  buttons?: Array<{ title: string; link: KakaoLink }>;
}

interface KakaoSDK {
  init(appKey: string): void;
  isInitialized(): boolean;
  Share: {
    sendDefault(settings: KakaoFeedSettings): void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

let loadPromise: Promise<KakaoSDK> | null = null;

function loadKakaoSdk(): Promise<KakaoSDK> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('브라우저에서만 사용할 수 있어요.'));
  }
  if (window.Kakao) {
    return Promise.resolve(window.Kakao);
  }
  if (loadPromise) {
    return loadPromise;
  }
  loadPromise = new Promise<KakaoSDK>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.onload = (): void => {
      if (window.Kakao) {
        resolve(window.Kakao);
      } else {
        reject(new Error('Kakao SDK를 불러오지 못했어요.'));
      }
    };
    script.onerror = (): void => {
      loadPromise = null;
      reject(new Error('Kakao SDK를 불러오지 못했어요.'));
    };
    document.head.appendChild(script);
  });
  return loadPromise;
}

/**
 * Kakao SDK를 로드하고 init까지 마친 인스턴스를 반환한다.
 * JS 키가 없으면 에러를 throw 한다.
 */
export async function getKakao(): Promise<KakaoSDK> {
  const kakao = await loadKakaoSdk();
  const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!appKey) {
    throw new Error('Kakao JS 키가 설정되지 않았어요.');
  }
  if (!kakao.isInitialized()) {
    kakao.init(appKey);
  }
  return kakao;
}
