'use client';

import { Text } from '@1d1s/design-system';
import type { MyPageStreak } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import {
  CheckCircle2,
  FileText,
  Flag,
  Flame,
  Target,
  Trophy,
} from 'lucide-react';
import React from 'react';

import { getLongestGoalStreakSummary } from '../utils/mypageUtils';
import { StatCard } from './StatCard';

interface MyPageStatSectionProps {
  streak: MyPageStreak;
}

export function MyPageStatSection({
  streak,
}: MyPageStatSectionProps): React.ReactElement {
  const longestGoalStreak = getLongestGoalStreakSummary(
    streak.longestGoalStreak
  );

  return (
    <section>
      <div>
        <Text size="display2" weight="bold" className="text-gray-900">
          활동 통계
        </Text>
        <Text
          size="caption1"
          weight="regular"
          className="mt-2 block text-gray-500"
        >
          나의 활동 기록과 성장 지표를 한눈에 확인하세요.
        </Text>
      </div>

      <div
        className={cn(
          'mt-5 grid grid-cols-1 gap-3',
          'md:grid-cols-2 xl:grid-cols-4',
        )}
      >
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          title="현재 일지 스트릭"
          value={String(streak.currentStreak)}
          unit="일"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          title="일지 최장 스트릭"
          value={String(streak.maxStreak)}
          unit="일"
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          title="목표 최장 스트릭"
          value={String(longestGoalStreak.streakCount)}
          unit="일"
          iconTone="text-pink-600"
          description={longestGoalStreak.goalTitle}
        />
        <StatCard
          icon={<Flag className="h-5 w-5" />}
          title="참여한 챌린지 수"
          value={String(streak.totalChallengeCount ?? 0)}
          unit="개"
          iconTone="text-blue-600"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="완료한 단기 챌린지 수"
          value={String(streak.completedFiniteChallengeCount ?? 0)}
          unit="개"
          iconTone="text-emerald-600"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          title="작성한 전체 일지 수"
          value={String(streak.totalDiaryCount)}
          unit="개"
          iconTone="text-purple-600"
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          title="완료한 전체 목표 수"
          value={String(streak.totalGoalCount)}
          unit="개"
          iconTone="text-pink-600"
        />
      </div>
    </section>
  );
}
