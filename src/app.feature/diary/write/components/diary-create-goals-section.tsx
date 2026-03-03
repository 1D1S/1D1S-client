import { CheckList, Text } from '@1d1s/design-system';
import React from 'react';

import type { ChallengeGoal } from '../../../challenge/board/type/challenge';

interface DiaryCreateGoalsSectionProps {
  goals: ChallengeGoal[];
  achievedGoalIds: number[];
  onGoalToggle(goalId: number, checked: boolean): void;
}

export function DiaryCreateGoalsSection({
  goals,
  achievedGoalIds,
  onGoalToggle,
}: DiaryCreateGoalsSectionProps): React.ReactElement {
  const options = goals.map((goal) => ({
    id: String(goal.challengeGoalId),
    label: goal.content,
  }));

  const selectedValues = achievedGoalIds.map((goalId) => String(goalId));

  const handleValueChange = (nextValues: string[]): void => {
    const previousSet = new Set(selectedValues);
    const nextSet = new Set(nextValues);

    goals.forEach((goal) => {
      const goalId = goal.challengeGoalId;
      const goalKey = String(goalId);
      const wasChecked = previousSet.has(goalKey);
      const isChecked = nextSet.has(goalKey);

      if (wasChecked !== isChecked) {
        onGoalToggle(goalId, isChecked);
      }
    });
  };

  return (
    <section>
      <Text size="heading2" weight="bold" className="mb-6 text-gray-900">
        목표 리스트
      </Text>

      {goals.length > 0 ? (
        <CheckList
          options={options}
          value={selectedValues}
          onValueChange={handleValueChange}
        />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5">
          <Text size="body2" weight="regular" className="text-gray-500">
            연동된 챌린지를 선택하면 목표 리스트가 표시됩니다.
          </Text>
        </div>
      )}
    </section>
  );
}
