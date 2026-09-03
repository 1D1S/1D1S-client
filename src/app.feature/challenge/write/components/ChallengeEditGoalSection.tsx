import {
  GoalAddList,
  Icon,
  SegmentedControl,
  Text,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/app.component/ui/Form';

import { ChallengeEditFormValues } from '../hooks/useChallengeEditForm';
import { ChallengeCreateSectionCard } from './ChallengeCreateSectionCard';

export function ChallengeEditGoalSection(): React.ReactElement {
  const { control, watch } = useFormContext<ChallengeEditFormValues>();
  const isFixedGoal = watch('isFixedGoal');
  const isStarted = watch('isStarted');
  const goals = watch('goals') ?? [];
  const goalValue: 'FIXED' | 'FLEXIBLE' = isFixedGoal ? 'FIXED' : 'FLEXIBLE';
  const canEditGoals = isFixedGoal && !isStarted;

  return (
    <ChallengeCreateSectionCard
      step={3}
      title="목표 설정"
      hint="목표 유형은 변경할 수 없어요"
    >
      <SegmentedControl
        value={goalValue}
        onValueChange={() => undefined}
        aria-label="목표 유형"
        options={[
          {
            value: 'FIXED',
            label: '고정 목표',
            icon: <Icon name="Target" className="h-5 w-5" />,
            disabled: true,
          },
          {
            value: 'FLEXIBLE',
            label: '자유 목표',
            icon: <Icon name="PencilLine" className="h-5 w-5" />,
            disabled: true,
          },
        ]}
      />

      <Text
        size="caption1"
        weight="regular"
        className="mt-3 block text-gray-500"
      >
        {isFixedGoal
          ? '모두 같은 목표를 향해 달려요. 참여자는 동일한 인증 기준을 따라요.'
          : '참여자가 각자 자신만의 목표를 설정해요. 인증 방식은 자유.'}
      </Text>

      {isStarted ? (
        <div
          className={cn(
            'rounded-2 mt-4 border border-amber-200 bg-amber-50 px-4 py-3'
          )}
        >
          <Text size="caption1" weight="bold" className="block text-amber-800">
            챌린지가 시작된 이후에는 목표를 수정할 수 없어요.
          </Text>
        </div>
      ) : null}

      {canEditGoals ? (
        <div className="mt-5 space-y-2">
          <Text size="caption1" weight="bold" className="block text-gray-600">
            공통 목표
          </Text>
          <FormField
            control={control}
            name="goals"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <GoalAddList
                    goals={(field.value ?? [])
                      .map((goal) => goal.value)
                      .filter(Boolean)}
                    onGoalsChange={(updated) => {
                      field.onChange(updated.map((value) => ({ value })));
                    }}
                    placeholder="목표를 입력하고 Enter로 추가하세요"
                    inputAriaLabel="공통 목표 입력"
                    maxGoals={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : isFixedGoal ? (
        <div className="mt-5 space-y-2">
          <Text size="caption1" weight="bold" className="block text-gray-600">
            공통 목표
          </Text>
          {goals.length > 0 ? (
            <ul className="space-y-1.5">
              {goals.map((goal, index) => (
                <li
                  key={`${index}-${goal.value}`}
                  className={cn(
                    'rounded-2 border border-gray-200 bg-gray-50',
                    'px-3.5 py-2 text-[12px] font-bold text-gray-800'
                  )}
                >
                  · {goal.value}
                </li>
              ))}
            </ul>
          ) : (
            <Text size="caption1" weight="regular" className="text-gray-500">
              등록된 목표가 없습니다.
            </Text>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'border-main-200 bg-main-100 rounded-2 mt-4 border px-4 py-3'
          )}
        >
          <Text size="caption1" weight="bold" className="text-main-900 block">
            자유 목표 챌린지는 참여자가 자신만의 목표를 직접 설정해요.
          </Text>
        </div>
      )}
    </ChallengeCreateSectionCard>
  );
}
