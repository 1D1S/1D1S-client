import {
  Calendar,
  Checkbox,
  CheckContainer,
  cn,
  Text,
  TextField,
  ToggleGroup,
  ToggleGroupItem,
} from '@1d1s/design-system';
import { ChallengeCreateFormValues } from '@feature/challenge/write/hooks/use-challenge-create-form';
import * as Popover from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { CalendarDays, Infinity, Timer } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/app.component/ui/form';

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

export function Step4(): React.ReactElement {
  const { control, watch } = useFormContext<ChallengeCreateFormValues>();
  const periodType = watch('periodType');
  const period = watch('period');
  const participationType = watch('participationType');
  const isGroup = participationType === 'GROUP';

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-4">
      <div className="flex flex-col gap-2 space-y-3">
        <Text size="body1" weight="bold" className="text-gray-900">
          기간 유형
        </Text>
        <FormField
          control={control}
          name="periodType"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-2 gap-4">
                <CheckContainer
                  checked={field.value === 'ENDLESS'}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange('ENDLESS');
                    }
                  }}
                  width="100%"
                  className={cn(
                    '!rounded-3 !h-auto !items-start !justify-start p-5 text-left hover:cursor-pointer',
                    field.value === 'ENDLESS'
                      ? '!border-main-800 !bg-main-200'
                      : '!border-gray-300 !bg-white'
                  )}
                  aria-label="무기한 챌린지"
                >
                  <div className="flex h-full flex-col gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Infinity className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <Text
                        size="body1"
                        weight="bold"
                        className="text-gray-900"
                      >
                        무기한 챌린지
                      </Text>
                      <Text
                        size="body2"
                        weight="regular"
                        className="mt-1 text-gray-600"
                      >
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
                  className={cn(
                    '!rounded-3 !h-auto !items-start !justify-start p-5 text-left hover:cursor-pointer',
                    field.value === 'LIMITED'
                      ? '!border-main-800 !bg-main-200'
                      : '!border-gray-300 !bg-white'
                  )}
                  aria-label="기간 챌린지"
                >
                  <div className="flex h-full flex-col gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Timer className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col">
                      <Text
                        size="body1"
                        weight="bold"
                        className="text-gray-900"
                      >
                        기간 챌린지
                      </Text>
                      <Text
                        size="body2"
                        weight="regular"
                        className="mt-1 text-gray-600"
                      >
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
          <div className="flex flex-col space-y-3">
            <Text size="body1" weight="bold" className="text-gray-900">
              챌린지 기간
            </Text>
            <FormField
              control={control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <ToggleGroup
                    type="single"
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value);
                      }
                    }}
                  >
                    {PERIOD_OPTIONS.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        aria-label={`${option.label} 기간`}
                      >
                        {option.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {period === 'etc' ? (
            <div className="flex flex-col space-y-2">
              <Text size="body2" weight="medium" className="text-gray-700">
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
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full md:w-[240px]"
                        {...field}
                        value={field.value ?? ''}
                        maxLength={3}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          field.onChange(event.target.value.replace(/\D/g, ''));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}

          <div className="flex flex-col space-y-3">
            <Text size="body1" weight="bold" className="text-gray-900">
              시작일
            </Text>
            <FormField
              control={control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <div className="w-full md:w-[280px]">
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'rounded-3 flex h-10 w-full items-center justify-between border border-gray-300 bg-white px-3 text-left text-sm hover:cursor-pointer',
                            !field.value && 'text-gray-400'
                          )}
                        >
                          {field.value
                            ? format(field.value, 'yyyy/MM/dd')
                            : 'YYYY/MM/DD'}
                          <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" />
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          align="start"
                          sideOffset={8}
                          className={cn(
                            'rounded-4 z-50 w-auto border border-gray-300 bg-white p-2 text-gray-900',
                            'shadow-[0_10px_20px_rgba(34,34,34,0.12)] outline-none',
                            'data-[state=open]:animate-in data-[state=closed]:animate-out',
                            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
                          )}
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={{ before: new Date() }}
                            initialFocus
                          />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
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

      {isGroup && (
        <FormField
          control={control}
          name="allowMidJoin"
          render={({ field }) => (
            <FormItem>
              <div className="rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <Text size="body2" weight="bold" className="text-gray-800">
                      중도 참여 수용{' '}
                      <span className="text-gray-500">(선택)</span>
                    </Text>
                    <Text
                      size="body2"
                      weight="regular"
                      className="text-gray-600"
                    >
                      챌린지 시작 후에도 새로운 참여자를 받을 수 있습니다.
                    </Text>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                      aria-label="중도 참여 수용"
                    />
                  </FormControl>
                </div>
              </div>
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
