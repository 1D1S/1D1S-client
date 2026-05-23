import { GoalAddList, Icon, Text } from '@1d1s/design-system';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/app.component/ui/Form';

import { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';
import { ChallengeCreateSectionCard } from './ChallengeCreateSectionCard';
import { ChallengeCreateSegmentToggle } from './ChallengeCreateSegmentToggle';

export function ChallengeCreateGoalSection(): React.ReactElement {
  const { control, watch } = useFormContext<ChallengeCreateFormValues>();
  const goalType = watch('goalType');
  const participationType = watch('participationType');
  const isIndividual = participationType === 'INDIVIDUAL';

  return (
    <ChallengeCreateSectionCard step={3} title="목표 설정">
      <FormField
        control={control}
        name="goalType"
        render={({ field }) => (
          <FormItem>
            <ChallengeCreateSegmentToggle
              value={field.value}
              onChange={(value) => {
                if (value === 'FLEXIBLE' && isIndividual) {
                  return;
                }
                field.onChange(value);
              }}
              ariaLabel="목표 유형"
              options={[
                {
                  value: 'FIXED',
                  label: '고정 목표',
                  icon: <Icon name="Target" className="h-3.5 w-3.5" />,
                },
                {
                  value: 'FLEXIBLE',
                  label: '자유 목표',
                  icon: <Icon name="PencilLine" className="h-3.5 w-3.5" />,
                  disabled: isIndividual,
                },
              ]}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <Text
        size="caption1"
        weight="regular"
        className="mt-2 block text-gray-500"
      >
        {goalType === 'FIXED'
          ? '모두 같은 목표를 향해 달려요. 참여자는 동일한 인증 기준을 따라요.'
          : '참여자가 각자 자신만의 목표를 설정해요. 인증 방식은 자유.'}
      </Text>

      {isIndividual ? (
        <div className="border-main-200 bg-main-100 rounded-2 mt-3 border px-4 py-3">
          <Text size="caption1" weight="bold" className="text-main-900 block">
            개인 챌린지는 자동으로 고정 목표로 진행돼요.
          </Text>
        </div>
      ) : null}

      {goalType === 'FIXED' ? (
        <div className="mt-4 space-y-2">
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
                    onGoalsChange={(goals) => {
                      field.onChange(goals.map((value) => ({ value })));
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
      ) : (
        <div className="mt-4 space-y-2">
          <Text size="caption1" weight="bold" className="block text-gray-600">
            나의 시작 목표
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
                    onGoalsChange={(goals) => {
                      field.onChange(goals.map((value) => ({ value })));
                    }}
                    placeholder="나만의 목표를 입력하고 Enter로 추가하세요"
                    inputAriaLabel="개인 목표 입력"
                    maxGoals={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Text
            size="caption1"
            weight="regular"
            className="block text-gray-500"
          >
            참여자들은 자신만의 목표를 별도로 설정할 수 있어요.
          </Text>
        </div>
      )}
    </ChallengeCreateSectionCard>
  );
}
