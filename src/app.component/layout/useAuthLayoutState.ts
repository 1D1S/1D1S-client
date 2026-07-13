'use client';

import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { useUnreadCount } from '@feature/notification/hooks/useNotificationQueries';
import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { NOOP_SUBSCRIBE } from '@module/hooks/useHasMounted';
import { useMemo, useSyncExternalStore } from 'react';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const ENDLESS_MIN_YEAR = 2090;

interface RailChallengeInput {
  challengeId: number;
  title: string;
  startDate: string;
  endDate: string;
  hasDeadline?: boolean;
  periodType?: string;
}

interface RailChallenge {
  id: string;
  title: string;
  progress: number;
  hasDeadline: boolean;
}

function isLikelyLegacyEndless(challenge: RailChallengeInput): boolean {
  if (!challenge.title?.includes('무기한')) {
    return false;
  }
  const start = new Date(challenge.startDate ?? '').getTime();
  const end = new Date(challenge.endDate ?? '').getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return false;
  }
  const durationDays = Math.ceil((end - start) / MS_PER_DAY);
  return durationDays === 7;
}

function resolveHasDeadline(challenge: RailChallengeInput): boolean {
  if (typeof challenge.hasDeadline === 'boolean') {
    return challenge.hasDeadline;
  }
  if (challenge.periodType === 'ENDLESS') {
    return false;
  }
  if (isLikelyLegacyEndless(challenge)) {
    return false;
  }
  const endDate = challenge.endDate?.trim();
  if (!endDate) {
    return false;
  }
  const parsedEnd = new Date(endDate);
  if (Number.isNaN(parsedEnd.getTime())) {
    return false;
  }
  return parsedEnd.getUTCFullYear() < ENDLESS_MIN_YEAR;
}

function calculateProgress(
  startDate: string,
  endDate: string,
  now: number
): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start || now <= 0) {
    return 0;
  }
  const total = Math.max(1, Math.ceil((end - start) / MS_PER_DAY));
  const elapsed = Math.max(0, Math.ceil((now - start) / MS_PER_DAY));
  return Math.min(100, Math.round((elapsed / total) * 100));
}

let mountTimestamp = 0;
function getMountTimestamp(): number {
  if (mountTimestamp === 0) {
    mountTimestamp = Date.now();
  }
  return mountTimestamp;
}

export interface AuthLayoutState {
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  hasUnread: boolean;
  sidebarData: ReturnType<typeof useSidebar>['data'];
  railChallenges: RailChallenge[];
}

/**
 * AppLayoutShell 의 인증/사이드바 상태 집계를 모은다.
 * - `useSidebar`, `useUnreadCount` 를 한 곳에서 호출해 일관된 파생값을 만든다.
 * - SSR/하이드레이션 직후 토큰 힌트와 sidebar 쿼리 상태를 조합해
 *   `isLoggedIn` / `isAuthLoading` 을 안정적으로 도출한다.
 * - railChallenges 계산은 sidebarData 가 바뀔 때만 재실행된다.
 *
 * shell 컴포넌트가 데이터 페칭/도메인 로직을 직접 들고 있으면 어떤
 * 단순한 변경(예: 새 라우트 추가)도 무거워지므로 책임을 분리한다.
 */
export function useAuthLayoutState(): AuthLayoutState {
  const hasMounted = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false
  );
  const now = useSyncExternalStore(NOOP_SUBSCRIBE, getMountTimestamp, () => 0);

  // 권위 있는 로그인 상태를 구독한다. 부팅 세션 확인(runAuthBootProbe)·로그인·
  // 로그아웃·재발급 성공이 즉시 재렌더에 반영된다. 예전엔 JS 힌트(hasTokens)로
  // 게이팅해, 힌트가 소실된 Safari standalone PWA 콜드 스타트에서 로그인 사용자가
  // 게스트로 굳었다. 이제 httpOnly 세션으로 서버가 확인한 상태를 그대로 쓴다.
  const status = useAuthStatus();

  const {
    data: sidebarData,
    isLoading: isSidebarLoading,
  } = useSidebar();

  const isLoggedIn = hasMounted && status === 'authenticated';

  // 확정 전(`unknown`)에는 로그아웃 UI 를 그리지 않고 스켈레톤으로 가린다.
  // 로그인 확정 후에도 사이드바(프로필)가 도착하기 전까지는 로딩으로 둬,
  // 아바타·닉네임이 기본값에서 실제 값으로 번쩍이는 것을 막는다.
  const isAuthLoading =
    !hasMounted ||
    status === 'unknown' ||
    (status === 'authenticated' && isSidebarLoading);

  const { data: unreadData } = useUnreadCount({ enabled: isLoggedIn });
  const hasUnread = isLoggedIn && (unreadData?.unreadCount ?? 0) > 0;

  const railChallenges = useMemo<RailChallenge[]>(() => {
    if (!sidebarData) {
      return [];
    }
    return sidebarData.challengeList.map((ch) => {
      const hasDeadline = resolveHasDeadline(ch);
      return {
        id: String(ch.challengeId),
        title: ch.title,
        progress: hasDeadline
          ? calculateProgress(ch.startDate, ch.endDate, now)
          : 0,
        hasDeadline,
      };
    });
  }, [sidebarData, now]);

  return {
    isLoggedIn,
    isAuthLoading,
    hasUnread,
    sidebarData,
    railChallenges,
  };
}
