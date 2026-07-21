// app/layout.tsx
import '@/app.styles/globals.css';

import AppLayoutShell from '@component/layout/AppLayoutShell';
import ScrollToTop from '@component/layout/ScrollToTop';
import {
  DEFAULT_OG_IMAGE_PATH,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  toAbsoluteUrl,
} from '@module/metadata/seo';
import { AppProviders } from '@module/providers';
import { cn } from '@module/utils/cn';
import { NATIVE_APP_INIT_SCRIPT } from '@module/utils/nativeAppScript';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';

import { pretendard } from '@/app.lib/font';

const OG_IMAGE_URL = toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH);

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
        url: OG_IMAGE_URL,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
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
        url: OG_IMAGE_URL,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
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
  // 네이티브 앱 감지는 <head> 의 blocking inline script 가 첫 페인트 전에
  // 확정한다. headers() 를 쓰면 루트 레이아웃이 dynamic 렌더로 강제돼
  // `<Link>` prefetch 가 죽으므로(= "이동마다 로딩") 서버 UA 판정은 쓰지
  // 않는다. 스크립트는 정적 HTML 에 그대로 실려 나가므로 route 는 정적
  // prefetch 가능 상태를 유지하면서도 chrome 가시성은 페인트 시점에 이미
  // 결정돼 있다. 하이드레이션 이후 토글되는 값이 아니라 시프트가 없다.
  return (
    <html lang="ko" data-native-app="false">
      <head>
        <script dangerouslySetInnerHTML={{ __html: NATIVE_APP_INIT_SCRIPT }} />
      </head>
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
        <SpeedInsights />
      </body>
    </html>
  );
}
