'use client';

import { Toaster } from 'sonner';

export function ToastProvider(): React.ReactElement {
  return (
    <Toaster
      richColors
      closeButton
      position="bottom-right"
      offset={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      mobileOffset={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
    />
  );
}
