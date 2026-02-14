'use client';

import { useState } from 'react';
import { useChallengeCreateForm } from '@feature/challenge/write/hooks/use-challenge-create-form';
import { Form } from '@component/ui/form';
import { StepIndicator, Text } from '@1d1s/design-system';
import { ChallengeCreateForm } from './challenge-create-form-screen';

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
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col px-6 pb-12 pt-10">
        <div className="text-center">
          <Text size="display1" weight="bold" className="text-gray-900">
            챌린지 생성
          </Text>
          <Text size="body1" weight="regular" className="mt-3 text-gray-600">
            새 챌린지를 단계별로 설정해보세요.
          </Text>
        </div>
        <div className="mt-10">
          <StepIndicator steps={steps} currentStep={step} />
        </div>
        <Form {...form}>
          <ChallengeCreateForm
            step={step}
            totalSteps={totalSteps}
            nextStep={next}
            previousStep={prev}
          />
        </Form>
      </div>
    </div>
  );
}
