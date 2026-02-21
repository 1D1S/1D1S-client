import { Button, Text } from '@1d1s/design-system';
import { ChallengeCreateDialog } from '@feature/challenge/write/components/challenge-create-dialog';
import { ChallengeCreateSuccessDialog } from '@feature/challenge/write/components/challenge-create-success-dialog';
import { ChallengeCreateFormValues } from '@feature/challenge/write/hooks/use-challenge-create-form';
import { useStepValidation } from '@feature/challenge/write/hooks/use-step-validation';
import { add } from 'date-fns';
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
  const stepHeader: Record<number, { title: string; description: string }> = {
    1: {
      title: '기본 정보를 입력해주세요',
      description: '챌린지 이름, 카테고리, 설명을 설정합니다.',
    },
    2: {
      title: '기간을 정해주세요',
      description: '챌린지 운영 기간과 시작일을 설정합니다.',
    },
    3: {
      title: '참여 규칙을 정해주세요',
      description: '진행 방식과 참여 인원 규칙을 설정합니다.',
    },
    4: {
      title: '목표를 설정해주세요',
      description: '참여자가 달성할 목표를 추가합니다.',
    },
  };

  const form = useFormContext<ChallengeCreateFormValues>();
  const isStepValid = useStepValidation(step);
  const createChallenge = useCreateChallenge();

  const formatFormValues = (
    values: ChallengeCreateFormValues
  ): CreateChallengeRequest => ({
    title: values.title,
    // 'BOOK' 카테고리 싱크가 맞지 않음
    category: values.category as ChallengeCategory,
    description: values.description!,
    startDate: values.startDate!.toISOString(),
    // periodType === 'ENDLESS'일 때는 어떻게 대응해야 하는가
    // period 값이 있는 지를 확인하고, periodNumber로 대응되도록 해야 함
    endDate: add(values.startDate!, {
      days: Number(values.periodNumber),
    }).toISOString(),
    maxParticipantCnt: Number(
      values.memberCount === 'etc'
        ? values.memberCountNumber
        : values.memberCount
    ),
    // 싱크가 맞지 않는 부분 존재
    challengeType: values.goalType,
    goals: values.goals.map((goal) => goal.value),
  });

  const onSubmit = (values: ChallengeCreateFormValues): void => {
    console.log('폼 값:', values);
    // API 호출
    createChallenge.mutate(formatFormValues(values), {
      onSuccess: (data) => {
        console.log('createChallenge 성공:', data);
      },
      onError: (error) => {
        console.error('createChallenge 실패:', error);
      },
    });
    setIsSuccessOpen(true);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 w-full">
      <section className="rounded-4 border border-gray-200 bg-white p-8 md:p-10">
        <div className="flex flex-col text-center">
          <Text size="display2" weight="bold" className="text-gray-900">
            {stepHeader[step].title}
          </Text>
          <Text size="body1" weight="regular" className="mt-2 text-gray-600">
            {stepHeader[step].description}
          </Text>
        </div>

        <div className="mt-10">{renderStep()}</div>

        <div className="mt-12 flex items-center justify-between">
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
      </section>
      <ChallengeCreateSuccessDialog
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
      />
    </form>
  );
}
