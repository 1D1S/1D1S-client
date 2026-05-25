// 네이티브 쉘(Flutter WebView)과 웹 간의 단방향/양방향 통신 헬퍼.
// - 웹 → 네이티브: `window.OneDayOneStreakNative.postMessage(json)`
// - 네이티브 → 웹: `window.__NATIVE_NAV__(path)` 호출 → 커스텀 이벤트
//   `native:navigate` 디스패치 → 웹은 router.push 로 흡수.
//
// 채널 이름은 Flutter 측 `kJsChannelName` 과 반드시 일치해야 한다.

const CHANNEL_NAME = 'OneDayOneStreakNative';
const NAVIGATE_EVENT = 'native:navigate';

export interface NativeAuthPayload {
  isLoggedIn: boolean;
  hasUnread: boolean;
  streakDays: number;
  profileUrl?: string;
}

export interface NativeNavPayload {
  pathname: string;
}

export type NativeMessage =
  | { type: 'auth_state'; payload: NativeAuthPayload }
  | { type: 'nav_state'; payload: NativeNavPayload };

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

export function isNativeShellRuntime(): boolean {
  const win = getNativeWindow();
  if (!win) {
    return false;
  }
  return Boolean(win.__IS_NATIVE_APP__ || win[CHANNEL_NAME]);
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

export function onNativeNavigateRequest(
  handler: (path: string) => void
): () => void {
  const win = getNativeWindow();
  if (!win) {
    return () => {};
  }
  const listener = (event: Event): void => {
    const detail = (event as CustomEvent<{ to?: string }>).detail;
    if (detail?.to) {
      handler(detail.to);
    }
  };
  win.addEventListener(NAVIGATE_EVENT, listener);
  return () => win.removeEventListener(NAVIGATE_EVENT, listener);
}
