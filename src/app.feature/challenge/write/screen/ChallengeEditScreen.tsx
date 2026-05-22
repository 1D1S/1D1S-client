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
import { Form } from '@component/ui/Form';
import { useChallengeDetail } from '@feature/challenge/board/hooks/useChallengeQueries';
import { isChallengeOngoing } from '@feature/challenge/board/utils/challengePeriod';
import { useUpdateChallenge } from '@feature/challenge/detail/hooks/useChallengeMutations';
import { ChallengeEditBannerSection } from '@feature/challenge/write/components/ChallengeEditBannerSection';
import { ChallengeEditDialog } from '@feature/challenge/write/components/ChallengeEditDialog';
import { ChallengeEditGoalSection } from '@feature/challenge/write/components/ChallengeEditGoalSection';
import { ChallengeEditParticipationSection } from '@feature/challenge/write/components/ChallengeEditParticipationSection';
import { ChallengeEditPeriodSection } from '@feature/challenge/write/components/ChallengeEditPeriodSection';
import { ChallengeEditPreviewCard } from '@feature/challenge/write/components/ChallengeEditPreviewCard';
import { ChallengeEditSuccessDialog } from '@feature/challenge/write/components/ChallengeEditSuccessDialog';
import {
  type ChallengeEditFormDefaults,
  type ChallengeEditFormValues,
  type EditableChallengeCategory,
  useChallengeEditForm,
} from '@feature/challenge/write/hooks/useChallengeEditForm';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import type {
  ChallengeDetailResponse,
  UpdateChallengeRequest,
} from '../../board/type/challenge';

const NOOP_SUBSCRIBE = (): (() => void) => () => {};

function resolveMemberCountDefaults(
  maxParticipantCnt: number | null | undefined,
  isGroup: boolean
): {
  memberCount?: ChallengeEditFormValues['memberCount'];
  memberCountNumber?: string;
} {
  if (!isGroup) {
    return {};
  }
  // GROUP 챌린지에서 maxParticipantCnt 가 null/undefined 면 "제한없음" 으로
  // 생성된 챌린지. 0/음수 같은 비정상 값도 같은 취급.
  if (maxParticipantCnt == null || maxParticipantCnt <= 0) {
    return { memberCount: 'unlimited' };
  }
  const presetSizes: Array<2 | 5 | 10> = [2, 5, 10];
  if (presetSizes.includes(maxParticipantCnt as 2 | 5 | 10)) {
    return { memberCount: String(maxParticipantCnt) as '2' | '5' | '10' };
  }
  if (maxParticipantCnt > 10) {
    return {
      memberCount: 'etc',
      memberCountNumber: String(maxParticipantCnt),
    };
  }
  return {
    memberCount: 'unlimited',
  };
}

function buildEditDefaults(
  data: ChallengeDetailResponse
): ChallengeEditFormDefaults {
  const summary = data.challengeSummary;
  const detail = data.challengeDetail;
  const goals = data.challengeGoals;
  // GROUP 여부는 participationType 으로 직접 판정한다. 이전엔
  // `maxParticipantCnt > 1` 로 추론했는데, "제한없음" 으로 만든 GROUP 챌린지는
  // maxParticipantCnt 가 null 이라 개인 챌린지로 잘못 인식되어 편집 화면이
  // INDIVIDUAL 로 떴다.
  const isGroup = summary.participationType === 'GROUP';
  const memberDefaults = resolveMemberCountDefaults(
    summary.maxParticipantCnt,
    isGroup
  );

  return {
    title: summary.title,
    category: summary.category as EditableChallengeCategory,
    description: detail.description ?? '',
    memberCount: memberDefaults.memberCount,
    memberCountNumber: memberDefaults.memberCountNumber,
    allowMidJoin: detail.allowMidJoin ?? false,
    thumbnailImageKey: undefined,
    thumbnailPreviewUrl: summary.thumbnailImage ?? undefined,
    goals: (goals ?? []).map((goal) => goal.content),
    participationType: summary.participationType,
    goalType: summary.goalType,
    isStarted: isChallengeOngoing(summary.startDate, summary.endDate),
  };
}

function buildUpdatePayload(
  values: ChallengeEditFormValues,
  defaults: ChallengeEditFormDefaults
): UpdateChallengeRequest {
  const payload: UpdateChallengeRequest = {};

  const trimmedTitle = values.title.trim();
  if (trimmedTitle !== defaults.title) {
    payload.title = trimmedTitle;
  }
  if (values.category !== defaults.category) {
    payload.category = values.category;
  }
  const trimmedDescription = (values.description ?? '').trim();
  if (trimmedDescription !== defaults.description) {
    payload.description = trimmedDescription;
  }
  if (values.isGroup && values.allowMidJoin !== defaults.allowMidJoin) {
    payload.allowMidJoin = values.allowMidJoin;
  }
  if (values.isGroup && !values.isStarted && values.memberCount !== 'unlimited') {
    const raw =
      values.memberCount === 'etc'
        ? values.memberCountNumber
        : values.memberCount;
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 2) {
      const previous =
        defaults.memberCount === 'etc'
          ? Number(defaults.memberCountNumber)
          : Number(defaults.memberCount);
      if (parsed !== previous) {
        payload.maxParticipantCnt = parsed;
      }
    }
  }
  if (values.isFixedGoal && !values.isStarted) {
    const nextGoals = values.goals
      .map((goal) => goal.value.trim())
      .filter(Boolean);
    const prevGoals = defaults.goals.map((goal) => goal.trim()).filter(Boolean);
    const isSame =
      nextGoals.length === prevGoals.length &&
      nextGoals.every((value, index) => value === prevGoals[index]);
    if (!isSame) {
      payload.goals = nextGoals;
    }
  }
  if (values.thumbnailRemoved) {
    payload.thumbnailImage = null;
  } else if (values.thumbnailImageKey) {
    payload.thumbnailImage = values.thumbnailImageKey;
  }

  return payload;
}

interface ChallengeEditScreenContentProps {
  challengeId: number;
  defaults: ChallengeEditFormDefaults;
  startDate: string;
  endDate: string;
  updateChallenge: ReturnType<typeof useUpdateChallenge>;
  successOpen: boolean;
  errorOpen: boolean;
  onSuccessOpenChange(open: boolean): void;
  onErrorOpenChange(open: boolean): void;
}

function ChallengeEditScreenContent({
  challengeId,
  defaults,
  startDate,
  endDate,
  updateChallenge,
  successOpen,
  errorOpen,
  onSuccessOpenChange,
  onErrorOpenChange,
}: ChallengeEditScreenContentProps): React.ReactElement {
  const router = useRouter();
  const form = useChallengeEditForm(defaults);

  const onSubmit = (values: ChallengeEditFormValues): void => {
    const payload = buildUpdatePayload(values, defaults);
    if (Object.keys(payload).length === 0) {
      onSuccessOpenChange(true);
      return;
    }
    updateChallenge.mutate(
      { challengeId, data: payload },
      {
        onSuccess: () => {
          onSuccessOpenChange(true);
        },
        onError: () => {
          onErrorOpenChange(true);
        },
      }
    );
  };

  const canSubmit = form.formState.isValid && !updateChallenge.isPending;

  return (
    <div className="min-h-screen w-full pb-24">
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
          챌린지 수정하기
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
              챌린지 수정하기
            </Text>
            <Text size="body2" weight="regular" className="text-gray-500">
              진행 중인 챌린지의 일부 정보를 다듬어보세요.
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
              <ChallengeEditBannerSection />
              <ChallengeEditParticipationSection />
              <ChallengeEditGoalSection />
              <ChallengeEditPeriodSection
                startDate={startDate}
                endDate={endDate}
              />
            </div>

            <aside className="hidden lg:block">
              <div className="lg:sticky lg:top-6">
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
                <ChallengeEditPreviewCard
                  startDate={startDate}
                  endDate={endDate}
                />
                <div
                  className={cn(
                    'rounded-3 mt-3 border border-dashed border-gray-300',
                    'bg-white px-3.5 py-3 text-[11px] leading-relaxed',
                    'text-gray-600'
                  )}
                >
                  <div className="mb-1 font-extrabold text-gray-900">
                    💡 안내
                  </div>
                  참여 형태와 목표 유형, 진행 기간은 수정할 수 없어요.
                </div>
              </div>
            </aside>
          </form>
        </div>

        <div
          className={cn(
            'fixed inset-x-0 bottom-0 z-20 border-t border-gray-200',
            'bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] backdrop-blur'
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
                'hidden text-gray-600 lg:inline',
                canSubmit && 'text-main-800 font-bold'
              )}
            >
              {canSubmit
                ? '✓ 변경 사항을 저장할 수 있어요'
                : '필수 항목을 확인해 주세요'}
            </Text>
            <div className="w-full lg:ml-auto lg:w-auto">
              <ChallengeEditDialog
                onConfirm={() => form.handleSubmit(onSubmit)()}
                disabled={!canSubmit}
                startDate={startDate}
                endDate={endDate}
                triggerText={
                  updateChallenge.isPending ? '저장 중...' : '수정 완료'
                }
                triggerClassName="w-full lg:w-auto"
              />
            </div>
          </div>
        </div>
      </Form>

      <ChallengeEditSuccessDialog
        open={successOpen}
        onOpenChange={onSuccessOpenChange}
        challengeId={challengeId}
      />

      <Dialog open={errorOpen} onOpenChange={onErrorOpenChange}>
        <DialogContent className="flex flex-col gap-4 p-6 sm:max-w-[360px]">
          <DialogTitle className="text-center font-bold text-black">
            문제가 발생했습니다
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            챌린지 수정 중 오류가 발생했습니다.
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

interface ChallengeEditScreenProps {
  id: string;
}

export default function ChallengeEditScreen({
  id,
}: ChallengeEditScreenProps): React.ReactElement | null {
  const router = useRouter();
  // 하이드레이션 직후 useIsLoggedIn 이 false 인 구간에 /login 로 라우팅되는 것을 막기 위한 가드.
  const hasMounted = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false
  );
  const isLoggedIn = useIsLoggedIn();
  const challengeId = Number(id);
  const { data, isLoading, isError } = useChallengeDetail(challengeId);
  const updateChallenge = useUpdateChallenge();

  const defaults = useMemo(
    () => (data ? buildEditDefaults(data) : null),
    [data]
  );

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  useEffect(() => {
    if (hasMounted && !isLoggedIn) {
      router.replace('/login');
    }
  }, [hasMounted, isLoggedIn, router]);

  useEffect(() => {
    if (!data) {
      return;
    }
    if (data.challengeDetail.myStatus !== 'HOST') {
      router.replace(`/challenge/${id}`);
    }
  }, [data, id, router]);

  if (!isLoggedIn) {
    return null;
  }

  if (isLoading || !defaults || !data) {
    return (
      <div
        className={cn(
          'flex min-h-screen items-center justify-center bg-white'
        )}
      >
        <Text size="body1" weight="medium" className="text-gray-500">
          불러오는 중...
        </Text>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={cn(
          'flex min-h-screen items-center justify-center bg-white px-4'
        )}
      >
        <Text size="body1" weight="medium" className="text-red-500">
          챌린지 정보를 불러오지 못했습니다.
        </Text>
      </div>
    );
  }

  return (
    <ChallengeEditScreenContent
      challengeId={challengeId}
      defaults={defaults}
      startDate={data.challengeSummary.startDate}
      endDate={data.challengeSummary.endDate}
      updateChallenge={updateChallenge}
      successOpen={successOpen}
      errorOpen={errorOpen}
      onSuccessOpenChange={setSuccessOpen}
      onErrorOpenChange={setErrorOpen}
    />
  );
}
