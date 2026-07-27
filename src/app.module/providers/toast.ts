import type { ToastOptions } from '@1d1s/design-system';
import { showNativeToast } from '@module/utils/nativeBridge';
import type { ReactNode } from 'react';

/**
 * 디자인 시스템 Toast(`useToast`)를 React 밖에서도 부를 수 있게 감싼
 * 전역 브리지.
 *
 * 디자인 시스템은 훅(`useToast`)만 제공하므로, React Query 캐시 onError 나
 * 모듈 레벨 함수처럼 컴포넌트 밖에서 토스트를 띄우려면 핸들을 모듈에
 * 보관해야 한다. `ToastProvider` 가 마운트되면서 `registerToast` 로 핸들을
 * 등록하고, 어디서든 `toast.success(...)` 형태로 호출한다.
 *
 * 기존 Sonner 호출부(`toast.success/error/info(message)`)와 시그니처를
 * 맞춰 두어, 사용처는 import 경로만 교체하면 된다.
 */

interface ToastHandle {
  show(options: ToastOptions): number;
  dismiss(id: number): void;
}

/** 메시지(title) 를 제외한 나머지 옵션 — tone/icon 은 메서드별 기본값을 덮어쓴다. */
type ToastInput = Omit<ToastOptions, 'title'>;

let handle: ToastHandle | null = null;

// Provider 마운트 전에 발생한 토스트(초기 에러 등)를 버리지 않고 모아 둔다.
const pending: ToastOptions[] = [];

/**
 * `ToastProvider` 내부에서 `useToast()` 핸들을 등록한다.
 * 정리 함수를 반환하므로 effect cleanup 에서 호출하면 된다.
 */
export function registerToast(next: ToastHandle): () => void {
  handle = next;

  if (pending.length > 0) {
    pending.splice(0).forEach((options) => next.show(options));
  }

  return () => {
    if (handle === next) {
      handle = null;
    }
  };
}

// 앱(WebView)에서는 네이티브가 그린다 — WebView 안의 토스트는 네이티브
// 헤더/바텀바 아래에 깔리고, 상세처럼 WebView 가 화면 일부만 차지하는
// 화면에서는 위치도 어긋난다. 디자인은 앱이 DS Toast 를 그대로 복제했고
// 위치만 상단 중앙이다.
//
// title/body 가 ReactNode 라 문자열이 아닐 수 있다(아이콘 포함 JSX 등).
// 그 경우 직렬화할 수 없으므로 웹 토스트로 그대로 둔다.
function toPlainText(value: ReactNode): string | undefined {
  if (typeof value === 'string') {return value;}
  if (typeof value === 'number') {return String(value);}
  return undefined;
}

function show(options: ToastOptions): number {
  const title = toPlainText(options.title);
  const body = toPlainText(options.body);
  const canDelegate =
    title !== undefined &&
    (options.body === undefined || body !== undefined) &&
    // 액션 버튼이 달린 토스트는 콜백이 웹에 있으므로 위임하지 않는다.
    options.action === undefined;
  if (
    canDelegate &&
    showNativeToast({
      title,
      body,
      tone: options.tone,
      icon: options.icon,
      duration: options.duration,
    })
  ) {
    // 네이티브가 스스로 닫으므로 dismiss 대상 id 가 없다.
    return -1;
  }
  if (!handle) {
    pending.push(options);
    return -1;
  }
  return handle.show(options);
}

function dismiss(id: number): void {
  handle?.dismiss(id);
}

function withTone(
  tone: ToastOptions['tone'],
  icon: ToastOptions['icon'],
  message: ReactNode,
  options?: ToastInput
): number {
  return show({ tone, icon, title: message, ...options });
}

/** 기본(brand) 톤 토스트. `toast(message)` 형태로 직접 호출한다. */
function toastFn(message: ReactNode, options?: ToastInput): number {
  return withTone('brand', 'Bell', message, options);
}

export const toast = Object.assign(toastFn, {
  show,
  dismiss,
  brand: (message: ReactNode, options?: ToastInput): number =>
    withTone('brand', 'Bell', message, options),
  success: (message: ReactNode, options?: ToastInput): number =>
    withTone('success', 'Check', message, options),
  danger: (message: ReactNode, options?: ToastInput): number =>
    withTone('danger', 'Close', message, options),
  error: (message: ReactNode, options?: ToastInput): number =>
    withTone('danger', 'Close', message, options),
  info: (message: ReactNode, options?: ToastInput): number =>
    withTone('info', 'Bell', message, options),
});
