// 앱→웹 `native:auth_ready` 계약(앱 빌드 134).
//
// 앱은 resume 후 웹 세션 쿠키 재주입이 "완료된 직후" 살아있는 탭 웹뷰 전부에
// `native:auth_ready`(payload 없음)를 디스패치하고, 늦게 붙은 리스너를 위해
// 멱등 플래그 `window.__1D1S_AUTH_READY__ = true` 를 세운다.
//
// 웹은 인증 라우트에서 쿠키 부재를 보자마자 /login 으로 튕기지 않고, 이 신호
// (또는 이미 세워진 플래그)나 짧은 유예까지 기다린 뒤 인증을 확정한다.

const NATIVE_AUTH_READY_EVENT = 'native:auth_ready';

interface AuthReadyWindow {
  __1D1S_AUTH_READY__?: boolean;
}

/** 앱이 세션 재주입 완료를 이미 알렸는지(멱등 플래그). */
export function isNativeAuthReady(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return (window as Window & AuthReadyWindow).__1D1S_AUTH_READY__ === true;
}

/** `native:auth_ready` 구독. 반환값은 해제 함수. */
export function onNativeAuthReady(handler: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  window.addEventListener(NATIVE_AUTH_READY_EVENT, handler);
  return () => window.removeEventListener(NATIVE_AUTH_READY_EVENT, handler);
}

/**
 * 세션 재주입 완료(`native:auth_ready` 또는 이미 세워진 플래그)를 최대
 * `timeoutMs` 까지 기다린다. 이미 준비됐으면 즉시 resolve, 아니면 이벤트나
 * 타임아웃 중 먼저 오는 것에서 resolve 한다(둘 다 성공적 진행).
 */
export function waitForNativeAuthReady(timeoutMs: number): Promise<void> {
  if (typeof window === 'undefined' || isNativeAuthReady()) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let done = false;
    // 이벤트/타임아웃 중 먼저 온 것에서 1회만 진행한다. 늦게 온 쪽은 done
    // 가드로 no-op — 타임아웃 핸들을 따로 clear 하지 않아도 안전하다.
    const finish = (): void => {
      if (done) {
        return;
      }
      done = true;
      window.removeEventListener(NATIVE_AUTH_READY_EVENT, finish);
      resolve();
    };
    window.addEventListener(NATIVE_AUTH_READY_EVENT, finish);
    setTimeout(finish, timeoutMs);
  });
}
