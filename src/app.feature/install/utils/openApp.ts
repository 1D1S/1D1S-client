import { resolveAppScheme } from '@constants/appLinks';
import {
  APP_STORE_URL,
  buildAndroidIntentUrl,
  isDeepLinkablePath,
} from '@constants/appStore';
import type { MobilePlatform } from '@module/hooks/useMobilePlatform';

/**
 * 앱이 뜨기를 기다리는 시간.
 *
 * 짧으면 앱이 막 올라오는 중에 스토어로 튀고, 길면 미설치 사용자가 아무
 * 반응 없는 화면을 그만큼 본다. iOS 가 스킴을 처리해 앱을 전면으로
 * 올리는 데 보통 0.3~0.8초가 걸려서 그 위에 여유를 얹은 값이다.
 */
export const APP_OPEN_TIMEOUT_MS = 1200;

/**
 * 타이머가 이만큼 늦게 돌았으면 그 사이 페이지가 정지돼 있었다고 본다.
 *
 * 앱이 전면으로 올라오면 Safari 는 백그라운드가 되고 타이머가 throttle
 * 되거나 아예 멈춘다. 돌아왔을 때 뒤늦게 실행된 콜백이 스토어로 보내면
 * "앱에서 나왔더니 App Store 가 떠 있는" 오작동이 된다.
 */
export const SUSPEND_DRIFT_MS = 400;

export interface FallbackDecision {
  /** 그 사이 페이지가 숨겨진 적이 있는가(=앱이 전면으로 올라왔다). */
  wentHidden: boolean;
  /** 지금 페이지가 숨겨져 있는가. */
  hiddenNow: boolean;
  /** 스킴을 던진 뒤 실제로 흐른 시간(ms). */
  elapsedMs: number;
}

/**
 * 스토어로 보내야 하는가 — **타임아웃 폴백의 판단부만** 떼어낸 순수 함수.
 *
 * 셋 중 하나라도 "앱이 열렸다" 를 가리키면 보내지 않는다. 오판의 대가가
 * 비대칭이기 때문이다: 안 보내면 사용자가 버튼을 한 번 더 누르면 되지만,
 * 잘못 보내면 이미 열린 앱을 두고 App Store 가 덮어쓴다.
 */
export function shouldFallbackToStore({
  wentHidden,
  hiddenNow,
  elapsedMs,
}: FallbackDecision): boolean {
  if (wentHidden || hiddenNow) {
    return false;
  }
  return elapsedMs < APP_OPEN_TIMEOUT_MS + SUSPEND_DRIFT_MS;
}

/** 앱에 넘길 경로. 앱이 못 받는 경로면 앱 홈으로 보낸다. */
function resolveTargetUrl(pathname: string): URL {
  const target = new URL(window.location.href);
  if (!isDeepLinkablePath(pathname)) {
    target.pathname = '/';
    target.search = '';
  }
  return target;
}

/**
 * 앱을 열고, 안 열리면 스토어로 보낸다 — 버튼 하나가 두 경우를 다 맡는다.
 *
 * **Android** 는 `intent://` 가 설치 여부를 브라우저에게 물어 준다. 있으면
 * 앱, 없으면 `browser_fallback_url`(Play). 타이머가 필요 없고 오판도 없다.
 *
 * **iOS** 는 설치 여부를 알아낼 API 가 없다. 커스텀 스킴을 던져 보고,
 * 정해진 시간 안에 화면이 그대로면 안 열린 것으로 보고 App Store 로
 * 보낸다. 그 판단은 `shouldFallbackToStore` 가 한다.
 *
 * @returns 정리 함수. 시트가 닫히는 등으로 중간에 그만둘 때 호출한다.
 */
export function openAppOrStore(
  platform: MobilePlatform,
  pathname: string
): () => void {
  if (platform === 'android') {
    window.location.href = buildAndroidIntentUrl(resolveTargetUrl(pathname));
    return () => undefined;
  }

  let wentHidden = false;
  let timer = 0;
  const startedAt = Date.now();

  const onVisibilityChange = (): void => {
    if (document.hidden) {
      wentHidden = true;
    }
  };
  const cleanup = (): void => {
    window.clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', onVisibilityChange);
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  // iOS 가 앱으로 넘어갈 때 visibilitychange 대신 pagehide 만 오는 경우가 있다.
  window.addEventListener('pagehide', onVisibilityChange);

  timer = window.setTimeout(() => {
    cleanup();
    if (
      shouldFallbackToStore({
        wentHidden,
        hiddenNow: document.hidden,
        elapsedMs: Date.now() - startedAt,
      })
    ) {
      window.location.href = APP_STORE_URL;
    }
  }, APP_OPEN_TIMEOUT_MS);

  // 스킴은 경로 없이 던진다. 앱의 커스텀 스킴 intent-filter 는 OAuth 콜백
  // (host=auth) 만 받으므로 경로를 실어도 그 화면으로 가지 않는다 — 앱을
  // 앞으로 불러내는 것까지가 이 스킴의 역할이고, 경로 라우팅은 유니버설
  // 링크(AASA)가 맡는다.
  window.location.href = `${resolveAppScheme(window.location.host)}://`;

  return cleanup;
}
