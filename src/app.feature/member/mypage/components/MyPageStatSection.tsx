import { CountUp } from '@component/CountUp';
import type { MyPageStreak } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import Link from 'next/link';
import React from 'react';

import { getLongestGoalStreakSummary } from '../utils/mypageUtils';
import { MyPageSectionHeader } from './MyPageSectionHeader';
import { MyPageStatTile } from './MyPageStatTile';

interface MyPageStatSectionProps {
  streak: MyPageStreak;
  /**
   * 내 마이페이지 여부. true(기본)면 "나의 활동" 표기 + 더보기(내 통계) 링크.
   * 다른 멤버 프로필에선 false — 중립 라벨 + 더보기 숨김(통계는 내 것만 존재).
   */
  isMe?: boolean;
  /** 다른 멤버 프로필에서 부제에 쓸 닉네임(isMe=false일 때). */
  memberName?: string;
}

/**
 * 활동 통계 — 핵심 KPI 4종 그리드.
 */
export function MyPageStatSection({
  streak,
  isMe = true,
  memberName,
}: MyPageStatSectionProps): React.ReactElement {
  const longestGoalStreak = getLongestGoalStreakSummary(
    streak.longestGoalStreak
  );

  const subtitle = isMe
    ? '나의 활동 기록과 성장 지표'
    : memberName
      ? `${memberName}님의 활동 기록과 성장 지표`
      : '활동 기록과 성장 지표';

  return (
    <section>
      <MyPageSectionHeader
        title="활동 통계"
        subtitle={subtitle}
        // 더보기는 내 통계 페이지(/mypage/statistics)로만 가므로 내
        // 마이페이지에서만 노출한다. 다른 멤버에선 숨긴다.
        action={
          isMe ? (
            <Link
              href="/mypage/statistics"
              className={cn(
                'text-main-700 text-xs font-bold',
                'transition-opacity hover:opacity-80'
              )}
            >
              더보기 →
            </Link>
          ) : undefined
        }
      />
      <div className={cn('mt-4 grid grid-cols-2 gap-2.5', 'sm:grid-cols-4')}>
        <MyPageStatTile
          label="현재 스트릭"
          value={<CountUp value={streak.currentStreak} />}
          iconName="Flame"
          tone="brand"
        />
        <MyPageStatTile
          label="최장 스트릭"
          value={<CountUp value={streak.maxStreak} suffix="일" />}
          iconName="Endless"
          tone="white"
        />
        <MyPageStatTile
          label="작성한 일지"
          value={<CountUp value={streak.totalDiaryCount} />}
          helper={`이번 달 ${streak.currentMonthDiaryCount}개`}
          iconName="BookOpen"
          tone="white"
        />
        <MyPageStatTile
          label="목표 최장 스트릭"
          value={<CountUp value={longestGoalStreak.streakCount} suffix="일" />}
          helper={
            longestGoalStreak.hasRecord
              ? `목표: ${longestGoalStreak.goalTitle}`
              : longestGoalStreak.goalTitle
          }
          iconName="Target"
          tone="mint"
        />
      </div>
    </section>
  );
}
