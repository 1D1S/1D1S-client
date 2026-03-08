import { Button } from '@1d1s/design-system';
import { ChallengeCreateDialog } from '@feature/challenge/write/components/challenge-create-dialog';
import { ChallengeCreateSuccessDialog } from '@feature/challenge/write/components/challenge-create-success-dialog';
import { ChallengeCreateFormValues } from '@feature/challenge/write/hooks/use-challenge-create-form';
import { useStepValidation } from '@feature/challenge/write/hooks/use-step-validation';
import { add, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  ChallengeCategory,
  CreateChallengeRequest,
} from '../../board/type/challenge';
import { useCreateChallenge } from '../../detail/hooks/use-challenge-mutations';
import { Step1 } from './step-pages/step1';
import { Step2 } from './step-pages/step2';
import { Step3 } from './step-pages/step3';
import { Step4 } from './step-pages/step4';

const ENDLESS_CHALLENGE_END_DATE = '9999-12-31';

function resolveChallengeDurationDays(
  values: ChallengeCreateFormValues
): number {
  if (values.periodType !== 'LIMITED') {
    return 0;
  }

  const rawDays = values.period === 'etc' ? values.periodNumber : values.period;
  const parsedDays = Number(rawDays);
  if (Number.isNaN(parsedDays)) {
    return 7;
  }

  return Math.max(1, parsedDays);
}

export function ChallengeCreateFormScreen({
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
  const router = useRouter();

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
  const createChallenge = useCreateChallenge();

  const formatFormValues = (
    values: ChallengeCreateFormValues
  ): CreateChallengeRequest => {
    const safeStartDate = values.startDate
      ? new Date(values.startDate)
      : new Date();
    const challengeDurationDays = resolveChallengeDurationDays(values);
    const endDate =
      values.periodType === 'ENDLESS'
        ? ENDLESS_CHALLENGE_END_DATE
        : format(
            add(safeStartDate, {
              days: challengeDurationDays,
            }),
            'yyyy-MM-dd'
          );

    return {
      title: values.title,
      // 'BOOK' 카테고리 싱크가 맞지 않음
      category: values.category as ChallengeCategory,
      description: values.description!,
      startDate: format(safeStartDate, 'yyyy-MM-dd'),
      endDate,
      maxParticipantCnt: Number(
        values.memberCount === 'etc'
          ? values.memberCountNumber
          : values.memberCount
      ),
      // 싱크가 맞지 않는 부분 존재
      challengeType: values.goalType,
      goals: values.goals.map((goal) => goal.value),
    };
  };

  const onSubmit = (values: ChallengeCreateFormValues): void => {
    console.log('폼 값:', values);
    // API 호출
    createChallenge.mutate(formatFormValues(values), {
      onSuccess: (data) => {
        console.log('createChallenge 성공:', data);
        router.push(`/challenge/${data.challengeId}`);
      },
      onError: (error) => {
        console.error('createChallenge 실패:', error);
      },
    });
    setIsSuccessOpen(true);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <section className="rounded-4 border border-gray-200 bg-white">
        <div className="p-5 md:p-6">
          <div>{renderStep()}</div>

          <div className="mt-6 flex items-center justify-between">
            {step === 1 ? (
              <div />
            ) : (
              <Button
                variant="ghost"
                size="small"
                type="button"
                onClick={previousStep}
                className="px-4"
              >
                이전 단계
              </Button>
            )}

            {step < totalSteps ? (
              <Button
                variant="default"
                size="small"
                type="button"
                onClick={nextStep}
                disabled={!isStepValid}
                className="px-5"
              >
                다음 단계
              </Button>
            ) : (
              <ChallengeCreateDialog
                onConfirm={() => form.handleSubmit(onSubmit)()}
                disabled={!isStepValid}
                triggerText="챌린지 생성"
              />
            )}
          </div>
        </div>
      </section>
      <ChallengeCreateSuccessDialog
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
      />
    </form>
  );
}
