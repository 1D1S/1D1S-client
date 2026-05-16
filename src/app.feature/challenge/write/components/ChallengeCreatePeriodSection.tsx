import { DatePicker, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { formatDateKR } from '@module/utils/date';
import { add } from 'date-fns';
import { type ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/app.component/ui/Form';

import { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';
import { ChallengeCreateChip } from './ChallengeCreateChip';
import { ChallengeCreateSectionCard } from './ChallengeCreateSectionCard';
import { ChallengeCreateSegmentToggle } from './ChallengeCreateSegmentToggle';

const PERIOD_OPTIONS: Array<{
  value: '7' | '14' | '30' | '60' | '365' | 'etc';
  label: string;
}> = [
  { value: '7', label: '7일' },
  { value: '14', label: '14일' },
  { value: '30', label: '30일' },
  { value: '60', label: '60일' },
  { value: '365', label: '1년' },
  { value: 'etc', label: '직접 입력' },
];

export function ChallengeCreatePeriodSection(): React.ReactElement {
  const { control, watch } = useFormContext<ChallengeCreateFormValues>();
  const periodType = watch('periodType');
  const period = watch('period');
  const periodNumber = watch('periodNumber');
  const startDate = watch('startDate');

  const days =
    period === 'etc' ? Number(periodNumber) || 0 : Number(period) || 0;
  const previewEndDate =
    startDate && days > 0
      ? add(startDate, { days: Math.max(0, days - 1) })
      : null;

  return (
    <ChallengeCreateSectionCard step={4} title="진행 기간">
      <FormField
        control={control}
        name="periodType"
        render={({ field }) => (
          <FormItem>
            <ChallengeCreateSegmentToggle
              value={field.value}
              onChange={field.onChange}
              ariaLabel="진행 기간 유형"
              options={[
                { value: 'ENDLESS', label: '무제한', icon: '♾️' },
                { value: 'LIMITED', label: '기간 챌린지', icon: '📅' },
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
        {periodType === 'ENDLESS'
          ? '종료일 없이 꾸준히 이어가는 챌린지예요. 언제든 중단할 수 있어요.'
          : '시작일과 진행 일수를 정해서 마감일을 만들어요.'}
      </Text>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Text
            size="caption1"
            weight="bold"
            className="block text-gray-600"
          >
            시작일
          </Text>
          <FormField
            control={control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="YYYY/MM/DD"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {periodType === 'LIMITED' ? (
          <>
            <div className="space-y-2 md:col-span-1">
              <Text
                size="caption1"
                weight="bold"
                className="block text-gray-600"
              >
                진행 일수
              </Text>
              <FormField
                control={control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-wrap gap-1.5">
                      {PERIOD_OPTIONS.map((option) => (
                        <ChallengeCreateChip
                          key={option.value}
                          active={field.value === option.value}
                          onClick={() => field.onChange(option.value)}
                        >
                          {option.label}
                        </ChallengeCreateChip>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {period === 'etc' ? (
                <FormField
                  control={control}
                  name="periodNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={3}
                          placeholder="1 ~ 730"
                          value={field.value ?? ''}
                          onChange={(
                            event: ChangeEvent<HTMLInputElement>
                          ) => {
                            field.onChange(
                              event.target.value.replace(/\D/g, '')
                            );
                          }}
                          className={cn(
                            'rounded-2 w-full border border-gray-200',
                            'bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900',
                            'focus:border-main-800 outline-none'
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>

            {startDate && previewEndDate ? (
              <div
                className={cn(
                  'rounded-2 col-span-1 bg-gray-50 px-3.5 py-2.5',
                  'text-[12px] text-gray-700 md:col-span-2'
                )}
              >
                <b>{formatDateKR(startDate)}</b>에 시작해서{' '}
                <b>{formatDateKR(previewEndDate)}</b>에 끝나요 · 총{' '}
                <b>{days}일</b>
              </div>
            ) : null}
          </>
        ) : startDate ? (
          <div
            className={cn(
              'rounded-2 col-span-1 bg-gray-50 px-3.5 py-2.5',
              'text-[12px] text-gray-700 md:col-span-2'
            )}
          >
            <b>{formatDateKR(startDate)}</b>부터 시작 · 종료일 없이 이어가요
          </div>
        ) : null}
      </div>
    </ChallengeCreateSectionCard>
  );
}
