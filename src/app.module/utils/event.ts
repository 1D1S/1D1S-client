import type { KeyboardEvent, KeyboardEventHandler } from 'react';

/**
 * div/section처럼 role="button"으로 클릭 핸들러를 받는 컨테이너의
 * 키보드 활성화 (Enter / Space) 처리를 위한 핸들러 생성기.
 */
export function createActivationKeydownHandler<T extends Element>(
  onActivate: (() => void) | undefined
): KeyboardEventHandler<T> {
  return (event: KeyboardEvent<T>): void => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    onActivate?.();
  };
}
