import { Text } from '@1d1s/design-system';
import { ResponsiveCheckList } from '@component/ResponsiveCheckList';
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

  const handleValueChange = (nextValues: string[]): void => {
    onGoalIdsChange(nextValues.map((value) => Number(value)));
  };

  return (
    <section>
      <Text size="caption1" weight="bold" className="mb-2 block text-gray-600">
        오늘의 목표
      </Text>

      {totalGoalCount > 0 ? (
        <>
          <ResponsiveCheckList
            options={options}
            value={selectedValues}
            onValueChange={handleValueChange}
          />
          <Text
            size="caption2"
            weight="regular"
            className="mt-1.5 block text-gray-400"
          >
            달성한 항목을 체크해주세요.
          </Text>
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
