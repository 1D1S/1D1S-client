'use client';

import { useState } from 'react';
import { StepProgress } from '@/features/challenge/presentation/components/step-progress';
import { useChallengeCreateForm } from '@/features/challenge/presentation/hooks/use-challenge-create-form';
import { Form } from '@/shared/components/ui/form';
import { OdosPageBackground } from '@/shared/components/odos-ui/page-background';
import { OdosPageTitle } from '@/shared/components/odos-ui/page-title';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';
import { ChallengeCreateForm } from './step-pages/challenge-create-form';

export default function ChallengeCreate(): React.ReactElement {
  const form = useChallengeCreateForm();
  const [step, setStep] = useState(1);
  const totalSteps = 4; // 실제 뷰 개수에 맞춰 변경

  const next = (): void => setStep((step) => Math.min(step + 1, totalSteps));
  const prev = (): void => setStep((step) => Math.max(step - 1, 1));

  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <OdosPageBackground className="flex min-h-screen min-w-250 flex-col items-center bg-white px-6">
          <OdosSpacing className="h-15" />
          <OdosPageTitle title="챌린지 생성" />
          <OdosSpacing className="h-20" />
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
        </OdosPageBackground>
      </div>
    </div>
  );
}
