'use client';

import {
  ConfirmDialog,
  Icon,
  StepIndicator,
  Text,
} from '@1d1s/design-system';
import { Form } from '@component/ui/Form';
import { MEMBER_QUERY_KEYS } from '@feature/member/consts/queryKeys';
import { notifyApiError } from '@module/api/error';
import { authStorage } from '@module/utils/auth';
import { cn } from '@module/utils/cn';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

import { authApi } from '../api/authApi';
import { BrandPanel } from '../components/BrandPanel';
import { SignupFormValues, useSignUpForm } from '../hooks/useSignUpForm';
import { Step1 } from './step-pages/Step1';
import { Step2 } from './step-pages/Step2';

type Step = 1 | 2;

const SIGN_UP_STEPS = [
  { id: 'profile', label: '프로필 정보' },
  { id: 'topics', label: '관심 카테고리' },
];

interface StepHeading {
  eyebrow: string;
  title: string;
  sub: string;
}

const STEP_HEADINGS: Record<Step, StepHeading> = {
  1: {
    eyebrow: 'STEP 01 / 02',
    title: '프로필을 알려주세요',
    sub: '또래·관심사 기반 챌린지 추천에 사용돼요',
  },
  2: {
    eyebrow: 'STEP 02 / 02',
    title: '어떤 챌린지에 관심 있으세요?',
    sub: '관심사 기반으로 첫 챌린지를 골라드릴게요',
  },
};

export function SignUpScreen(): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useSignUpForm();
  const [step, setStep] = React.useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showExitDialog, setShowExitDialog] = React.useState(false);

  const onSubmit = async (values: SignupFormValues): Promise<void> => {
    if (!authStorage.hasTokens()) {
      toast.error('로그인이 필요합니다.');
      router.replace('/login');
      return;
    }

    const birth = `${values.year}-${values.month.padStart(2, '0')}-${values.day.padStart(2, '0')}`;

    setIsSubmitting(true);
    try {
      let profileImageKey: string | undefined;

      if (values.img) {
        const { data: presigned } = await authApi.getPresignedUrl({
          fileName: values.img.name,
          fileType: values.img.type,
        });
        // iOS에서 HEIC 등 일부 포맷은 file.type이 빈 문자열일 수 있음
        await fetch(presigned.presignedUrl, {
          method: 'PUT',
          body: values.img,
          headers: { 'Content-Type': values.img.type || 'image/jpeg' },
        });
        profileImageKey = presigned.objectKey;
      }

      await authApi.completeSignUpInfo({
        nickname: values.nickname,
        job: values.job,
        birth,
        gender: values.gender,
        isPublic: values.isPublic,
        category: values.topics,
        profileImageKey,
      });

      toast.success('가입이 완료되었습니다!');
      await queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.sidebar(),
      });
      router.replace('/');
    } catch (error) {
      notifyApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = (): void => {
    if (step === 2) {
      setStep(1);
      return;
    }

    setShowExitDialog(true);
  };

  const handleExitConfirm = (): void => {
    setShowExitDialog(false);
    authStorage.clearTokens();
    router.replace('/');
  };

  const handleNextStep = async (): Promise<void> => {
    const stepOneValid = await form.trigger([
      'nickname',
      'year',
      'month',
      'day',
      'gender',
      'job',
    ]);

    if (!stepOneValid) {
      return;
    }

    setStep(2);
  };

  const heading = STEP_HEADINGS[step];

  return (
    <div
      className={cn(
        'grid min-h-screen w-full grid-cols-1 bg-white',
        'lg:grid-cols-[1.05fr_1fr]'
      )}
    >
      <ConfirmDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        tone="danger"
        icon="Close"
        title="정말 나가시겠어요?"
        description="정보를 입력하지 않으면 서비스 사용이 어렵습니다."
        confirmLabel="확인"
        cancelLabel="계속 입력하기"
        onConfirm={handleExitConfirm}
      />

      <BrandPanel
        heading={'당신의 첫 챌린지가\n곧 시작됩니다'}
        subtitle={
          'SNS로 가입하셨네요!\n프로필 정보만 입력하면 바로 시작할 수 있어요.'
        }
      />

      <section className="relative flex min-h-screen flex-col">
        <header
          className={cn(
            'flex h-14 items-center justify-between border-b border-gray-100',
            'bg-white px-4 lg:hidden'
          )}
        >
          <button
            type="button"
            onClick={handleBack}
            aria-label="가입 나가기"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full',
              'text-gray-700 transition hover:bg-gray-100'
            )}
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
          <Text size="caption1" weight="regular" className="text-gray-500">
            {step}/2
          </Text>
        </header>

        <Text
          size="caption1"
          weight="regular"
          as="div"
          className={cn(
            'absolute top-7 right-8 hidden text-gray-600 lg:block'
          )}
        >
          이미 계정이 있으세요?{' '}
          <Link
            href="/login"
            className="text-main-800 ml-1 font-extrabold hover:underline"
          >
            로그인 →
          </Link>
        </Text>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div
              className={cn(
                'mx-auto flex w-full max-w-[460px] flex-1 flex-col',
                'px-5 pt-6 pb-10 lg:px-0 lg:pt-16'
              )}
            >
              <StepIndicator
                steps={SIGN_UP_STEPS}
                currentStep={step}
                size="sm"
                className="mb-6 w-full"
              />

              <Text
                size="caption2"
                weight="extrabold"
                as="div"
                className="text-main-800 mb-1.5 tracking-[0.2em]"
              >
                {heading.eyebrow}
              </Text>
              <Text
                size="display2"
                weight="extrabold"
                as="h1"
                className="block tracking-tight text-gray-900"
              >
                {heading.title}
              </Text>
              <Text
                size="body2"
                weight="regular"
                as="p"
                className="mt-2 mb-6 block text-gray-500"
              >
                {heading.sub}
              </Text>

              {step === 1 ? (
                <Step1 onNext={handleNextStep} />
              ) : (
                <Step2
                  onPrev={() => setStep(1)}
                  onSubmit={() => void form.handleSubmit(onSubmit)()}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </form>
        </Form>
      </section>
    </div>
  );
}
