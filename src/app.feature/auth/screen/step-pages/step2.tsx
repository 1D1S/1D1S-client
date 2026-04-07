'use client';

import { Button, CheckContainer, Text } from '@1d1s/design-system';
import { FormField, FormItem, FormMessage } from '@component/ui/form';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { SIGN_UP_TOPIC_OPTIONS } from '../../consts/sign-up-options';
import { SignupFormValues } from '../../hooks/use-sign-up-form';

const SIGN_UP_LEFT_VISUAL_SLOT_HEIGHT = 280;

interface Step2Props {
  onPrev(): void;
  onSubmit(): void;
  isSubmitting: boolean;
}

export function Step2({
  onPrev,
  onSubmit,
  isSubmitting,
}: Step2Props): React.ReactElement {
  const form = useFormContext<SignupFormValues>();
  const selectedTopics = form.watch('topics') ?? [];

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-1 items-stretch px-4 pb-5">
      <div className="grid w-full gap-6 lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex min-h-0 flex-col pt-2 text-left">
          <Text size="display2" weight="bold" className="text-gray-900">
            어떤 주제에 관심이 있나요?
          </Text>
          <Text size="body2" weight="regular" className="mt-3 text-gray-600">
            도전하고 싶은 관심 주제를 선택해주세요.
          </Text>
          <div
            aria-hidden
            className="mt-6 hidden lg:mt-8 lg:block"
            style={{ height: SIGN_UP_LEFT_VISUAL_SLOT_HEIGHT }}
          />
        </section>

        <section className="rounded-4 flex min-h-0 flex-col border border-gray-200 bg-white p-5 shadow-[0_8px_20px_rgba(34,34,34,0.04)] lg:max-h-[620px] lg:self-start lg:overflow-y-auto lg:p-6">
          <FormField
            control={form.control}
            name="topics"
            render={({ field }) => (
              <FormItem>
                <Text
                  size="body2"
                  weight="regular"
                  className="mb-3 text-gray-500"
                >
                  최대 3개까지 선택할 수 있어요.
                </Text>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  {SIGN_UP_TOPIC_OPTIONS.map((option) => {
                    const checked = Array.isArray(selectedTopics)
                      ? selectedTopics.includes(option.value)
                      : false;
                    const isMaxReached = selectedTopics.length >= 3;

                    return (
                      <CheckContainer
                        key={option.value}
                        type="button"
                        checked={checked}
                        disabled={!checked && isMaxReached}
                        onCheckedChange={(nextChecked) => {
                          const currentTopics = Array.isArray(
                            form.getValues('topics')
                          )
                            ? form.getValues('topics')
                            : [];
                          if (nextChecked && currentTopics.length >= 3) {
                            return;
                          }
                          const nextTopics = nextChecked
                            ? Array.from(
                                new Set([...currentTopics, option.value])
                              )
                            : currentTopics.filter(
                                (topic) => topic !== option.value
                              );

                          field.onChange(nextTopics);
                        }}
                        width="100%"
                        height={96}
                        showCheckIndicator
                        className="rounded-3 w-full min-w-0 px-3"
                      >
                        <div className="flex w-full flex-col items-center justify-center gap-2">
                          <span className="text-xl leading-none">
                            {option.icon}
                          </span>
                          <Text
                            size="body2"
                            weight="medium"
                            className="text-gray-700"
                          >
                            {option.label}
                          </Text>
                        </div>
                      </CheckContainer>
                    );
                  })}
                </div>
                <div className="mt-4 text-left">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              type="button"
              size="medium"
              variant="outlined"
              disabled={isSubmitting}
              onClick={onPrev}
            >
              이전 단계
            </Button>
            <Button
              type="button"
              size="medium"
              disabled={isSubmitting}
              onClick={onSubmit}
            >
              {isSubmitting ? '처리 중...' : '가입 완료'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
