'use client';

import {
  Button,
  CheckContainer,
  Icon,
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
import { cn } from '@module/utils/cn';
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

const VISIBILITY_OPTIONS = [
  {
    id: 'public' as const,
    icon: 'People' as const,
    title: '공개 프로필',
    desc: '다른 챌린저와 일지·스트릭을 공유해요',
  },
  {
    id: 'private' as const,
    icon: 'Person' as const,
    title: '비공개 프로필',
    desc: '나만 볼 수 있어요. 언제든 변경 가능해요',
  },
];

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
                  helper="한 번 정한 닉네임은 30일 후 변경할 수 있어요"
                  className="w-full"
                  value={field.value ?? ''}
                  onChange={field.onChange}
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
          <FieldLabel required>생년월일</FieldLabel>
          <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TextField
                      placeholder="1998"
                      suffix="년"
                      inputMode="numeric"
                      maxLength={4}
                      className="w-full"
                      value={field.value ?? ''}
                      onChange={(event) =>
                        field.onChange(event.target.value.replace(/\D/g, ''))
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                    />
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
                    <TextField
                      placeholder="MM"
                      suffix="월"
                      inputMode="numeric"
                      maxLength={2}
                      className="w-full"
                      value={field.value ?? ''}
                      onChange={(event) =>
                        field.onChange(event.target.value.replace(/\D/g, ''))
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                    />
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
                    <TextField
                      placeholder="DD"
                      suffix="일"
                      inputMode="numeric"
                      maxLength={2}
                      className="w-full"
                      value={field.value ?? ''}
                      onChange={(event) =>
                        field.onChange(event.target.value.replace(/\D/g, ''))
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                    />
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
                  value={field.value}
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
                  value={field.value}
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

        <div>
          <FieldLabel required>프로필 공개 설정</FieldLabel>
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  {VISIBILITY_OPTIONS.map((option) => {
                    const checked =
                      option.id === 'public' ? field.value : !field.value;
                    return (
                      <CheckContainer
                        key={option.id}
                        type="button"
                        checked={checked}
                        onCheckedChange={() =>
                          field.onChange(option.id === 'public')
                        }
                        width="100%"
                        className={cn(
                          'rounded-3 flex w-full items-center gap-3.5 px-4 py-3.5'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-[38px] w-[38px] flex-shrink-0 items-center',
                            'justify-center rounded-[10px] transition-colors',
                            checked
                              ? 'bg-main-800 text-white'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          <Icon name={option.icon} size={18} />
                        </span>
                        <span className="flex-1 text-left">
                          <Text
                            size="body2"
                            weight="extrabold"
                            as="div"
                            className={
                              checked ? 'text-main-800' : 'text-gray-900'
                            }
                          >
                            {option.title}
                          </Text>
                          <Text
                            size="caption2"
                            weight="regular"
                            as="div"
                            className="mt-0.5 text-gray-500"
                          >
                            {option.desc}
                          </Text>
                        </span>
                      </CheckContainer>
                    );
                  })}
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          type="button"
          size="large"
          fullWidth
          onClick={onNext}
        >
          다음 — 관심 카테고리
        </Button>
      </div>
    </div>
  );
}
