// app/layout.tsx
import '@/app.styles/globals.css';

import AppLayoutShell from '@component/layout/app-layout-shell';
import { AppProviders } from '@module/providers';
import type { Metadata, Viewport } from 'next';

import { pretendard, suite } from '@/app.lib/font';

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body
        className={`${pretendard.variable} ${suite.variable} font-suite bg-white text-gray-900`}
      >
        <AppProviders>
          <AppLayoutShell>{children}</AppLayoutShell>
        </AppProviders>
      </body>
    </html>
  );
}
