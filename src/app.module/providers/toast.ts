import type { ToastOptions } from '@1d1s/design-system';
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

function show(options: ToastOptions): number {
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
