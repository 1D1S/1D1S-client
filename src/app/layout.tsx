// app/layout.tsx
import '@/app.styles/globals.css';

import AppLayoutShell from '@component/layout/AppLayoutShell';
import ScrollToTop from '@component/layout/ScrollToTop';
import { AppProviders } from '@module/providers';
import { cn } from '@module/utils/cn';
import type { Metadata, Viewport } from 'next';

import { pretendard } from '@/app.lib/font';

function resolveSiteUrl(): URL {
  const rawUrl =
    process.env.NEXT_PUBLIC_WEB_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000';

  try {
    return new URL(rawUrl);
  } catch {
    return new URL('http://localhost:3000');
  }
}

const SITE_URL = resolveSiteUrl();
const SITE_TITLE = '1Day 1Streak';
const SITE_DESCRIPTION = '매일 하나의 챌린지로 꾸준함을 기록하는 1Day 1Streak';
const OG_IMAGE_PATH = '/images/open-graph.png';

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_TITLE,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '1D1S',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FF7043',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="ko">
      <body
        className={cn(
          pretendard.variable,
          'font-pretendard bg-white text-gray-900'
        )}
      >
        <AppProviders>
          <ScrollToTop />
          <AppLayoutShell>{children}</AppLayoutShell>
        </AppProviders>
      </body>
    </html>
  );
}
