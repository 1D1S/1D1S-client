import { ChallengeCreateFormValues } from '@feature/challenge/presentation/hooks/use-challenge-create-form';
import {
  Button,
  CheckContainer,
  Text,
  TextField,
} from '@1d1s/design-system';
import { FormControl, FormField, FormItem, FormMessage } from '@component/ui/form';
import { cn } from '@module/lib/utils';
import { Flag, Plus, Target, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

export function Step4(): React.ReactElement {
  const { control, formState } = useFormContext<ChallengeCreateFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'goals',
  });

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
        <div className="space-y-3">
          {fields.map((goalField, index) => (
            <FormField
              key={goalField.id}
              control={control}
              name={`goals.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <FormControl>
                        <TextField placeholder={`목표 ${index + 1}을 입력하세요`} {...field} />
                      </FormControl>
                    </div>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="h-14 w-14 p-0"
                      aria-label={`목표 ${index + 1} 삭제`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {formState.errors.goals?.message ? (
          <Text size="body2" weight="medium" className="text-red-500">
            {formState.errors.goals.message}
          </Text>
        ) : null}

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ value: '' })}
          className="px-5"
        >
          <Plus className="mr-1 h-4 w-4" />
          목표 추가
        </Button>
      </div>
    </div>
  );
}
