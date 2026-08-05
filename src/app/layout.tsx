// app/layout.tsx
import '@/app.styles/globals.css';
// Pretendard 는 next/font(localFont) 대신 unicode-range 동적 서브셋 CSS 로
// 로드한다. next/font 는 unicode-range 분할을 지원하지 않아 풀 한글 woff2
// 3장(~2.3MB)을 통째로 받았고, display:swap 이 페이스마다 문서 전체 리플로우를
// 일으켰다. 서브셋은 화면에 실제 등장한 글리프 블록만 받는다.
import '@/app.styles/pretendard-subset.css';

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
  // 결정돼 있다.
  //
  // suppressHydrationWarning: 스크립트가 페인트 전에 data-native-app 을 'true'
  // 로 바꿔 놓는데, 이게 없으면 하이드레이션에서 React 가 서버 렌더값('false')
  // 으로 되돌려 sticky/native-hide chrome 이 한 프레임 보였다 사라진다(탐색
  // 헤더 반짝임). 이 플래그로 스크립트가 세운 값을 하이드레이션이 건드리지
  // 않게 해, 첫 페인트~하이드레이션 내내 숨김 상태가 유지된다(전 페이지 공통).
  return (
    <html lang="ko" data-native-app="false" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NATIVE_APP_INIT_SCRIPT }} />
      </head>
      <body className={cn('font-pretendard bg-white text-gray-900')}>
        <AppProviders>
          <ScrollToTop />
          <AppLayoutShell>{children}</AppLayoutShell>
        </AppProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}
