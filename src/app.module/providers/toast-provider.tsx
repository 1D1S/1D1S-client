'use client';

import { Toaster } from 'sonner';

export function ToastProvider(): React.ReactElement {
  return <Toaster richColors closeButton position="bottom-right" />;
}
