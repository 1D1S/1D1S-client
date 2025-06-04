'use client';

import { useState } from 'react';
import { Step1 } from './step-pages/step1';
import { Step2 } from './step-pages/step2';
import { OdosButton } from '@/shared/components/odos-ui/button';
import { Step3 } from './step-pages/step3';
import { Step4 } from './step-pages/step4';
import { StepProgress } from './components/step-progress';
import { useChallengeCreateForm } from '@/features/challenge/presentation/hooks/use-challenge-create-form';
import { Form } from '@/shared/components/ui/form';

interface TmpFormData {
  title: string;
  type: string;
  // … 나머지 필드
}

export default function ChallengeCreate(): React.ReactElement {
  const form = useChallengeCreateForm();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<TmpFormData>({
    title: '',
    type: '',
  });

  const totalSteps = 4; // 실제 뷰 개수에 맞춰 변경

  const next = (): void => setStep((step) => Math.min(step + 1, totalSteps));
  const prev = (): void => setStep((step) => Math.max(step - 1, 1));

  // 뷰 컴포넌트를 step에 따라 선택
  const renderStep = (): React.ReactElement => {
    switch (step) {
      case 1:
        return (
          <Step1
            data={{ title: data.title }}
            onChange={(datas) => setData({ ...data, ...datas })}
          />
        );
      case 2:
        return (
          <Step2
            data={{ title: data.title }}
            onChange={(datas) => setData({ ...data, ...datas })}
          />
        );
      case 3:
        return (
          <Step3
            data={{ title: data.title }}
            onChange={(datas) => setData({ ...data, ...datas })}
          />
        );
      case 4:
        return (
          <Step4
            data={{ title: data.title }}
            onChange={(datas) => setData({ ...data, ...datas })}
          />
        );
      default:
        return (
          <Step1
            data={{ title: data.title }}
            onChange={(datas) => setData({ ...data, ...datas })}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white p-24">
      <StepProgress
        steps={['챌린지 정보', '챌린지 기간', '챌린지 인원', '목표']}
        currentStep={step}
      ></StepProgress>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(() => {})}
          className="flex w-full flex-col items-center gap-6"
        >
          {renderStep()}

          <div className="mt-8 flex gap-4">
            <OdosButton variant="outline" onClick={prev} disabled={step === 1}>
              이전
            </OdosButton>
            <OdosButton variant="default" onClick={next}>
              {step === totalSteps ? '완료' : '다음'}
            </OdosButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
