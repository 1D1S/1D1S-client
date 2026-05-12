import { CheckList, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

import type { ChallengeGoal } from '../../../challenge/board/type/challenge';

interface DiaryCreateGoalsSectionProps {
  goals: ChallengeGoal[];
  achievedGoalIds: number[];
  onGoalIdsChange(goalIds: number[]): void;
}

export function DiaryCreateGoalsSection({
  goals,
  achievedGoalIds,
  onGoalIdsChange,
}: DiaryCreateGoalsSectionProps): React.ReactElement {
  const options = goals.map((goal) => ({
    id: String(goal.challengeGoalId),
    label: goal.content,
  }));

  const selectedValues = achievedGoalIds.map((goalId) => String(goalId));
  const totalGoalCount = goals.length;
  const achievedGoalCount = achievedGoalIds.length;
  const percent =
    totalGoalCount > 0
      ? Math.round((achievedGoalCount / totalGoalCount) * 100)
      : 0;
  const isHundredPercent = percent === 100 && totalGoalCount > 0;

  const handleValueChange = (nextValues: string[]): void => {
    onGoalIdsChange(nextValues.map((value) => Number(value)));
  };

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <Text size="caption1" weight="bold" className="text-gray-600">
            오늘의 목표
          </Text>
          <Text size="caption2" weight="regular" className="text-gray-400">
            · 달성한 항목을 체크하세요
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Text
            size="caption2"
            weight="medium"
            className="text-gray-500 tabular-nums"
          >
            {achievedGoalCount}/{totalGoalCount}
          </Text>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1',
              'text-xs font-bold text-white tabular-nums transition-colors',
              isHundredPercent ? 'bg-green-500' : 'bg-main-800'
            )}
          >
            {percent}%
          </span>
        </div>
      </div>

      {totalGoalCount > 0 ? (
        <>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                isHundredPercent ? 'bg-green-500' : 'bg-main-800'
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <CheckList
            options={options}
            value={selectedValues}
            onValueChange={handleValueChange}
          />
        </>
      ) : (
        <div className="rounded-3 border border-gray-200 bg-white px-4 py-5">
          <Text size="body2" weight="regular" className="text-gray-500">
            연동된 챌린지를 선택하면 목표 리스트가 표시됩니다.
          </Text>
        </div>
      )}
    </section>
  );
}
