'use client';

import type { IconName } from '@1d1s/design-system';
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
import { useNativeSubmitBar } from '@module/hooks/useNativeSubmitBar';
import { cn } from '@module/utils/cn';
import { NICKNAME_REGEX } from '@module/utils/nickname';
import { formatPhoneNumber } from '@module/utils/phoneNumber';
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
  // 스텝1에서 뒤로가기(네이티브 헤더 back = form_cta 'back') 시 이탈 확인 모달.
  onExit(): void;
}

// 성별은 DS 아이콘 세트에 구분되는 픽토그램이 없어 라벨만 쓴다.
const JOB_ICON: Record<string, IconName> = {
  WORKER: 'Laptop',
  STUDENT: 'BookOpen',
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1950 + 1 }, (_, i) =>
  String(CURRENT_YEAR - i)
);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));

// 생년월일은 선택(optional) 항목이라 비울 수 있어야 한다. Radix Select 는
// value="" 를 허용하지 않으므로 "선택 안 함" 에 센티널을 쓰고, 선택 시 빈
// 문자열로 되돌려 폼 값을 비운다(스키마가 '' 를 허용).
const BIRTH_NONE = '__none__';
const toBirthValue = (value: string): string =>
  value === BIRTH_NONE ? '' : value;

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
  // 모든 필드 라벨을 이 컴포넌트로 통일. 입력값/플레이스홀더 대비 위계가
  // 서도록 text-sm(14px) bold 로 키운다(기존 text-2xs 는 너무 작았음).
  return (
    <span
      className={cn(
        'mb-1.5 flex items-center gap-1',
        'text-sm font-bold text-gray-800'
      )}
    >
      {children}
      {required && <span className="text-main-800">*</span>}
    </span>
  );
}

export function Step1({ onNext, onExit }: Step1Props): React.ReactElement {
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
  // 직업은 필수(*)다. 닉네임 중복확인과 함께 "다음" 활성 조건에 포함한다 —
  // 이게 빠져 미선택 상태에서도 다음이 활성/통과됐다(버그2).
  const jobValue = form.watch('job');
  const canProceed = isVerified && Boolean(jobValue);
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
    if (!canProceed) {
      return;
    }
    onNext();
  };

  // 앱(웹뷰)에선 "다음" CTA 를 네이티브 고정 바로 위임한다(스텝 1/2).
  // back(네이티브 헤더/시스템 back → form_cta 'back')은 이탈 확인 모달로 잇는다.
  const ctaDelegated = useNativeSubmitBar('다음', !canProceed, handleNext, {
    step: 1,
    steps: 2,
    onBack: onExit,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FieldLabel required>닉네임</FieldLabel>
              <FormControl>
                <TextField
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
                  as="div"
                  className="mt-1 flex items-center gap-1 text-green-600"
                >
                  <Icon name="Check" size={14} aria-hidden />
                  사용 가능한 닉네임이에요
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

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FieldLabel>
                전화번호{' '}
                <span className="font-normal text-gray-400">(선택)</span>
              </FieldLabel>
              <FormControl>
                <TextField
                  placeholder="010-1234-5678"
                  inputMode="numeric"
                  maxLength={13}
                  helper="상품 발송 시에만 사용하고 외부에 공개하지 않아요"
                  className="w-full"
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(formatPhoneNumber(event.target.value))
                  }
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FieldLabel>
            생년월일 <span className="font-normal text-gray-400">(선택)</span>
          </FieldLabel>
          {/* DS SelectTrigger 는 min-w-[150px] 이라 3열이면 모바일 폭을
              넘겨 오른쪽으로 잘린다. 각 트리거에 min-w-0 을 줘서 fr 비율이
              실제로 먹도록 한다. */}
          <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(raw) => {
                        const value = toBirthValue(raw);
                        field.onChange(value);
                        const maxDay = getDaysInMonth(value, monthValue);
                        if (dayValue && Number(dayValue) > maxDay) {
                          form.setValue('day', '', { shouldValidate: true });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full min-w-0 px-3">
                        <SelectValue placeholder="연도" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BIRTH_NONE}>선택 안 함</SelectItem>
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
                <FormItem className="min-w-0">
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(raw) => {
                        const value = toBirthValue(raw);
                        field.onChange(value);
                        const maxDay = getDaysInMonth(yearValue, value);
                        if (dayValue && Number(dayValue) > maxDay) {
                          form.setValue('day', '', { shouldValidate: true });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full min-w-0 px-3">
                        <SelectValue placeholder="월" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BIRTH_NONE}>선택 안 함</SelectItem>
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
                <FormItem className="min-w-0">
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(raw) => field.onChange(toBirthValue(raw))}
                    >
                      <SelectTrigger className="w-full min-w-0 px-3">
                        <SelectValue placeholder="일" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BIRTH_NONE}>선택 안 함</SelectItem>
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
          <FieldLabel>
            성별 <span className="font-normal text-gray-400">(선택)</span>
          </FieldLabel>
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
                  // 성별은 선택(optional) 항목 — 고른 버튼을 다시 누르면 ToggleGroup
                  // 이 '' 를 주고, 그때 undefined 로 되돌려 선택 해제되게 한다.
                  onValueChange={(value) =>
                    field.onChange(
                      (value || undefined) as GenderType | undefined
                    )
                  }
                  className="grid grid-cols-3 gap-2"
                >
                  {SIGN_UP_GENDER_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      shape="square"
                      className={cn(
                        'flex h-[52px] w-full items-center justify-center',
                        'px-0 text-[13px]'
                      )}
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
                      // 아이콘은 DS `icon` prop 으로 넘겨 카테고리 칩과 동일한
                      // 정렬을 쓴다(자식+수동 flex 는 두 옵션 정렬이 어긋났다).
                      icon={
                        <Icon
                          name={JOB_ICON[option.value]}
                          size={16}
                          aria-hidden
                        />
                      }
                      className="h-[52px] w-full justify-center px-0 text-[13px]"
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
      </div>

      {/* 앱에선 네이티브 고정 바가 대신 뜨므로 웹 버튼을 숨긴다. */}
      {!ctaDelegated && (
        <div className="mt-8 flex justify-end">
          <Button
            type="button"
            size="lg"
            fullWidth
            disabled={!canProceed}
            onClick={handleNext}
          >
            다음 — 관심 카테고리
          </Button>
        </div>
      )}
    </div>
  );
}
