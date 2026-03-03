// app/layout.tsx
import '@/app.styles/globals.css';

import AppLayoutShell from '@component/layout/app-layout-shell';
import { AppProviders } from '@module/providers';
import type { Metadata, Viewport } from 'next';

import { pretendard, suite } from '@/app.lib/font';

export const metadata: Metadata = {
  title: '1Day 1Streak',
  description: '1Day 1Streak',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body
        className={`${pretendard.variable} ${suite.variable} font-pretendard bg-white text-gray-900`}
      >
        <AppProviders>
          <AppLayoutShell>{children}</AppLayoutShell>
        </AppProviders>
      </body>
    </html>
  );
}
