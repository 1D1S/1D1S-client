'use client';

import { SubPageShell } from '@component/layout/SubPageShell';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { NOOP_SUBSCRIBE } from '@module/hooks/useHasMounted';
import { loginUrlFromCurrentLocation } from '@module/utils/returnTo';
import { useRouter } from 'next/navigation';
import React, { useEffect, useSyncExternalStore } from 'react';

import { DiaryTrendSection } from '../components/DiaryTrendSection';
import { FeelingDistributionSection } from '../components/FeelingDistributionSection';
import { FriendComparisonSection } from '../components/FriendComparisonSection';
import { PeriodSummarySection } from '../components/PeriodSummarySection';

/**
 * 회원 통계 화면 — 기간 요약 / 감정 분포 / 작성 추이 / 친구 비교.
 * 각 섹션이 독립적으로 로딩·에러·빈 상태를 처리한다.
 */
export default function StatisticsScreen(): React.ReactElement | null {
  const router = useRouter();
  const hasMounted = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false
  );
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    if (hasMounted && !isLoggedIn) {
      router.replace(loginUrlFromCurrentLocation());
    }
  }, [hasMounted, isLoggedIn, router]);

  if (hasMounted && !isLoggedIn) {
    return null;
  }

  return (
    <SubPageShell title="통계" description="나의 활동을 한눈에">
      <div className="data-fade-in space-y-4 pb-10">
        <PeriodSummarySection />
        <FeelingDistributionSection />
        <DiaryTrendSection />
        <FriendComparisonSection />
      </div>
    </SubPageShell>
  );
}
