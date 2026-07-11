'use client';

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  MobileHeader,
  Text,
} from '@1d1s/design-system';
import { MobileBottomActionBar } from '@component/layout/MobileBottomActionBar';
import { Form } from '@component/ui/Form';
import { useCreateChallenge } from '@feature/challenge/detail/hooks/useChallengeMutations';
import { ChallengeCreateBannerSection } from '@feature/challenge/write/components/ChallengeCreateBannerSection';
import { ChallengeCreateDialog } from '@feature/challenge/write/components/ChallengeCreateDialog';
import { ChallengeCreateGoalSection } from '@feature/challenge/write/components/ChallengeCreateGoalSection';
import { ChallengeCreateParticipationSection } from '@feature/challenge/write/components/ChallengeCreateParticipationSection';
import { ChallengeCreatePeriodSection } from '@feature/challenge/write/components/ChallengeCreatePeriodSection';
import { ChallengeCreatePhotoSection } from '@feature/challenge/write/components/ChallengeCreatePhotoSection';
import { ChallengeCreatePostEndWriteSection } from '@feature/challenge/write/components/ChallengeCreatePostEndWriteSection';
import { ChallengeCreatePreviewCard } from '@feature/challenge/write/components/ChallengeCreatePreviewCard';
import { ChallengeCreateSuccessDialog } from '@feature/challenge/write/components/ChallengeCreateSuccessDialog';
import { ChallengeCreateVisibilitySection } from '@feature/challenge/write/components/ChallengeCreateVisibilitySection';
import {
  ChallengeCreateFormValues,
  useChallengeCreateForm,
} from '@feature/challenge/write/hooks/useChallengeCreateForm';
import { formatFormValues } from '@feature/challenge/write/utils/challengeCreatePayload';
import { cn } from '@module/utils/cn';
import { Check, Lightbulb, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ChallengeCreateScreen(): React.ReactElement {
  const router = useRouter();
  const form = useChallengeCreateForm();
  const createChallenge = useCreateChallenge();
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdChallengeId, setCreatedChallengeId] = useState<number>();
  // 생성 직후 공유 모달에서 비공개 여부/비밀번호를 안내하기 위해 보관한다.
  const [createdIsPrivate, setCreatedIsPrivate] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string>();
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const onSubmit = (values: ChallengeCreateFormValues): void => {
    const payload = formatFormValues(values);
    createChallenge.mutate(payload, {
      onSuccess: (data) => {
        setCreatedChallengeId(data.challengeId);
        setCreatedIsPrivate(payload.challengeType === 'PRIVATE');
        setCreatedPassword(payload.password);
        setIsSuccessOpen(true);
      },
      onError: () => {
        setIsErrorOpen(true);
      },
    });
  };

  const canSubmit = form.formState.isValid && !createChallenge.isPending;

  return (
    <div className={cn('pb-mobile-action-bar min-h-screen w-full')}>
      <MobileHeader title="챌린지 만들기" onBack={() => router.back()} />

      <Form {...form}>
        <div
          className={cn(
            'mx-auto w-full max-w-[1200px]',
            'px-5 py-5 lg:px-8 lg:py-10'
          )}
        >
          <header className="hidden flex-col gap-1.5 pb-6 lg:flex lg:pb-8">
            <Text
              size="pageTitle"
              weight="extrabold"
              className="tracking-tight text-gray-900"
            >
              챌린지 만들기
            </Text>
            <Text size="body2" weight="regular" className="text-gray-500">
              습관이 될 도전을 직접 디자인해 보세요.
            </Text>
          </header>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              'grid grid-cols-1 gap-6',
              'lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-7'
            )}
          >
            <div className="flex min-w-0 flex-col gap-4">
              <ChallengeCreateBannerSection />
              <ChallengeCreateParticipationSection />
              <ChallengeCreateGoalSection />
              <ChallengeCreatePeriodSection />
              <ChallengeCreateVisibilitySection />
              <ChallengeCreatePhotoSection />
              <ChallengeCreatePostEndWriteSection />
            </div>

            <aside className="hidden lg:block">
              <div className="lg:sticky lg:top-[78px]">
                <Text
                  size="caption2"
                  weight="extrabold"
                  className={cn(
                    'mb-2.5 block tracking-[0.5px]',
                    'text-gray-500 uppercase'
                  )}
                >
                  실시간 미리보기
                </Text>
                <ChallengeCreatePreviewCard />
                <div
                  className={cn(
                    'rounded-3 mt-3 border border-dashed border-gray-300',
                    'bg-white px-3.5 py-3 text-[11px] leading-relaxed',
                    'text-gray-600'
                  )}
                >
                  <div
                    className={cn(
                      'mb-1 flex items-center gap-1',
                      'font-extrabold text-gray-900'
                    )}
                  >
                    <Lightbulb className="h-3.5 w-3.5" />팁
                  </div>
                  제목은 동사로 시작하면 클릭률이 높아요. 예) “매일 30분 책
                  읽기”
                </div>
              </div>
            </aside>
          </form>
        </div>

        <MobileBottomActionBar
          hideOnDesktop={false}
          className={cn(
            'border-gray-200 px-0 pt-0',
            'shadow-[0_-4px_20px_rgba(0,0,0,0.04)]'
          )}
        >
          <div
            className={cn(
              'mx-auto flex w-full max-w-[1200px] items-center gap-3',
              'px-4 py-3 lg:px-8'
            )}
          >
            <Text
              size="caption1"
              weight="medium"
              className={cn(
                'hidden items-center gap-1 text-gray-600 lg:inline-flex',
                canSubmit && 'text-main-800 font-bold'
              )}
            >
              {canSubmit ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  입력 완료 · 만들 준비가 됐어요
                </>
              ) : (
                '필수 항목을 입력해 주세요'
              )}
            </Text>
            <div className="w-full lg:ml-auto lg:w-auto">
              <ChallengeCreateDialog
                onConfirm={() => form.handleSubmit(onSubmit)()}
                disabled={!canSubmit}
                triggerText={
                  canSubmit ? '챌린지 만들기' : '제목 · 내 목표를 입력해 주세요'
                }
                triggerClassName="w-full lg:w-auto"
              />
            </div>
          </div>
        </MobileBottomActionBar>
      </Form>

      {createChallenge.isPending && (
        <div
          className={cn(
            'fixed inset-0 z-[60] flex items-center justify-center',
            'bg-black/30 backdrop-blur-sm'
          )}
          role="alert"
          aria-busy="true"
        >
          <div
            className={cn(
              'rounded-3 flex flex-col items-center gap-3 bg-white',
              'px-8 py-7 shadow-xl'
            )}
          >
            <Loader2 className="text-main-700 h-8 w-8 animate-spin" />
            <Text size="body2" weight="medium" className="text-gray-600">
              챌린지를 만들고 있어요...
            </Text>
          </div>
        </div>
      )}

      <ChallengeCreateSuccessDialog
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
        challengeId={createdChallengeId}
        isPrivate={createdIsPrivate}
        password={createdPassword}
      />

      <Dialog open={isErrorOpen} onOpenChange={setIsErrorOpen}>
        <DialogContent className="flex flex-col gap-4 p-6 sm:max-w-[360px]">
          <DialogTitle className="text-center font-bold text-black">
            문제가 발생했습니다
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            챌린지 만들기 중 오류가 발생했습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </DialogDescription>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button variant="primary" type="button" className="w-full">
                확인
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
