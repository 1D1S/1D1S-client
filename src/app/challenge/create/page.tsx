'use client';

import { useState } from 'react';
import { StepProgress } from '@feature/challenge/presentation/components/step-progress';
import { useChallengeCreateForm } from '@feature/challenge/presentation/hooks/use-challenge-create-form';
import { Form } from '@component/ui/form';
import { PageTitle, Spacing } from '@1d1s/design-system';
import { ChallengeCreateForm } from './step-pages/challenge-create-form';

export default function ChallengeCreate(): React.ReactElement {
  const form = useChallengeCreateForm();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const next = (): void => setStep((step) => Math.min(step + 1, totalSteps));
  const prev = (): void => setStep((step) => Math.max(step - 1, 1));

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="flex w-full flex-col items-center px-4">
        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageTitle title="챌린지 생성" />
        </div>
        <Spacing className="h-8" />
        <StepProgress
          steps={['챌린지 정보', '챌린지 기간', '챌린지 인원', '목표']}
          currentStep={step}
        />
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
