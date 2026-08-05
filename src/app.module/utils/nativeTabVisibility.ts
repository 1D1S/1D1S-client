'use client';

/**
 * "이 WebView 문서가 지금 사용자에게 보이는 탭인가".
 *
 * 네이티브 쉘은 바텀네비 탭마다 WebView 를 하나씩 살아 있는 채로 유지하고
 * 활성 탭만 화면에 그린다. 그런데 **배경 탭의 문서도 계속
 * `document.visibilityState === 'visible'`** 이다 — Flutter 는 위젯 트리에서
 * 페인트만 건너뛸 뿐 WebView 를 정지시키지 않기 때문이다. 즉 웹은 자기가
 * 보이는지 아닌지를 표준 API 로는 알 수 없고, 그 사실을 아는 유일한 주체인
 * 셸이 알려 줘야 한다.
 *
 * 셸은 탭 전환(과 새 문서 로드)마다 `WebBridge.setAnimationsPaused` 에서
 * `window.__1D1S_TAB_BACKGROUND__` 를 세우고 `native:tab_visibility` 를
 * 디스패치한다. 플래그가 없는 환경(일반 브라우저, 상세 화면 WebView)은
 * 언제나 전경으로 본다 — 기존 동작 그대로다.
 *
 * 이게 필요한 이유는 안드로이드 합성 구조에 있다. WebView 는 텍스처 레이어로
 * 합성되어서, 배경 탭이 프레임을 하나 새로 그릴 때마다 텍스처가 dirty 로
 * 표시되고 그게 곧 Flutter 프레임 요청이 된다. 화면에 바뀐 게 없는데도
 * 프레임 루프가 계속 돈다는 뜻이다. CSS 애니메이션은 셸이 style 주입으로
 * 이미 멈췄고, 여기서 다루는 건 그걸로 못 멈추는 것들이다:
 * setInterval 캐러셀, focus 기반 리페치.
 */

const EVENT = 'native:tab_visibility';

interface NativeVisibilityWindow {
  __1D1S_TAB_BACKGROUND__?: boolean;
}

/** 셸이 "배경 탭"이라고 알려 준 상태인가. 신호가 없으면 false(전경). */
export function isNativeTabBackground(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return (window as Window & NativeVisibilityWindow)
    .__1D1S_TAB_BACKGROUND__ === true;
}

/** 전경/배경이 바뀔 때 호출된다. 반환값은 구독 해제 함수. */
export function subscribeNativeTabVisibility(
  callback: (background: boolean) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const handler = (): void => callback(isNativeTabBackground());
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
