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

export interface NativeScrollDirPayload {
  dir: 'up' | 'down';
  y: number;
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
  | { type: 'scroll_dir'; payload: NativeScrollDirPayload };

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
