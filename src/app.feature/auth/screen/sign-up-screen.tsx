'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  StepIndicator,
} from '@1d1s/design-system';
import { Form } from '@component/ui/form';
import { MEMBER_QUERY_KEYS } from '@feature/member/consts/queryKeys';
import { notifyApiError } from '@module/api/error';
import { authStorage } from '@module/utils/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

import { authApi } from '../api/authApi';
import { SignupFormValues, useSignUpForm } from '../hooks/useSignUpForm';
import { Step1 } from './step-pages/step1';
import { Step2 } from './step-pages/step2';

type Step = 1 | 2;
const SIGN_UP_STEPS = [
  { id: 'profile', label: '프로필 설정' },
  { id: 'topics', label: '관심 주제' },
];

function SignUpHeader({ onBack }: { onBack(): void }): React.ReactElement {
  return (
    <header className="h-14 border-b border-gray-200 bg-white px-4">
      <div className="relative flex h-full items-center">
        <button
          type="button"
          onClick={onBack}
          aria-label="가입 나가기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
        >
          <Icon name="ChevronLeft" size={20} />
        </button>
      </div>
    </header>
  );
}

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

      await authApi.completeSignUpInfo(
        {
          nickname: values.nickname,
          job: values.job,
          birth,
          gender: values.gender,
          isPublic: values.isPublic,
          category: values.topics,
          profileImageKey,
        }
      );

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

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 lg:overflow-y-auto">
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="gap-6 px-8 py-6 sm:max-w-[380px] sm:px-6">
          <DialogHeader className="items-center text-center sm:text-center">
            <DialogTitle>정말 나가시겠어요?</DialogTitle>
          </DialogHeader>
          <DialogDescription className="block w-full text-center">
            정보를 입력하지 않으면 서비스 사용이 어렵습니다.
          </DialogDescription>
          <DialogFooter className="flex-row gap-2">
            <Button
              size="medium"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowExitDialog(false)}
            >
              계속 입력하기
            </Button>
            <Button
              size="medium"
              className="flex-1"
              onClick={handleExitConfirm}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SignUpHeader onBack={handleBack} />

      <Form {...form}>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="mx-auto w-full max-w-[1080px] px-4 pt-10 pb-10">
            <StepIndicator
              steps={SIGN_UP_STEPS}
              currentStep={step}
              size="sm"
              className="w-full"
            />
          </div>

          {step === 1 ? (
            <Step1 onNext={handleNextStep} />
          ) : (
            <Step2
              onPrev={() => setStep(1)}
              onSubmit={() => void form.handleSubmit(onSubmit)()}
              isSubmitting={isSubmitting}
            />
          )}
        </form>
      </Form>
    </div>
  );
}
