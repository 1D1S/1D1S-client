'use client';

import { Button, Text } from '@1d1s/design-system';
import { AlertDialog } from '@component/AlertDialog';
import { MobileBottomActionBar } from '@component/layout/MobileBottomActionBar';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

import type { ChallengeGoal } from '../../../challenge/board/type/challenge';
import { DiaryCreateChallengeSection } from '../components/DiaryCreateChallengeSection';
import { DiaryCreateFinishSection } from '../components/DiaryCreateFinishSection';
import { DiaryCreateGoalsSection } from '../components/DiaryCreateGoalsSection';
import { DiaryCreateThumbnailSection } from '../components/DiaryCreateThumbnailSection';
import { useDiaryCreateForm } from '../hooks/useDiaryCreateForm';

const EMPTY_GOALS: ChallengeGoal[] = [];

// tiptap(~200KB+)은 일지 작성/편집 진입 시에만 필요하므로 동적 import 로
// 페이지 청크에서 분리한다. SSR 도 끔 — 에디터는 client-only.
const DiaryContentEditor = dynamic(
  () =>
    import('../components/DiaryContentEditor').then(
      (mod) => mod.DiaryContentEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-3 min-h-64 w-full animate-pulse border border-gray-200 bg-gray-50"
        aria-hidden
      />
    ),
  }
);

export default function DiaryCreateScreen(): React.ReactElement {
  const router = useRouter();
  const {
    isEditMode,
    title,
    setTitle,
    content,
    setContent,
    selectedMood,
    setSelectedMood,
    achievedDate,
    handleAchievedDateChange,
    selectedChallenge,
    memberChallenges,
    isMemberChallengesLoading,
    isInitialChallengeLoading,
    isCheckingChallengeAvailability,
    isSelectedChallengeConfirmed,
    goals,
    achievedGoalIds,
    thumbnailPreviewUrl,
    submitButtonLabel,
    canSubmit,
    isMissingChallengeDialogOpen,
    isCreateUnavailableDialogOpen,
    handleSelectChallenge,
    handleGoalIdsChange,
    handleThumbnailFileSelect,
    closeMissingChallengeDialog,
    closeCreateUnavailableDialog,
    clearThumbnail,
    handleSubmit,
  } = useDiaryCreateForm();

  const totalGoalCount = isSelectedChallengeConfirmed ? goals.length : 0;
  const achievedGoalCount = isSelectedChallengeConfirmed
    ? achievedGoalIds.length
    : 0;
  const percent =
    totalGoalCount > 0
      ? Math.round((achievedGoalCount / totalGoalCount) * 100)
      : 0;
  const isHundredPercent = percent === 100 && totalGoalCount > 0;

  const thumbnailSlot = useMemo(
    () => (
      <DiaryCreateThumbnailSection
        thumbnailPreviewUrl={thumbnailPreviewUrl}
        hasThumbnail={Boolean(thumbnailPreviewUrl)}
        onSelectThumbnailFile={handleThumbnailFileSelect}
        onClearThumbnail={clearThumbnail}
      />
    ),
    [
      thumbnailPreviewUrl,
      handleThumbnailFileSelect,
      clearThumbnail,
    ]
  );

  return (
    <div className="pb-mobile-action-bar min-h-screen w-full">
      {/* 모바일 sticky 헤더 — ← + 제목 + % 뱃지 */}
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
          {isEditMode ? '일지 수정' : '일지 작성'}
        </Text>
        {totalGoalCount > 0 ? (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1',
              'text-[10px] font-extrabold text-white',
              isHundredPercent ? 'bg-green-500' : 'bg-main-800'
            )}
          >
            {percent}%
          </span>
        ) : null}
      </div>

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
            {isEditMode ? '일지 수정' : '일지 작성'}
          </Text>
          <Text size="body2" weight="regular" className="text-gray-500">
            {isEditMode
              ? '기록을 최신 상태로 업데이트해보세요.'
              : '오늘 챌린지를 어떻게 실천하셨나요?'}
          </Text>
        </header>

        <div className="mx-auto w-full max-w-[860px]">
          <div className="flex flex-col gap-7">
            <DiaryCreateChallengeSection
              selectedChallenge={
                isSelectedChallengeConfirmed ? selectedChallenge : null
              }
              isInitialChallengeLoading={isInitialChallengeLoading}
              isCheckingAvailability={isCheckingChallengeAvailability}
              challenges={memberChallenges}
              isChallengesLoading={isMemberChallengesLoading}
              onSelectChallenge={handleSelectChallenge}
            />

            <section>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="제목을 입력하세요"
                className={cn(
                  'w-full border-0 border-b-2 border-gray-200 bg-transparent',
                  'px-0 py-3 text-2xl font-extrabold tracking-tight',
                  'text-gray-900 placeholder:text-gray-400',
                  'focus:border-main-800 transition-colors outline-none',
                  'lg:text-[26px]'
                )}
              />
            </section>

            <DiaryCreateGoalsSection
              goals={isSelectedChallengeConfirmed ? goals : EMPTY_GOALS}
              achievedGoalIds={achievedGoalIds}
              onGoalIdsChange={handleGoalIdsChange}
            />

            <DiaryCreateFinishSection
              achievedDate={achievedDate}
              onAchievedDateChange={handleAchievedDateChange}
              selectedMood={selectedMood}
              onMoodChange={setSelectedMood}
              thumbnailSlot={thumbnailSlot}
            />

            <section>
              <Text
                size="caption1"
                weight="bold"
                className="mb-2 block text-gray-600"
              >
                오늘 이야기
              </Text>
              <DiaryContentEditor content={content} onChange={setContent} />
            </section>
          </div>
        </div>
      </div>

      <MobileBottomActionBar hideOnDesktop={false} className="lg:px-8">
        <div
          className={cn(
            'mx-auto flex w-full max-w-[1200px] items-center gap-3'
          )}
        >
          {totalGoalCount > 0 ? (
            <Text
              size="caption1"
              weight="bold"
              className={cn(
                'hidden lg:inline',
                isHundredPercent ? 'text-green-600' : 'text-main-800'
              )}
            >
              {isHundredPercent
                ? '🎉 오늘 목표 완료!'
                : `${achievedGoalCount}/${totalGoalCount} 달성 · ${percent}%`}
            </Text>
          ) : null}
          <div className="w-full lg:ml-auto lg:w-auto">
            <Button
              size="large"
              className="w-full lg:w-auto"
              onClick={() => void handleSubmit()}
              disabled={!canSubmit}
            >
              {submitButtonLabel}
            </Button>
          </div>
        </div>
      </MobileBottomActionBar>

      <AlertDialog
        open={isMissingChallengeDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeMissingChallengeDialog();
          }
        }}
        title="챌린지를 찾을 수 없습니다."
        description="내 일지 리스트에서 요청한 챌린지를 찾지 못했습니다."
      />

      <AlertDialog
        open={isCreateUnavailableDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeCreateUnavailableDialog();
          }
        }}
        title="새 일지를 작성할 수 없습니다."
        description="최근 3일 동안 작성 가능한 날짜를 모두 사용했습니다."
      />
    </div>
  );
}
