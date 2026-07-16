// 네이티브 쉘(Flutter WebView)과 웹 간의 단방향/양방향 통신 헬퍼.
// - 웹 → 네이티브: `window.OneDayOneStreakNative.postMessage(json)`
// - 네이티브 → 웹: `window.__NATIVE_NAV__(path)` 호출 → 커스텀 이벤트
//   `native:navigate` 디스패치 → 웹은 router.push 로 흡수.
//
// 채널 이름은 Flutter 측 `kJsChannelName` 과 반드시 일치해야 한다.

const CHANNEL_NAME = 'OneDayOneStreakNative';
const NAVIGATE_EVENT = 'native:navigate';
const MODAL_RESULT_EVENT = 'native:modal_result';
const POPUP_RESULT_EVENT = 'native:popup_result';
const TOKEN_REFRESH_RESULT_EVENT = 'native:token_refresh_result';
const NATIVE_OAUTH_MARKER = '1d1s:native-oauth';

export interface NativeAuthPayload {
  isLoggedIn: boolean;
  hasUnread: boolean;
  streakDays: number;
  profileUrl?: string;
}

export interface NativeNavPayload {
  pathname: string;
}

export interface NativeScrollDirPayload {
  dir: 'up' | 'down';
  y: number;
}

export interface NativeModalButton {
  // 사용자에게 보여줄 라벨.
  label: string;
  // 사용자가 이 버튼을 선택하면 Promise 가 resolve 하는 값. 임의 식별자.
  value: string;
  // iOS/Material 다이얼로그의 강조 스타일. 'cancel' 은 회색조, 'destructive'
  // 는 빨강, 'default' 는 브랜드 강조. Flutter 측 매핑은 별도 합의.
  style?: 'default' | 'cancel' | 'destructive';
}

export interface NativeModalOpenPayload {
  // 같은 모달 요청을 식별. 응답이 돌아오는 modal_result 의 id 와 매칭.
  id: string;
  title: string;
  message?: string;
  // 1~3개 권장. 빈 배열이면 네이티브가 기본 "확인" 1개로 채운다.
  buttons: NativeModalButton[];
}

// 메인 이벤트 팝업 한 장. 서버 ActivePopup 과 같은 모양.
export interface NativePopupSpec {
  popupKey: string;
  imageUrl: string;
  ctaText: string;
  linkUrl: string;
}

export interface NativePopupOpenPayload {
  id: string;
  // 노출 대상 전체를 한 번에 넘긴다. 2장 이상이면 네이티브가 3초 간격으로
  // 순환시킨다 (웹 HomePopup 과 같은 규칙).
  popups: NativePopupSpec[];
}

// 사용자가 팝업에서 무엇을 했는지. dismiss(밖 클릭/시스템 백) 는 'close'.
export type NativePopupAction = 'cta' | 'dismissForever' | 'close';

export interface NativePopupOutcome {
  action: NativePopupAction;
  // 액션 시점에 보이던 팝업. 캐러셀이 돌므로 첫 장과 다를 수 있다.
  popupKey: string;
}

export type NativeMessage =
  | { type: 'auth_state'; payload: NativeAuthPayload }
  | { type: 'nav_state'; payload: NativeNavPayload }
  // 앱 부팅 1회. 웹이 첫 페인트 + 4탭 prefetch 워밍업까지 끝낸 시점.
  // 네이티브 쉘은 이 신호를 받기 전까진 스플래시를 유지해, 사용자에게
  // 빈 컨테이너나 절반만 로드된 UI 가 노출되지 않게 한다.
  | { type: 'app_ready' }
  // 스크롤 방향이 바뀔 때만 1회. 네이티브 쉘이 sliver-style AppBar 를
  // collapse/expand 하는 용도. 매 프레임 보내는 대신 방향 전환에만 발화해
  // JS 채널 트래픽을 최소화한다.
  | { type: 'scroll_dir'; payload: NativeScrollDirPayload }
  | { type: 'oauth_open'; payload: { url: string } }
  | { type: 'token_refresh'; payload: { id: string } }
  | { type: 'logout' }
  // 네이티브 다이얼로그 노출 요청. 응답은 native:modal_result CustomEvent
  // 로 비동기 도착. openNativeModal() 헬퍼가 id 매칭으로 Promise 화 한다.
  | { type: 'modal_open'; payload: NativeModalOpenPayload }
  // 네이티브 이벤트 팝업 노출 요청. 응답은 native:popup_result CustomEvent.
  | { type: 'popup_open'; payload: NativePopupOpenPayload }
  // 네이티브 이미지 뷰어(라이트박스). 결과 회신 없음 — fire-and-forget.
  | { type: 'image_viewer_open'; payload: { urls: string[]; index: number } };

interface NativeChannel {
  postMessage(payload: string): void;
}

interface NativeWindow extends Window {
  [CHANNEL_NAME]?: NativeChannel;
  __IS_NATIVE_APP__?: boolean;
  __NATIVE_NAV__?(path: string): void;
}

function getNativeWindow(): NativeWindow | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window as NativeWindow;
}

export function postNativeMessage(message: NativeMessage): void {
  const win = getNativeWindow();
  if (!win) {
    return;
  }
  const channel = win[CHANNEL_NAME];
  if (!channel) {
    return;
  }
  try {
    channel.postMessage(JSON.stringify(message));
  } catch {
    // 네이티브 쉘이 응답하지 못하더라도 웹 흐름을 멈추지 않는다.
  }
}

export function isNativeBridgeAvailable(): boolean {
  return getNativeWindow()?.[CHANNEL_NAME] != null;
}

export function markNativeOAuth(codeChallenge: string): void {
  window.sessionStorage.setItem(NATIVE_OAUTH_MARKER, codeChallenge);
}

export function consumeNativeOAuth(): string | null {
  const codeChallenge = window.sessionStorage.getItem(NATIVE_OAUTH_MARKER);
  if (codeChallenge) {
    window.sessionStorage.removeItem(NATIVE_OAUTH_MARKER);
  }
  return codeChallenge;
}

export function peekNativeOAuth(): string | null {
  return window.sessionStorage.getItem(NATIVE_OAUTH_MARKER);
}

interface PendingTokenRefresh {
  resolve(): void;
  reject(): void;
  timeout: number;
}

const pendingTokenRefreshes = new Map<string, PendingTokenRefresh>();
let tokenRefreshListenerAttached = false;

function ensureTokenRefreshListener(): void {
  if (tokenRefreshListenerAttached) {
    return;
  }
  const win = getNativeWindow();
  if (!win) {
    return;
  }
  win.addEventListener(TOKEN_REFRESH_RESULT_EVENT, (event: Event) => {
    const detail = (event as CustomEvent<{ id?: string; ok?: boolean }>).detail;
    if (!detail?.id) {
      return;
    }
    const pending = pendingTokenRefreshes.get(detail.id);
    if (!pending) {
      return;
    }
    pendingTokenRefreshes.delete(detail.id);
    window.clearTimeout(pending.timeout);
    if (detail.ok) {
      pending.resolve();
    } else {
      pending.reject();
    }
  });
  tokenRefreshListenerAttached = true;
}

export function requestNativeTokenRefresh(): Promise<void> | null {
  const channel = getNativeWindow()?.[CHANNEL_NAME];
  if (!channel) {
    return null;
  }
  ensureTokenRefreshListener();
  const id = `refresh_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pendingTokenRefreshes.delete(id);
      reject();
    }, 15_000);
    pendingTokenRefreshes.set(id, { resolve, reject, timeout });
    try {
      channel.postMessage(
        JSON.stringify({ type: 'token_refresh', payload: { id } })
      );
    } catch {
      window.clearTimeout(timeout);
      pendingTokenRefreshes.delete(id);
      reject();
    }
  });
}

export function onNativeNavigateRequest(
  handler: (path: string) => void
): () => void {
  const win = getNativeWindow();
  if (!win) {
    return () => {};
  }
  const listener = (event: Event): void => {
    const detail = (event as CustomEvent<{ to?: string }>).detail;
    if (!detail?.to) {
      return;
    }
    // preventDefault 는 "내가 처리한다" 시그널. Flutter 측 __NATIVE_NAV__
    // 가 dispatchEvent 반환값을 보고 fallback (location.assign 풀 리로드)
    // 을 건너뛴다. 이 호출이 빠지면 React Query 캐시가 매번 휘발되어
    // 사용자가 탭 전환마다 로딩을 다시 보게 된다.
    event.preventDefault();
    handler(detail.to);
  };
  win.addEventListener(NAVIGATE_EVENT, listener);
  return () => win.removeEventListener(NAVIGATE_EVENT, listener);
}

// 모달 응답 대기 큐. id → resolver. Flutter 가 사용자 선택 후 dispatchEvent
// 로 결과를 보내면 그 id 에 대응되는 resolver 를 깨우고 큐에서 삭제한다.
// Flutter 가 dialog 자체를 dismiss(밖 클릭, 백 버튼) 했을 때를 위해 value
// 는 nullable — 그 경우 호출자는 cancel 로 해석한다.
const pendingNativeModals = new Map<string, (value: string | null) => void>();
let modalResultListenerAttached = false;

function ensureModalResultListener(): void {
  if (modalResultListenerAttached) {
    return;
  }
  const win = getNativeWindow();
  if (!win) {
    return;
  }
  const listener = (event: Event): void => {
    const detail = (
      event as CustomEvent<{ id?: string; value?: string | null }>
    ).detail;
    if (!detail?.id) {
      return;
    }
    const resolver = pendingNativeModals.get(detail.id);
    if (resolver) {
      pendingNativeModals.delete(detail.id);
      resolver(detail.value ?? null);
    }
  };
  win.addEventListener(MODAL_RESULT_EVENT, listener);
  modalResultListenerAttached = true;
}

function generateModalId(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 네이티브 쉘에 다이얼로그 노출을 요청한다. 사용자가 버튼을 선택하면 그
 * `value` 가, 다이얼로그를 dismiss(밖 클릭, 시스템 백) 하면 `null` 이
 * resolve 된다. 네이티브 쉘이 아닌 일반 브라우저에서는 즉시 `null` 을
 * resolve 해, 호출자는 자체 fallback 다이얼로그를 띄우면 된다.
 */
// 메인 이벤트 팝업을 네이티브 쉘에 위임한다. 웹 다이얼로그는 WebView 안에
// 갇혀 네이티브 헤더/바텀바를 덮지 못하므로, 앱에서는 네이티브가 그린다.
//
// 네이티브 쉘이 아니거나(브라우저) 쉘이 이 메시지를 모르는 구버전이면
// null 을 resolve 한다 → 호출자는 웹 팝업을 그대로 띄우면 된다.
const pendingNativePopups = new Map<
  string,
  (value: NativePopupOutcome | null) => void
>();
let popupResultListenerAttached = false;

function ensurePopupResultListener(): void {
  if (popupResultListenerAttached) {
    return;
  }
  const win = getNativeWindow();
  if (!win) {
    return;
  }
  win.addEventListener(POPUP_RESULT_EVENT, (event: Event) => {
    const detail = (
      event as CustomEvent<{
        id?: string;
        action?: NativePopupAction | null;
        popupKey?: string | null;
      }>
    ).detail;
    if (!detail?.id) {
      return;
    }
    const resolver = pendingNativePopups.get(detail.id);
    if (!resolver) {
      return;
    }
    pendingNativePopups.delete(detail.id);
    // action 이 없으면 dismiss — 그냥 닫기로 읽는다.
    resolver(
      detail.action && detail.popupKey
        ? { action: detail.action, popupKey: detail.popupKey }
        : { action: 'close', popupKey: '' }
    );
  });
  popupResultListenerAttached = true;
}

/**
 * 이미지 뷰어(라이트박스)를 네이티브 쉘에 위임한다. 웹 오버레이는 WebView
 * 안에 갇혀 네이티브 헤더를 덮지 못한다. 채널이 없으면(브라우저) false 를
 * 반환하고, 호출자는 자체 웹 오버레이를 연다.
 */
export function openNativeImageViewer(urls: string[], index: number): boolean {
  if (!getNativeWindow()?.[CHANNEL_NAME]) {
    return false;
  }
  postNativeMessage({ type: 'image_viewer_open', payload: { urls, index } });
  return true;
}

// 타임아웃은 두지 않는다. 결과는 사용자가 버튼을 누를 때 오므로 몇 초 안에
// 온다는 보장이 없고, 성급히 null 로 떨어뜨리면 네이티브 팝업이 떠 있는 채로
// 웹 팝업까지 겹쳐 뜬다. popup_open 을 모르는 구버전 쉘에서는 이벤트 팝업이
// 뜨지 않는데(기능 손실이지 오동작은 아니다), 웹과 앱을 같이 배포하면 된다.
// openNativeModal 도 같은 약속이다.
export function openNativePopup(
  popups: NativePopupSpec[]
): Promise<NativePopupOutcome | null> {
  const win = getNativeWindow();
  if (!win?.[CHANNEL_NAME]) {
    return Promise.resolve(null);
  }
  ensurePopupResultListener();
  const id = generateModalId();
  return new Promise<NativePopupOutcome | null>((resolve) => {
    pendingNativePopups.set(id, resolve);
    postNativeMessage({ type: 'popup_open', payload: { id, popups } });
  });
}

export function openNativeModal(
  options: Omit<NativeModalOpenPayload, 'id'>
): Promise<string | null> {
  const win = getNativeWindow();
  if (!win) {
    return Promise.resolve(null);
  }
  if (!win[CHANNEL_NAME]) {
    return Promise.resolve(null);
  }
  ensureModalResultListener();
  const id = generateModalId();
  return new Promise<string | null>((resolve) => {
    pendingNativeModals.set(id, resolve);
    postNativeMessage({
      type: 'modal_open',
      payload: { id, ...options },
    });
  });
}
