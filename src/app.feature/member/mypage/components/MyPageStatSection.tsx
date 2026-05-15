import type { MyPageStreak } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import React from 'react';

import { getLongestGoalStreakSummary } from '../utils/mypageUtils';
import { MyPageSectionHeader } from './MyPageSectionHeader';
import { MyPageStatTile } from './MyPageStatTile';

interface MyPageStatSectionProps {
  streak: MyPageStreak;
}

/**
 * 활동 통계 — 핵심 KPI 4종 그리드.
 */
export function MyPageStatSection({
  streak,
}: MyPageStatSectionProps): React.ReactElement {
  const longestGoalStreak = getLongestGoalStreakSummary(
    streak.longestGoalStreak
  );

  return (
    <section>
      <MyPageSectionHeader
        title="활동 통계"
        subtitle="나의 활동 기록과 성장 지표"
      />
      <div
        className={cn(
          'mt-4 grid grid-cols-2 gap-2.5',
          'sm:grid-cols-4',
        )}
      >
        <MyPageStatTile
          label="현재 스트릭"
          value={`🔥 ${streak.currentStreak}`}
          tone="brand"
        />
        <MyPageStatTile
          label="최장 스트릭"
          value={`${streak.maxStreak}일`}
          tone="white"
        />
        <MyPageStatTile
          label="작성한 일지"
          value={streak.totalDiaryCount}
          helper={`이번 달 ${streak.currentMonthDiaryCount}개`}
          tone="white"
        />
        <MyPageStatTile
          label="목표 최장 스트릭"
          value={`${longestGoalStreak.streakCount}일`}
          helper={longestGoalStreak.goalTitle}
          tone="mint"
        />
      </div>
    </section>
  );
}
