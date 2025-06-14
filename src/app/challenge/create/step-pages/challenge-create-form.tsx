import { ChallengeCreateDialog } from '@/features/challenge/presentation/components/challenge-create-dialog';
import { ChallengeCreateSuccessDialog } from '@/features/challenge/presentation/components/challenge-create-success-dialog';
import { ChallengeCreateFormValues } from '@/features/challenge/presentation/hooks/use-challenge-create-form';
import { OdosButton } from '@/shared/components/odos-ui/button';
import { Step1 } from './step1';
import { Step2 } from './step2';
import { Step3 } from './step3';
import { Step4 } from './step4';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useStepValidation } from '@/features/challenge/presentation/hooks/use-step-validation';

export function ChallengeCreateForm({
  step,
  totalSteps,
  nextStep,
  previousStep,
}: {
  step: number;
  totalSteps: number;
  nextStep(): void;
  previousStep(): void;
}): React.ReactElement {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
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

  const form = useFormContext<ChallengeCreateFormValues>();

  const isStepValid = useStepValidation(step);

  const onSubmit = (values: ChallengeCreateFormValues): void => {
    console.log('Form submitted with values:', values);
    setIsSuccessOpen(true);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex w-full flex-col items-center gap-6"
    >
      {renderStep()}

      <div className="mt-8 flex gap-4">
        <OdosButton variant="outline" type="button" onClick={previousStep} disabled={step === 1}>
          이전
        </OdosButton>
        <OdosButton
          variant="default"
          type="button"
          onClick={nextStep}
          hidden={step === totalSteps}
          disabled={!isStepValid}
        >
          다음
        </OdosButton>
        {step === totalSteps && (
          <ChallengeCreateDialog
            onConfirm={() => form.handleSubmit(onSubmit)()}
            disabled={!isStepValid}
          />
        )}
        <ChallengeCreateSuccessDialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen} />
      </div>
    </form>
  );
}
