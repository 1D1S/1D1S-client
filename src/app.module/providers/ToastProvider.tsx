'use client';

import {
  ToastProvider as DesignSystemToastProvider,
  useToast,
} from '@1d1s/design-system';
import { useEffect } from 'react';

import { registerToast } from './toast';

/**
 * 디자인 시스템 `useToast()` 핸들을 전역 브리지에 등록만 하는 내부 컴포넌트.
 * 렌더 출력은 없다. (`useToast` 는 ToastProvider 하위에서만 동작)
 */
function ToastBridge(): null {
  const api = useToast();

  useEffect(() => registerToast(api), [api]);

  return null;
}

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <DesignSystemToastProvider position="bottom-right">
      {children}
      <ToastBridge />
    </DesignSystemToastProvider>
  );
}
