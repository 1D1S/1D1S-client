import { ChallengeCreateFormValues } from '@feature/challenge/write/hooks/use-challenge-create-form';
import {
  CheckContainer,
  GoalAddList,
  Text,
} from '@1d1s/design-system';
import { FormControl, FormField, FormItem, FormMessage } from '@component/ui/form';
import { cn } from '@module/lib/utils';
import { Flag, Target } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export function Step4(): React.ReactElement {
  const { control } = useFormContext<ChallengeCreateFormValues>();

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-8">
      <div className="space-y-3">
        <Text size="heading1" weight="bold" className="text-gray-900">
          목표 방식
        </Text>
        <FormField
          control={control}
          name="goalType"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CheckContainer
                  checked={field.value === 'FIXED'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange('FIXED');
                    }
                  }}
                  width="100%"
                  height={176}
                  className={cn(
                    '!items-start !justify-start !rounded-3 p-6 text-left',
                    field.value === 'FIXED'
                      ? '!border-main-800 !bg-main-200'
                      : '!border-gray-300 !bg-white'
                  )}
                  aria-label="고정 목표"
                >
                  <div className="flex h-full flex-col justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Flag className="h-5 w-5" />
                    </span>
                    <div>
                      <Text size="heading1" weight="bold" className="text-gray-900">
                        고정 목표
                      </Text>
                      <Text size="body2" weight="regular" className="mt-2 text-gray-600">
                        참여자가 동일한 목표를 달성하는 방식입니다.
                      </Text>
                    </div>
                  </div>
                </CheckContainer>

                <CheckContainer
                  checked={field.value === 'FLEXIBLE'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange('FLEXIBLE');
                    }
                  }}
                  width="100%"
                  height={176}
                  className={cn(
                    '!items-start !justify-start !rounded-3 p-6 text-left',
                    field.value === 'FLEXIBLE'
                      ? '!border-main-800 !bg-main-200'
                      : '!border-gray-300 !bg-white'
                  )}
                  aria-label="자유 목표"
                >
                  <div className="flex h-full flex-col justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Target className="h-5 w-5" />
                    </span>
                    <div>
                      <Text size="heading1" weight="bold" className="text-gray-900">
                        자유 목표
                      </Text>
                      <Text size="body2" weight="regular" className="mt-2 text-gray-600">
                        참여자가 각자 목표를 설정해 진행하는 방식입니다.
                      </Text>
                    </div>
                  </div>
                </CheckContainer>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-3">
        <Text size="heading1" weight="bold" className="text-gray-900">
          목표 목록
        </Text>
        <FormField
          control={control}
          name="goals"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <GoalAddList
                  goals={(field.value ?? []).map((goal) => goal.value).filter(Boolean)}
                  onGoalsChange={(goals) => {
                    field.onChange(goals.map((goal) => ({ value: goal })));
                  }}
                  placeholder="목표를 입력하고 Enter를 눌러 추가하세요"
                  inputAriaLabel="목표 입력"
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
