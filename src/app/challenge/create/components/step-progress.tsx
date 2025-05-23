'use client';

import { OdosLabel } from '@/shared/components/odos-ui/label';
import React from 'react';

interface StepProgressProps {
  steps: string[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps): React.ReactElement {
  return (
    <div className="w-full">
      {/* 스텝 라벨과 숫자 */}
      <div className="mx-4 mb-2 flex justify-between text-sm text-gray-600">
        {steps.map((label, idx) => {
          const step = idx + 1;
          const isActiveOrCompleted = step <= currentStep;
          return (
            <div key={step} className="flex flex-1 items-center justify-start">
              <span
                className={`mr-1 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full pl-0.5 text-sm font-medium ${
                  isActiveOrCompleted ? 'bg-main-900 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </span>
              <OdosLabel
                className={isActiveOrCompleted ? 'text-gray-900' : 'text-gray-500'}
                size={'caption1'}
                weight={isActiveOrCompleted ? 'bold' : 'medium'}
              >
                {label}
              </OdosLabel>
            </div>
          );
        })}
      </div>

      {/* 진행 막대 */}
      <div className="flex items-center">
        {steps.map((label, idx) => {
          const step = idx + 1;
          const barBase = 'flex-1 h-2 mx-1 rounded transition-colors duration-300 ease-in-out';
          const barStatus =
            step < currentStep
              ? 'bg-main-900'
              : step === currentStep
                ? 'bg-main-900 animate-glow'
                : 'bg-gray-200';
          return <div key={idx} className={`${barBase} ${barStatus}`} />;
        })}
      </div>
    </div>
  );
}
