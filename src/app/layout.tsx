// app/layout.tsx
import '@/app.styles/globals.css';

import AppLayoutShell from '@component/layout/AppLayoutShell';
import ScrollToTop from '@component/layout/ScrollToTop';
import { AppProviders } from '@module/providers';
import { cn } from '@module/utils/cn';
import { isNativeAppUserAgent } from '@module/utils/nativeApp';
import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const headerList = await headers();
  const isNativeApp = isNativeAppUserAgent(headerList.get('user-agent'));

  return (
    // `data-native-app` 은 SSR UA 매칭 결과를 그대로 노출한다.
    // globals.css 의 `[data-native-app="true"] .sticky.top-0.lg\:hidden` 규칙이
    // 페이지별 모바일 sticky 헤더(HomeMobileHeader 등 19개) 를 일괄 숨긴다.
    // SSR 가 false 로 내려와도 AppLayoutShell 의 useEffect 가 클라이언트
    // 감지(useIsNativeApp) 결과로 같은 속성을 다시 세팅해 fail-safe 가 된다.
    <html lang="ko" data-native-app={isNativeApp ? 'true' : 'false'}>
      <body
        className={cn(
          pretendard.variable,
          'font-pretendard bg-white text-gray-900'
        )}
      >
        <AppProviders>
          <ScrollToTop />
          <AppLayoutShell isNativeApp={isNativeApp}>{children}</AppLayoutShell>
        </AppProviders>
      </body>
    </html>
  );
}
