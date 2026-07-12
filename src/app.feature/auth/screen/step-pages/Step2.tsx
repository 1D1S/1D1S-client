'use client';

import { Button, CheckContainer, Icon, Text } from '@1d1s/design-system';
import { FormField, FormItem, FormMessage } from '@component/ui/Form';
import { cn } from '@module/utils/cn';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { SIGN_UP_TOPIC_OPTIONS } from '../../consts/signUpOptions';
import { SignupFormValues } from '../../hooks/useSignUpForm';
import type { CategoryType } from '../../type/auth';

interface Step2Props {
  onPrev(): void;
  onSubmit(): void;
  isSubmitting: boolean;
}

const TOPIC_TONE: Record<CategoryType, string> = {
  DEV: 'bg-[#dff5b8]',
  EXERCISE: 'bg-[#ffccbc]',
  BOOK: 'bg-[#c8f4e1]',
  DIET: 'bg-[#fff3e0]',
  HEALTH: 'bg-[#d7f8ea]',
  HOBBY: 'bg-[#fde0ef]',
  LANGUAGE: 'bg-[#deecfb]',
  SELF_DEV: 'bg-[#e5e6fb]',
  ETC: 'bg-[#eceef1]',
};

const MAX_SELECTABLE_TOPICS = 3;

export function Step2({
  onPrev,
  onSubmit,
  isSubmitting,
}: Step2Props): React.ReactElement {
  const form = useFormContext<SignupFormValues>();
  const selectedTopics = form.watch('topics') ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <FormField
        control={form.control}
        name="topics"
        render={({ field }) => (
          <FormItem>
            <Text
              size="caption1"
              weight="regular"
              as="div"
              className="mb-3 text-gray-500"
            >
              관심 주제를 선택하면 더 정확한 챌린지를 추천해드려요 ·{' '}
              <span className="text-main-800 font-extrabold">
                {selectedTopics.length}개 선택
              </span>{' '}
              <span className="text-gray-400">
                (최대 {MAX_SELECTABLE_TOPICS}개)
              </span>
            </Text>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {SIGN_UP_TOPIC_OPTIONS.map((option) => {
                const checked = Array.isArray(selectedTopics)
                  ? selectedTopics.includes(option.value)
                  : false;
                const isMaxReached =
                  selectedTopics.length >= MAX_SELECTABLE_TOPICS;
                const tone = TOPIC_TONE[option.value as CategoryType];

                return (
                  <CheckContainer
                    key={option.value}
                    type="button"
                    checked={checked}
                    disabled={!checked && isMaxReached}
                    showCheckIndicator
                    onCheckedChange={(nextChecked) => {
                      const currentTopics = Array.isArray(
                        form.getValues('topics')
                      )
                        ? form.getValues('topics')
                        : [];
                      if (
                        nextChecked &&
                        currentTopics.length >= MAX_SELECTABLE_TOPICS
                      ) {
                        return;
                      }
                      const nextTopics = nextChecked
                        ? Array.from(new Set([...currentTopics, option.value]))
                        : currentTopics.filter(
                            (topic) => topic !== option.value
                          );

                      field.onChange(nextTopics);
                    }}
                    width="100%"
                    className={cn(
                      'rounded-3 aspect-square w-full min-w-0 px-2',
                      'flex flex-col items-center justify-center gap-1.5',
                      'transition-colors',
                      checked ? tone : 'bg-gray-50'
                    )}
                  >
                    <Icon
                      name={option.iconName}
                      className="h-7 w-7 text-gray-800"
                    />
                    <Text
                      size="caption1"
                      weight="bold"
                      className="text-gray-800"
                    >
                      {option.label}
                    </Text>
                  </CheckContainer>
                );
              })}
            </div>
            <div className="mt-3 text-left">
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <div className="mt-8 flex items-center gap-2.5">
        <Button
          type="button"
          size="lg"
          variant="secondary"
          disabled={isSubmitting}
          onClick={onPrev}
          className="w-[120px] flex-shrink-0"
        >
          이전
        </Button>
        <Button
          type="button"
          size="lg"
          fullWidth
          disabled={isSubmitting || selectedTopics.length === 0}
          onClick={onSubmit}
        >
          {isSubmitting ? '처리 중...' : '가입 완료 · 첫 챌린지 보기'}
        </Button>
      </div>
    </div>
  );
}
