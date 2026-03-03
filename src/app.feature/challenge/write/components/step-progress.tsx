'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React, { memo } from 'react';

interface StepIndicatorProps {
  step: number;
  label: string;
  isActive: boolean;
}

/**
 * @param step - 표시할 스텝 번호(1부터 시작)
 * @param label - 스텝에 대한 설명 또는 이름
 * @param isActive - 해당 스텝이 활성 상태(진행 중 또는 완료)인지 여부
 *
 * @example
 * <StepIndicator step={2} label="정보 입력" isActive={true} />
 */
const StepIndicator = memo<StepIndicatorProps>(({ step, label, isActive }) => (
  <div className="flex flex-1 items-center justify-start gap-2">
    <div
      className={cn(
        'inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-sm font-medium transition-colors duration-300',
        isActive ? 'bg-main-900 text-white' : 'bg-gray-200 text-gray-500'
      )}
    >
      {step}
    </div>
    <Text
      className={cn(isActive ? 'text-gray-900' : 'text-gray-500')}
      size="caption1"
      weight={isActive ? 'bold' : 'medium'}
    >
      {label}
    </Text>
  </div>
));
StepIndicator.displayName = 'StepIndicator';

interface ProgressBarProps {
  total: number;
  current: number;
}

/**
 * @param total - 전체 스텝의 개수
 * @param current - 현재 진행 중인(강조할) 스텝 번호(1부터 시작)
 *
 * @example
 * <ProgressBar total={4} current={2} />
 */
const ProgressBar = memo<ProgressBarProps>(({ total, current }) => (
  <div className="flex items-center">
    {Array.from({ length: total }).map((label, idx) => {
      const step = idx + 1;
      return (
        <div
          key={idx}
          className={cn(
            'mx-1 h-2.5 flex-1 rounded transition-colors duration-300 ease-in-out',
            step < current
              ? 'bg-main-900'
              : step === current
                ? 'bg-main-900 animate-glow'
                : 'bg-gray-200'
          )}
        />
      );
    })}
  </div>
));
ProgressBar.displayName = 'ProgressBar';

/**
 * @param steps - 각 스텝의 라벨(이름) 배열
 * @param currentStep - 현재 진행 중인(강조할) 스텝 번호(1부터 시작)
 *
 * @example
 * <StepProgress
 *   steps={['정보 입력', '미션 설정', '미리보기', '완료']}
 *   currentStep={2}
 * />
 */

interface StepProgressProps {
  steps: string[];
  currentStep: number;
}

export const StepProgress = memo<StepProgressProps>(
  ({ steps, currentStep }) => (
    <div className="w-full">
      {/* 스텝 라벨과 숫자 */}
      <div className="mx-1 mb-2 flex justify-between gap-2 text-sm text-gray-600">
        {steps.map((label, idx) => {
          const step = idx + 1;
          const isActive = step <= currentStep;
          return (
            <StepIndicator
              key={step}
              step={step}
              label={label}
              isActive={isActive}
            />
          );
        })}
      </div>

      {/* 진행 막대 */}
      <ProgressBar total={steps.length} current={currentStep} />
    </div>
  )
);
StepProgress.displayName = 'StepProgress';
