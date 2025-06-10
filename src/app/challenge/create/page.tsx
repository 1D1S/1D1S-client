'use client';

import { useState } from 'react';
import { Step1 } from './step-pages/step1';
import { Step2 } from './step-pages/step2';
import { OdosButton } from '@/shared/components/odos-ui/button';
import { Step3 } from './step-pages/step3';
import { Step4 } from './step-pages/step4';
import { StepProgress } from '@/features/challenge/presentation/components/step-progress';
import {
  ChallengeCreateFormValues,
  useChallengeCreateForm,
} from '@/features/challenge/presentation/hooks/use-challenge-create-form';
import { Form } from '@/shared/components/ui/form';
import { OdosPageBackground } from '@/shared/components/odos-ui/page-background';

export default function ChallengeCreate(): React.ReactElement {
  const form = useChallengeCreateForm();
  const [step, setStep] = useState(1);
  const totalSteps = 4; // 실제 뷰 개수에 맞춰 변경

  const next = (): void => setStep((step) => Math.min(step + 1, totalSteps));
  const prev = (): void => setStep((step) => Math.max(step - 1, 1));

  // 뷰 컴포넌트를 step에 따라 선택
  const renderStep = (): React.ReactElement => {
    switch (step) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      default:
        return <Step1 />;
    }
  };

  const onSubmit = (values: ChallengeCreateFormValues): void => {
    console.log('Form submitted with values:', values);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <OdosPageBackground className="flex min-h-screen min-w-250 flex-col items-center justify-center bg-white px-6">
          <StepProgress
            steps={['챌린지 정보', '챌린지 기간', '챌린지 인원', '목표']}
            currentStep={step}
          />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full flex-col items-center gap-6"
            >
              {renderStep()}

              <div className="mt-8 flex gap-4">
                <OdosButton variant="outline" type="button" onClick={prev} disabled={step === 1}>
                  이전
                </OdosButton>
                <OdosButton
                  variant="default"
                  type="button"
                  onClick={next}
                  hidden={step === totalSteps}
                >
                  다음
                </OdosButton>
                <OdosButton variant="default" type="submit" hidden={step !== totalSteps}>
                  완료
                </OdosButton>
              </div>
            </form>
          </Form>
        </OdosPageBackground>
      </div>
    </div>
  );
}
