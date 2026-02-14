import { ChallengeCreateFormValues } from '@feature/challenge/write/hooks/use-challenge-create-form';
import {
  CheckContainer,
  DatePicker,
  Text,
  TextField,
} from '@1d1s/design-system';
import { FormControl, FormField, FormItem, FormMessage } from '@component/ui/form';
import { cn } from '@module/lib/utils';
import { CalendarDays, Infinity, Timer } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

const PERIOD_OPTIONS: Array<{ value: '7' | '14' | '30' | '60' | '365' | 'etc'; label: string }> = [
  { value: '7', label: '7일' },
  { value: '14', label: '14일' },
  { value: '30', label: '30일' },
  { value: '60', label: '60일' },
  { value: '365', label: '1년' },
  { value: 'etc', label: '직접 입력' },
];

export function Step2(): React.ReactElement {
  const { control, watch } = useFormContext<ChallengeCreateFormValues>();
  const periodType = watch('periodType');
  const period = watch('period');

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-8">
      <div className="space-y-3">
        <Text size="heading1" weight="bold" className="text-gray-900">
          기간 유형
        </Text>
        <FormField
          control={control}
          name="periodType"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CheckContainer
                  checked={field.value === 'ENDLESS'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange('ENDLESS');
                    }
                  }}
                  width="100%"
                  height={176}
                  className={cn(
                    '!items-start !justify-start !rounded-3 p-6 text-left',
                    field.value === 'ENDLESS'
                      ? '!border-main-800 !bg-main-200'
                      : '!border-gray-300 !bg-white'
                  )}
                  aria-label="무기한 챌린지"
                >
                  <div className="flex h-full flex-col justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Infinity className="h-5 w-5" />
                    </span>
                    <div>
                      <Text size="heading1" weight="bold" className="text-gray-900">
                        무기한 챌린지
                      </Text>
                      <Text size="body2" weight="regular" className="mt-2 text-gray-600">
                        종료일 없이 루틴을 이어가는 장기 챌린지입니다.
                      </Text>
                    </div>
                  </div>
                </CheckContainer>

                <CheckContainer
                  checked={field.value === 'LIMITED'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange('LIMITED');
                    }
                  }}
                  width="100%"
                  height={176}
                  className={cn(
                    '!items-start !justify-start !rounded-3 p-6 text-left',
                    field.value === 'LIMITED'
                      ? '!border-main-800 !bg-main-200'
                      : '!border-gray-300 !bg-white'
                  )}
                  aria-label="기간 챌린지"
                >
                  <div className="flex h-full flex-col justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Timer className="h-5 w-5" />
                    </span>
                    <div>
                      <Text size="heading1" weight="bold" className="text-gray-900">
                        기간 챌린지
                      </Text>
                      <Text size="body2" weight="regular" className="mt-2 text-gray-600">
                        시작일과 종료일을 정해 집중적으로 진행합니다.
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

      {periodType === 'LIMITED' ? (
        <>
          <div className="space-y-3">
            <Text size="heading1" weight="bold" className="text-gray-900">
              챌린지 기간
            </Text>
            <FormField
              control={control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-wrap gap-3">
                    {PERIOD_OPTIONS.map((option) => {
                      const isSelected = field.value === option.value;
                      return (
                        <CheckContainer
                          key={option.value}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange(option.value);
                            }
                          }}
                          showCheckIndicator={false}
                          width="auto"
                          height={46}
                          className={cn(
                            '!rounded-full px-4',
                            isSelected
                              ? '!border-main-800 !bg-main-800 !text-white'
                              : '!border-gray-300 !bg-white !text-gray-700'
                          )}
                          aria-label={`${option.label} 기간`}
                        >
                          <Text
                            size="body1"
                            weight="medium"
                            className={isSelected ? 'text-white' : 'text-gray-700'}
                          >
                            {option.label}
                          </Text>
                        </CheckContainer>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {period === 'etc' ? (
            <div className="space-y-2">
              <Text size="body1" weight="medium" className="text-gray-700">
                직접 입력 (최대 730일)
              </Text>
              <FormField
                control={control}
                name="periodNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TextField
                        id="periodNumber"
                        type="number"
                        className="w-full md:w-[240px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}

          <div className="space-y-3">
            <Text size="heading1" weight="bold" className="text-gray-900">
              시작일
            </Text>
            <FormField
              control={control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <div className="w-full md:w-[280px]">
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <Text size="body2" weight="medium">
              무기한 챌린지는 시작 후 종료일 없이 계속 진행됩니다.
            </Text>
          </div>
        </div>
      )}
    </div>
  );
}
