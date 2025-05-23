'use client';

import { useState } from 'react';
import { Step1 } from './components/steps/step1';
import { Step2 } from './components/steps/step2';
import { OdosButton } from '@/shared/components/odos-ui/button';
import { Step3 } from './components/steps/step3';
import { Step4 } from './components/steps/step4';
import { StepProgress } from './components/step-progress';

interface TmpFormData {
  title: string;
  type: string;
  // … 나머지 필드
}

export default function ChallengeCreate(): React.ReactElement {
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
      <StepProgress
        steps={['챌린지 제목 입력', '챌린지 유형 선택', '챌린지 기간 설정', '챌린지 세부정보 입력']}
        currentStep={step}
      ></StepProgress>
      {renderStep()}

      <div className="mt-8 flex gap-4">
        <OdosButton variant="outline" onClick={prev} disabled={step === 1}>
          이전
        </OdosButton>
        <OdosButton variant="default" onClick={next}>
          {step === totalSteps ? '완료' : '다음'}
        </OdosButton>
      </div>
    </div>
  );
}
