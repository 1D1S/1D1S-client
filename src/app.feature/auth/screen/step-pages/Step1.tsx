'use client';

import {
  Button,
  Icon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  TextField,
  ToggleGroup,
  ToggleGroupItem,
} from '@1d1s/design-system';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@component/ui/Form';
import { NicknameCheckButton } from '@feature/member/components/NicknameCheckButton';
import { useCheckNickname } from '@feature/member/hooks/useMemberMutations';
import { normalizeApiError } from '@module/api/error';
import { NICKNAME_REGEX } from '@module/utils/nickname';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import {
  SIGN_UP_GENDER_OPTIONS,
  SIGN_UP_OCCUPATION_OPTIONS,
} from '../../consts/signUpOptions';
import { SignupFormValues } from '../../hooks/useSignUpForm';
import type { GenderType } from '../../type/auth';

interface Step1Props {
  onNext(): void;
}

const GENDER_EMOJI: Record<string, string> = {
  FEMALE: '👩',
  MALE: '👨',
  ETC: '🤷',
};

const JOB_EMOJI: Record<string, string> = {
  WORKER: '💼',
  STUDENT: '📚',
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1950 + 1 }, (_, i) =>
  String(CURRENT_YEAR - i)
);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));

function getDaysInMonth(year: string, month: string): number {
  const yearNum = Number(year);
  const monthNum = Number(month);
  if (!yearNum || !monthNum) {
    return 31;
  }
  return new Date(yearNum, monthNum, 0).getDate();
}

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}): React.ReactElement {
  return (
    <Text
      size="caption1"
      weight="bold"
      as="div"
      className="mb-1.5 flex items-center gap-1 text-gray-700"
    >
      {children}
      {required && <span className="text-main-800">*</span>}
    </Text>
  );
}

export function Step1({ onNext }: Step1Props): React.ReactElement {
  const form = useFormContext<SignupFormValues>();
  const checkNickname = useCheckNickname();
  const nicknameValue = form.watch('nickname') ?? '';
  const isFormatValid =
    nicknameValue.length > 0 &&
    nicknameValue.length <= 8 &&
    NICKNAME_REGEX.test(nicknameValue);
  const checkedNickname = checkNickname.variables;
  const isCheckCurrent = checkedNickname === nicknameValue;
  const showSuccess = isCheckCurrent && checkNickname.isSuccess;
  const showError = isCheckCurrent && checkNickname.isError;
  const isVerified = showSuccess;
  const yearValue = form.watch('year') ?? '';
  const monthValue = form.watch('month') ?? '';
  const dayValue = form.watch('day') ?? '';
  const dayOptions = React.useMemo(
    () =>
      Array.from({ length: getDaysInMonth(yearValue, monthValue) }, (_, i) =>
        String(i + 1)
      ),
    [yearValue, monthValue]
  );

  const handleCheck = (): void => {
    if (!isFormatValid) {
      return;
    }
    checkNickname.mutate(nicknameValue);
  };

  const handleNext = (): void => {
    if (!isVerified) {
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextField
                  label="닉네임"
                  placeholder="2~12자, 한글/영문/숫자"
                  iconLeft={<Icon name="Person" size={16} />}
                  iconRight={
                    <NicknameCheckButton
                      onClick={handleCheck}
                      disabled={!isFormatValid || isVerified}
                      isPending={checkNickname.isPending}
                    />
                  }
                  helper={
                    showSuccess
                      ? undefined
                      : '한 번 정한 닉네임은 30일 후 변경할 수 있어요'
                  }
                  className="w-full"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              {showSuccess ? (
                <Text
                  size="caption1"
                  weight="regular"
                  className="mt-1 text-green-600"
                >
                  ✅ 사용 가능한 닉네임이에요
                </Text>
              ) : showError ? (
                <Text
                  size="caption1"
                  weight="regular"
                  className="mt-1 text-red-500"
                >
                  {normalizeApiError(checkNickname.error).message}
                </Text>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />

        <div>
          <FieldLabel required>생년월일</FieldLabel>
          <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const maxDay = getDaysInMonth(value, monthValue);
                        if (dayValue && Number(dayValue) > maxDay) {
                          form.setValue('day', '', { shouldValidate: true });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="연도" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}년
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const maxDay = getDaysInMonth(yearValue, value);
                        if (dayValue && Number(dayValue) > maxDay) {
                          form.setValue('day', '', { shouldValidate: true });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="월" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_OPTIONS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}월
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="일" />
                      </SelectTrigger>
                      <SelectContent>
                        {dayOptions.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}일
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Text
            size="caption2"
            weight="regular"
            as="p"
            className="mt-1.5 block text-gray-500"
          >
            또래 챌린저 추천에 사용돼요. 다른 사용자에게 공개되지 않아요.
          </Text>
        </div>

        <div>
          <FieldLabel required>성별</FieldLabel>
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <ToggleGroup
                  type="single"
                  // 미선택(undefined)에서도 controlled 상태를 유지하도록 '' 로
                  // 보정한다. uncontrolled→controlled 전환 경고 방지.
                  value={field.value ?? ''}
                  onValueChange={(value) => {
                    if (value) {
                      field.onChange(value as GenderType);
                    }
                  }}
                  className="grid grid-cols-3 gap-2"
                >
                  {SIGN_UP_GENDER_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      shape="square"
                      className="h-[52px] w-full justify-center px-0 text-[13px]"
                    >
                      <span className="text-base leading-none">
                        {GENDER_EMOJI[option.value]}
                      </span>
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FieldLabel required>직업</FieldLabel>
          <FormField
            control={form.control}
            name="job"
            render={({ field }) => (
              <FormItem>
                <ToggleGroup
                  type="single"
                  // 미선택(undefined)에서도 controlled 상태를 유지하도록 '' 로
                  // 보정한다. uncontrolled→controlled 전환 경고 방지.
                  value={field.value ?? ''}
                  onValueChange={(value) => {
                    if (value) {
                      field.onChange(value as SignupFormValues['job']);
                    }
                  }}
                  className="grid grid-cols-2 gap-2"
                >
                  {SIGN_UP_OCCUPATION_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      shape="square"
                      className="h-[52px] w-full justify-center px-0 text-[13px]"
                    >
                      <span className="text-base leading-none">
                        {JOB_EMOJI[option.value]}
                      </span>
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          type="button"
          size="lg"
          fullWidth
          disabled={!isVerified}
          onClick={handleNext}
        >
          다음 — 관심 카테고리
        </Button>
      </div>
    </div>
  );
}
