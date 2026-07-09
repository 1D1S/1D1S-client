// app/layout.tsx
import '@/app.styles/globals.css';

import AppLayoutShell from '@component/layout/AppLayoutShell';
import ScrollToTop from '@component/layout/ScrollToTop';
import { AppProviders } from '@module/providers';
import { cn } from '@module/utils/cn';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
  // 네이티브 앱 감지는 클라이언트 `useIsNativeApp`(AppLayoutShell) 이
  // 단독으로 수행한다: window.__IS_NATIVE_APP__ / JS 채널 / navigator.userAgent
  // (서버와 동일한 `1D1S-App` UA 토큰) 를 읽어 correctness 를 완결한다.
  //
  // 과거엔 SSR 에서 headers() 로 UA 를 읽어 `data-native-app` 을 미리 세팅했지만,
  // headers() 는 Dynamic API 라 루트 레이아웃이 앱 전체 route 를 dynamic 렌더로
  // 강제했다 → `<Link>` 가 데이터까지 prefetch 하지 못하고 이동마다 RSC 를
  // 다시 받아오는 "매번 로딩" 의 근본 원인. 이를 제거해 route 를 정적
  // prefetch 가능 상태로 되돌린다.
  //
  // 트레이드오프: `data-native-app` 초기값이 항상 "false" 라, 네이티브 쉘
  // 사용자는 하드 로드(콜드) 첫 페인트에서 웹 chrome(sticky 헤더 등)을 한
  // 프레임 볼 수 있다. 하이드레이션 직후 AppLayoutShell 의 useEffect 가
  // 속성을 다시 세팅해 즉시 사라진다(SPA 이동에는 영향 없음).
  return (
    <html lang="ko" data-native-app="false">
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
