'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const END_DELAY_MS = 200;
const SAFETY_TIMEOUT_MS = 10_000;

export default function RouteProgressBar(): React.ReactElement | null {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // history API 를 가로채 네비게이션 시작 시점에 진행바를 띄운다.
  // Next.js App Router 의 router.push/replace 와 Link 클릭은 모두
  // 내부적으로 pushState/replaceState 를 호출한다.
  useEffect(() => {
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    // Next.js 16 router 가 useInsertionEffect 내부에서 pushState 를 호출하므로
    // 같은 프레임에 setState 를 호출하면 "useInsertionEffect must not schedule
    // updates" 경고가 발생한다. microtask 로 미뤄 insertion 단계 밖에서 실행한다.
    const startNavigation = (): void => {
      queueMicrotask(() => setVisible(true));
    };

    window.history.pushState = function patchedPushState(...args) {
      startNavigation();
      return originalPush.apply(this, args);
    };
    window.history.replaceState = function patchedReplaceState(...args) {
      startNavigation();
      return originalReplace.apply(this, args);
    };

    window.addEventListener('popstate', startNavigation);

    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
      window.removeEventListener('popstate', startNavigation);
    };
  }, []);

  // pathname 변화는 새 페이지 커밋 시점에 발생하므로 진행바 종료 신호로 사용.
  // 같은 경로로 재네비게이션 등 pathname 이 안 바뀌는 경우를 대비해
  // 안전장치 타임아웃을 별도로 둔다.
  useEffect(() => {
    if (!visible) {
      return;
    }
    const endTimer = setTimeout(() => setVisible(false), END_DELAY_MS);
    return () => clearTimeout(endTimer);
  }, [pathname, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const safetyTimer = setTimeout(() => setVisible(false), SAFETY_TIMEOUT_MS);
    return () => clearTimeout(safetyTimer);
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="페이지를 불러오는 중"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    >
      <div className="bg-brand h-full w-full animate-pulse" />
    </div>
  );
}
