'use client';

import { Button, Text, TextField } from '@1d1s/design-system';
import React from 'react';

import { DiaryContentEditor } from '../components/diary-content-editor';
import { DiaryCreateChallengeSection } from '../components/diary-create-challenge-section';
import { DiaryCreateFinishSection } from '../components/diary-create-finish-section';
import { DiaryCreateGoalsSection } from '../components/diary-create-goals-section';
import { DiaryCreateMissingChallengeDialog } from '../components/diary-create-missing-challenge-dialog';
import { DiaryCreateThumbnailSection } from '../components/diary-create-thumbnail-section';
import { useDiaryCreateForm } from '../hooks/use-diary-create-form';

export default function DiaryCreateScreen(): React.ReactElement {
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
    isPublic,
    setIsPublic,
    selectedChallenge,
    memberChallenges,
    isMemberChallengesLoading,
    isInitialChallengeLoading,
    goals,
    achievedGoalIds,
    thumbnailFile,
    thumbnailPreviewUrl,
    submitButtonLabel,
    canSubmit,
    isMissingChallengeDialogOpen,
    handleSelectChallenge,
    handleClearChallenge,
    handleGoalToggle,
    handleThumbnailFileSelect,
    closeMissingChallengeDialog,
    clearThumbnail,
    handleSubmit,
  } = useDiaryCreateForm();

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto w-full max-w-[1080px] px-4 py-8 pb-28">
        <div className="flex flex-col gap-2">
          <Text size="display2" weight="bold" className="text-gray-900">
            {isEditMode ? '일지 수정' : '일지 작성'}
          </Text>
          <Text size="body1" weight="regular" className="text-gray-600">
            {isEditMode
              ? '기록을 최신 상태로 업데이트해보세요.'
              : '오늘 하루의 도전을 기록하고 마무리하세요.'}
          </Text>
        </div>

        <div className="mt-12 flex flex-col gap-12">
          <section>
            <Text size="heading2" weight="bold" className="text-gray-900">
              일지 제목
            </Text>
            <TextField
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="일지 제목을 입력해주세요."
              className="mt-2 w-full"
            />
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
            <div className="flex min-w-0 flex-col gap-6">
              <DiaryCreateChallengeSection
                selectedChallenge={selectedChallenge}
                isInitialChallengeLoading={isInitialChallengeLoading}
                challenges={memberChallenges}
                isChallengesLoading={isMemberChallengesLoading}
                onSelectChallenge={handleSelectChallenge}
                onClearChallenge={handleClearChallenge}
              />

              <DiaryCreateGoalsSection
                goals={goals}
                achievedGoalIds={achievedGoalIds}
                onGoalToggle={handleGoalToggle}
              />
            </div>

            <DiaryCreateThumbnailSection
              thumbnailPreviewUrl={thumbnailPreviewUrl}
              hasThumbnail={Boolean(thumbnailFile)}
              onSelectThumbnailFile={handleThumbnailFileSelect}
              onClearThumbnail={clearThumbnail}
            />
          </div>

          <section>
            <Text size="heading2" weight="bold" className="mb-6 text-gray-900">
              상세 내용
            </Text>
            <DiaryContentEditor content={content} onChange={setContent} />
          </section>

          <DiaryCreateFinishSection
            achievedDate={achievedDate}
            onAchievedDateChange={handleAchievedDateChange}
            selectedMood={selectedMood}
            onMoodChange={setSelectedMood}
            isPublic={isPublic}
            onPublicChange={setIsPublic}
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1080px] items-center justify-end px-4 py-4">
          <Button
            size="large"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
          >
            {submitButtonLabel}
          </Button>
        </div>
      </div>

      <DiaryCreateMissingChallengeDialog
        open={isMissingChallengeDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeMissingChallengeDialog();
          }
        }}
      />
    </div>
  );
}
