import { ProgressBar, Text } from '@1d1s/design-system';
import { ResponsiveCheckList } from '@component/ResponsiveCheckList';
import { cn } from '@module/utils/cn';
import React from 'react';

import type { ChallengeGoal } from '../../../challenge/board/type/challenge';

interface DiaryCreateGoalsSectionProps {
  goals: ChallengeGoal[];
  achievedGoalIds: number[];
  onGoalIdsChange(goalIds: number[]): void;
}

function DiaryCreateGoalsSectionComponent({
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
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <Text size="caption1" weight="bold" className="text-gray-600">
          오늘의 목표
          <Text
            as="span"
            size="caption2"
            weight="regular"
            className="ml-1 text-gray-400"
          >
            · 달성한 항목을 체크하세요
          </Text>
        </Text>
        {totalGoalCount > 0 ? (
          <div className="flex shrink-0 items-center gap-2">
            <Text size="caption2" weight="semibold" className="text-gray-500">
              {achievedGoalCount}/{totalGoalCount}
            </Text>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1',
                'text-[11px] font-extrabold text-white',
                'tabular-nums transition-colors',
                isHundredPercent ? 'bg-green-500' : 'bg-main-800'
              )}
            >
              {percent}%
            </span>
          </div>
        ) : null}
      </div>

      {totalGoalCount > 0 ? (
        <>
          {/* 진행률 바 — 체크 동작과 바로 연결되도록 리스트 위에 배치 */}
          <ProgressBar
            value={percent}
            size="sm"
            showValueText={false}
            className="mb-3.5"
            fillColor={isHundredPercent ? 'var(--color-green-500)' : undefined}
          />
          <ResponsiveCheckList
            variant="card"
            options={options}
            value={selectedValues}
            onValueChange={handleValueChange}
          />
        </>
      ) : (
        <div className="rounded-3 border border-gray-200 bg-white px-4 py-3">
          <Text size="body2" weight="regular" className="text-gray-500">
            연동된 챌린지를 선택하면 목표 리스트가 표시됩니다.
          </Text>
        </div>
      )}
    </section>
  );
}

export const DiaryCreateGoalsSection = React.memo(
  DiaryCreateGoalsSectionComponent
);
