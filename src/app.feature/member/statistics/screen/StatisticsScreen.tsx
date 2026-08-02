'use client';

import { SubPageShell } from '@component/layout/SubPageShell';
import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { useSignalPageReady } from '@module/hooks/useSignalPageReady';
import { loginUrlFromCurrentLocation } from '@module/utils/returnTo';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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
  // **확정된 게스트**만 튕긴다(MyPageScreen 과 같은 규칙). useIsLoggedIn 은
  // 부팅 세션 확인 중(`unknown`)에도 false 라, 그걸로 리다이렉트하면 로그인
  // 사용자도 매 진입마다 /login 으로 밀린다. 네이티브 앱에서는 그 /login 을
  // 셸이 감지해 토큰 복구 후 이 화면을 다시 로드하고, 로드된 화면이 또
  // `unknown` 구간에서 /login 으로 밀어 무한 왕복 → 로그인 화면이 깜빡이다
  // 빈 화면으로 끝났다(실제 QA 증상: 안드로이드 통계 진입).
  const isGuest = useAuthStatus() === 'guest';
  const [summaryReady, setSummaryReady] = useState(false);
  useSignalPageReady('statistics', summaryReady);

  useEffect(() => {
    if (isGuest) {
      router.replace(loginUrlFromCurrentLocation());
    }
  }, [isGuest, router]);

  if (isGuest) {
    return null;
  }

  return (
    <SubPageShell title="통계" description="나의 활동을 한눈에">
      <div className="data-fade-in space-y-4 pb-10">
        <PeriodSummarySection onReady={setSummaryReady} />
        <FeelingDistributionSection />
        <DiaryTrendSection />
        <FriendComparisonSection />
      </div>
    </SubPageShell>
  );
}
