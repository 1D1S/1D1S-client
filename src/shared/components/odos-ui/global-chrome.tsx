'use client';

import { usePathname } from 'next/navigation';

import { OdosProfileCard } from './profile-card';
import { BackButton } from './back-button';
import { OdosMenu } from './menu';

export default function GlobalChrome(): React.ReactElement | null {
  const pathname = usePathname();

  const noChromeRoutes = ['/diary/create', '/challenge/create'];
  const backOnlyRoutes = ['/auth/login'];
  const noProfileRoutes = ['/mypage']; // 프로필 카드가 숨겨질 경로들

  const isBackOnly = backOnlyRoutes.some((prefix) => pathname.startsWith(prefix));
  const isNoChrome = noChromeRoutes.some((prefix) => pathname.startsWith(prefix));
  const isNoProfile = noProfileRoutes.some((prefix) => pathname.startsWith(prefix));

  if (isNoChrome) {
    return null;
  }

  if (isBackOnly) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <BackButton />
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 left-4 z-50 h-full w-60">
        <OdosMenu />
      </div>
      {!isNoProfile && (
        <div className="fixed top-4 right-4 z-50 h-full">
          <OdosProfileCard />
        </div>
      )}
    </>
  );
}
