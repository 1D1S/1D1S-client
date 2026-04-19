'use client';

import {
  AvatarImagePicker,
  Button,
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
} from '@component/ui/form';
import {
  getDayOptions,
  getMonthOptions,
  getYearOptions,
} from '@module/utils/date';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import {
  SIGN_UP_GENDER_OPTIONS,
  SIGN_UP_OCCUPATION_OPTIONS,
} from '../../consts/signUpOptions';
import { SignupFormValues } from '../../hooks/useSignUpForm';
import type { GenderType } from '../../type/auth';

const SIGN_UP_LEFT_VISUAL_SIZE = 200;

interface Step1Props {
  onNext(): void;
}

export function Step1({ onNext }: Step1Props): React.ReactElement {
  const form = useFormContext<SignupFormValues>();
  const [imgPreviewUrl, setImgPreviewUrl] = React.useState<
    string | undefined
  >();

  const yearOptions = getYearOptions();
  const monthOptions = getMonthOptions();
  const dayOptions = getDayOptions();

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-1 items-stretch px-4 pb-5">
      <div className="grid w-full gap-6 lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex min-h-0 flex-col pt-2 text-left">
          <Text size="display2" weight="bold" className="text-gray-900">
            나에 대해 알려주세요.
          </Text>
          <Text size="body2" weight="regular" className="mt-3 text-gray-600">
            몇 가지 정보를 입력하고 맞춤 챌린지를 추천받아보세요.
          </Text>

          <div className="mt-6 flex justify-center lg:mt-8">
            <FormField
              control={form.control}
              name="img"
              render={({ field }) => (
                <FormItem className="mb-5">
                  <AvatarImagePicker
                    size={SIGN_UP_LEFT_VISUAL_SIZE}
                    defaultImageUrl={imgPreviewUrl}
                    changeLabel="사진 추가"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const file = event.target.files?.[0] || undefined;
                      field.onChange(file);
                      if (file) {
                        setImgPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="rounded-4 flex min-h-0 flex-col border border-gray-200 bg-white p-5 shadow-[0_8px_20px_rgba(34,34,34,0.04)] lg:max-h-[620px] lg:self-start lg:overflow-y-auto lg:p-6">
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TextField
                    label="닉네임"
                    placeholder="예: 챌린저123"
                    id="nickname"
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

          <div className="mt-5">
            <Text size="body2" weight="bold" className="mb-1 text-gray-800">
              생년월일
            </Text>
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full !min-w-0">
                          <SelectValue placeholder="년" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}년
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full !min-w-0">
                          <SelectValue placeholder="월" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {monthOptions.map((month) => (
                          <SelectItem key={month} value={String(month)}>
                            {month}월
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full !min-w-0">
                          <SelectValue placeholder="일" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dayOptions.map((day) => (
                          <SelectItem key={day} value={String(day)}>
                            {day}일
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="mt-5">
            <Text size="body2" weight="bold" className="mb-1 text-gray-800">
              성별
            </Text>
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
                        className="h-10 w-full justify-center px-0"
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

          <div className="mt-5">
            <Text size="body2" weight="bold" className="mb-1 text-gray-800">
              직업
            </Text>
            <FormField
              control={form.control}
              name="job"
              render={({ field }) => (
                <FormItem>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full !min-w-0">
                        <SelectValue placeholder="직업 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SIGN_UP_OCCUPATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-5">
            <Text size="body2" weight="bold" className="mb-1 text-gray-800">
              프로필 공개
            </Text>
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem>
                  <ToggleGroup
                    type="single"
                    value={field.value ? 'public' : 'private'}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value === 'public');
                      }
                    }}
                    className="grid grid-cols-2 gap-2"
                  >
                    <ToggleGroupItem
                      value="public"
                      shape="square"
                      className="h-10 w-full justify-center px-0"
                    >
                      공개
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="private"
                      shape="square"
                      className="h-10 w-full justify-center px-0"
                    >
                      비공개
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-8 flex justify-end">
            <Button type="button" size="medium" onClick={onNext}>
              다음 단계
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
