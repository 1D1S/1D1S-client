import { Text } from '@1d1s/design-system';
import React from 'react';

import type { ChallengeGoal } from '../../../challenge/board/type/challenge';
import { ChallengeGoalToggle } from './challenge-goal-toggle';

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
  return (
    <section>
      <Text size="heading2" weight="bold" className="mb-6 text-gray-900">
        목표 리스트
      </Text>

      {goals.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {goals.map((goal) => (
            <div
              key={goal.challengeGoalId}
              className="border-b border-gray-200 px-4 py-3 last:border-b-0"
            >
              <ChallengeGoalToggle
                checked={achievedGoalIds.includes(goal.challengeGoalId)}
                onCheckedChange={(checked) =>
                  onGoalToggle(goal.challengeGoalId, checked)
                }
                label={goal.content}
              />
            </div>
          ))}
        </div>
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
