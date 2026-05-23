'use client';

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
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
import { ChallengeCreatePreviewCard } from '@feature/challenge/write/components/ChallengeCreatePreviewCard';
import { ChallengeCreateSuccessDialog } from '@feature/challenge/write/components/ChallengeCreateSuccessDialog';
import {
  ChallengeCreateFormValues,
  useChallengeCreateForm,
} from '@feature/challenge/write/hooks/useChallengeCreateForm';
import { cn } from '@module/utils/cn';
import { add, format } from 'date-fns';
import { ArrowLeft, Check, Lightbulb } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CreateChallengeRequest } from '../../board/type/challenge';

const ENDLESS_CHALLENGE_END_DATE = '9999-12-31';

function resolveChallengeDurationDays(
  values: ChallengeCreateFormValues
): number {
  if (values.periodType !== 'LIMITED') {
    return 0;
  }
  const raw = values.period === 'etc' ? values.periodNumber : values.period;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    return 7;
  }
  return Math.max(1, parsed);
}

function resolveMaxParticipantCnt(
  values: ChallengeCreateFormValues
): number | null {
  if (values.participationType !== 'GROUP') {
    return null;
  }
  if (values.memberCount === 'unlimited') {
    return null;
  }
  const raw =
    values.memberCount === 'etc'
      ? values.memberCountNumber
      : values.memberCount;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatFormValues(
  values: ChallengeCreateFormValues
): CreateChallengeRequest {
  const safeStartDate = values.startDate ?? new Date();
  const challengeDurationDays = resolveChallengeDurationDays(values);
  const endDate =
    values.periodType === 'ENDLESS'
      ? ENDLESS_CHALLENGE_END_DATE
      : format(
          add(safeStartDate, {
            days: Math.max(0, challengeDurationDays - 1),
          }),
          'yyyy-MM-dd'
        );

  return {
    title: values.title,
    category: values.category,
    description: values.description ?? '',
    startDate: format(safeStartDate, 'yyyy-MM-dd'),
    endDate,
    maxParticipantCnt: resolveMaxParticipantCnt(values),
    goalType: values.goalType,
    participationType: values.participationType,
    goals: values.goals.map((goal) => goal.value),
    allowMidJoin:
      values.participationType === 'INDIVIDUAL' ? false : values.allowMidJoin,
    thumbnailImage: values.thumbnailImageKey,
  };
}

export default function ChallengeCreateScreen(): React.ReactElement {
  const router = useRouter();
  const form = useChallengeCreateForm();
  const createChallenge = useCreateChallenge();
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdChallengeId, setCreatedChallengeId] = useState<number>();
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const onSubmit = (values: ChallengeCreateFormValues): void => {
    createChallenge.mutate(formatFormValues(values), {
      onSuccess: (data) => {
        setCreatedChallengeId(data.challengeId);
        setIsSuccessOpen(true);
      },
      onError: () => {
        setIsErrorOpen(true);
      },
    });
  };

  const canSubmit = form.formState.isValid && !createChallenge.isPending;

  return (
    <div
      className={cn(
        'min-h-screen w-full',
        'pb-[calc(6rem+env(safe-area-inset-bottom))]'
      )}
    >
      {/* 모바일 sticky 헤더 — ← + 챌린지 만들기 */}
      <div
        className={cn(
          'sticky top-0 z-30 flex items-center gap-3',
          'h-14-safe pt-safe-top',
          'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
          'lg:hidden'
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="body1"
          weight="extrabold"
          className="flex-1 tracking-[-0.3px] text-gray-900"
        >
          챌린지 만들기
        </Text>
      </div>

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

      <ChallengeCreateSuccessDialog
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
        challengeId={createdChallengeId}
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
              <Button variant="default" type="button" className="w-full">
                확인
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
