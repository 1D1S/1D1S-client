import { CheckContainer, cn, GoalAddList, Text } from '@1d1s/design-system';
import { Flag, Target } from 'lucide-react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/app.component/ui/form';

import { ChallengeCreateFormValues } from '../../hooks/use-challenge-create-form';

export function Step4(): React.ReactElement {
  const { control, setValue, watch } =
    useFormContext<ChallengeCreateFormValues>();
  const participationType = watch('participationType');
  const goalType = watch('goalType');
  const isIndividualChallenge = participationType === 'INDIVIDUAL';

  useEffect(() => {
    if (isIndividualChallenge && goalType !== 'FIXED') {
      setValue('goalType', 'FIXED', {
        shouldValidate: true,
      });
    }
  }, [goalType, isIndividualChallenge, setValue]);

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-4">
      <div className="flex flex-col space-y-3">
        <Text size="body1" weight="bold" className="text-gray-900">
          목표 방식
        </Text>
        <FormField
          control={control}
          name="goalType"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-2 gap-4">
                <CheckContainer
                  checked={field.value === 'FIXED'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange('FIXED');
                    }
                  }}
                  width="100%"
                  className={cn(
                    '!rounded-3 !h-auto !items-start !justify-start p-5 text-left hover:cursor-pointer',
                    field.value === 'FIXED'
                      ? '!border-main-800 !bg-main-200'
                      : '!border-gray-300 !bg-white'
                  )}
                  aria-label="고정 목표"
                >
                  <div className="flex h-full flex-col gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Flag className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <Text
                        size="body1"
                        weight="bold"
                        className="text-gray-900"
                      >
                        고정 목표
                      </Text>
                      <Text
                        size="body2"
                        weight="regular"
                        className="mt-1 text-gray-600"
                      >
                        참여자가 동일한 목표를 달성하는 방식입니다.
                      </Text>
                    </div>
                  </div>
                </CheckContainer>

                <CheckContainer
                  checked={field.value === 'FLEXIBLE'}
                  disabled={isIndividualChallenge}
                  onCheckedChange={(checked) => {
                    if (checked && !isIndividualChallenge) {
                      field.onChange('FLEXIBLE');
                    }
                  }}
                  width="100%"
                  className={cn(
                    '!rounded-3 !h-auto !items-start !justify-start p-5 text-left hover:cursor-pointer disabled:cursor-not-allowed',
                    field.value === 'FLEXIBLE'
                      ? '!border-main-800 !bg-main-200'
                      : '!border-gray-300 !bg-white',
                    isIndividualChallenge && '!border-gray-200 !bg-gray-100'
                  )}
                  aria-label="자유 목표"
                >
                  <div className="flex h-full flex-col gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Target className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <Text
                        size="body1"
                        weight="bold"
                        className="text-gray-900"
                      >
                        자유 목표
                      </Text>
                      <Text
                        size="body2"
                        weight="regular"
                        className="mt-1 text-gray-600"
                      >
                        참여자가 각자 목표를 설정해 진행하는 방식입니다.
                      </Text>
                    </div>
                  </div>
                </CheckContainer>
              </div>
              {isIndividualChallenge ? (
                <div className="border-main-300 bg-main-100 mt-3 rounded-2xl border px-4 py-3">
                  <Text
                    size="body2"
                    weight="bold"
                    className="text-main-900 block"
                  >
                    개인 챌린지는 자동으로 고정 목표로 생성됩니다.
                  </Text>
                  <Text
                    size="body2"
                    weight="regular"
                    className="text-main-900 mt-1"
                  >
                    참여자가 1명이므로 자유 목표는 선택할 수 없고, 입력한
                    목표를 기준으로 챌린지가 진행됩니다.
                  </Text>
                </div>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex flex-col space-y-3">
        <Text size="body1" weight="bold" className="text-gray-900">
          목표 목록
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
                    field.onChange(goals.map((goal) => ({ value: goal })));
                  }}
                  placeholder="목표를 입력하고 Enter를 눌러 추가하세요"
                  inputAriaLabel="목표 입력"
                  maxGoals={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
