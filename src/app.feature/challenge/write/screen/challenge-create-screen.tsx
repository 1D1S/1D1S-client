'use client';

import { StepIndicator, Text } from '@1d1s/design-system';
import { Form } from '@component/ui/form';
import { useChallengeCreateForm } from '@feature/challenge/write/hooks/use-challenge-create-form';
import { useState } from 'react';

import { ChallengeCreateFormScreen } from './challenge-create-form-screen';

export default function ChallengeCreateScreen(): React.ReactElement {
  const form = useChallengeCreateForm();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const steps = [
    { id: 'basic', label: '기본 정보' },
    { id: 'duration', label: '기간 설정' },
    { id: 'members', label: '참여 규칙' },
    { id: 'goals', label: '목표 설정' },
  ];

  const next = (): void => setStep((step) => Math.min(step + 1, totalSteps));
  const prev = (): void => setStep((step) => Math.max(step - 1, 1));

  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <section className="rounded-3 w-full bg-white p-2">
        <div className="flex items-start justify-between border-b border-gray-200 pb-5">
          <div className="flex flex-col gap-2">
            <Text size="display1" weight="bold" className="text-gray-900">
              챌린지 생성
            </Text>
            <Text size="body1" weight="regular" className="text-gray-600">
              새 챌린지를 단계별로 설정해보세요.
            </Text>
          </div>
        </div>
        <div className="mt-6 mb-4">
          <StepIndicator steps={steps} currentStep={step} />
        </div>
        <Form {...form}>
          <ChallengeCreateFormScreen
            step={step}
            totalSteps={totalSteps}
            nextStep={next}
            previousStep={prev}
          />
        </Form>
      </section>
    </div>
  );
}
