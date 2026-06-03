'use client';

import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { useUnreadCount } from '@feature/notification/hooks/useNotificationQueries';
import { authStorage } from '@module/utils/auth';
import { useEffect, useMemo, useReducer, useSyncExternalStore } from 'react';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const ENDLESS_MIN_YEAR = 2090;
const NOOP_SUBSCRIBE = (): (() => void) => () => {};

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

  // 콜드 PWA(사파리 홈화면 앱) 런치에서 cookie/localStorage 복원이 한 박자
  // 늦으면 첫 렌더의 authStorage.hasTokens() 가 false 로 굳어 useSidebar 쿼리가
  // 비활성 상태로 멈춘다 → 로그인 사용자가 게스트로 보이고, 앱을 재실행하면
  // 정상화된다. mount 직후 짧게(최대 ~0.9s) 재확인해 토큰이 보이면 re-render 를
  // 유발, 아래 useSidebar 의 enabled(=hasTokens()) 를 다시 평가시킨다.
  // (데이터 페칭은 그대로 TanStack Query 가 담당한다.)
  const [, revalidateAuth] = useReducer((count: number) => count + 1, 0);
  useEffect(() => {
    if (authStorage.hasTokens()) {
      return;
    }
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const recheck = (): void => {
      attempts += 1;
      if (authStorage.hasTokens()) {
        revalidateAuth();
        return;
      }
      if (attempts < 6) {
        timer = setTimeout(recheck, 150);
      }
    };
    timer = setTimeout(recheck, 150);
    return () => clearTimeout(timer);
  }, []);

  const hasTokenHint = hasMounted && authStorage.hasTokens();

  const {
    data: sidebarData,
    isLoading: isSidebarLoading,
    isFetching: isSidebarFetching,
  } = useSidebar();

  const isLoggedIn =
    hasMounted &&
    hasTokenHint &&
    (Boolean(sidebarData) || isSidebarLoading || isSidebarFetching);

  // SSR/하이드레이션 직후에는 클라이언트에서만 읽히는 토큰 힌트(localStorage,
  // 쿠키)를 알 수 없어 무조건 게스트로 렌더된다. 그대로 노출하면 로그인 상태
  // 사용자가 새로고침할 때 매번 게스트→로그인으로 깜빡인다. 인증 확정 전
  // (`hasMounted` 이전 + 토큰 힌트는 있으나 사이드바 쿼리가 아직 pending)
  // 까지는 사용자 정보 영역을 스켈레톤으로 가린다.
  const isAuthLoading = !hasMounted || (hasTokenHint && isSidebarLoading);

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
