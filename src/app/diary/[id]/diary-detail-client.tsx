'use client';

import React from 'react';
import { ChallengeGoalToggle } from '@feature/diary/presentation/components/challenge-goal-toggle';
import { DiaryContentField } from '@feature/diary/presentation/components/diary-content-field';
import {
  ChallengeListItem,
  Text,
  PageTitle,
  PageWatermark,
  Spacing,
  Tag,
} from '@1d1s/design-system';

interface DiaryData {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  content: string;
  imageSrc?: string;
  challengeGoals: Array<{
    id: string;
    label: string;
    completed: boolean;
  }>;
}

function DiaryHeader({
  title,
  author,
  createdAt,
}: {
  title: string;
  author: string;
  createdAt: string;
}): React.ReactElement {
  return (
    <div className="flex w-full flex-col gap-2">
      <Text size="display2" weight="bold">
        {title}
      </Text>
      <div className="flex gap-2">
        <Text size="caption2" weight="bold">
          {author}
        </Text>
        <Text size="caption2" weight="bold" className="text-gray-500">
          {createdAt}
        </Text>
      </div>
    </div>
  );
}

function ChallengeGoalsSection({
  goals,
}: {
  goals: Array<{ id: string; label: string; completed: boolean }>;
}): React.ReactElement {
  return (
    <>
      <Text size="heading2" weight="bold">
        챌린지
      </Text>
      <ChallengeListItem
        challengeName={'챌린지'}
        startDate={'2025-06-28'}
        endDate={'2025-07-28'}
        maxParticipants={10}
        currentParticipants={5}
      />
      <Spacing className="h-6" />
      <div className="flex gap-2">
        <Text size="heading2" weight="bold">
          챌린지 목표
        </Text>
        <Tag>고정목표</Tag>
      </div>

      <div className="mt-4 flex flex-col space-y-3">
        {goals.map((goal, index) => (
          <ChallengeGoalToggle
            key={goal.id}
            disabled={true}
            checked={goal.completed}
            label={goal.label}
            className={index === 0 ? '' : 'mt-3'}
          />
        ))}
      </div>
    </>
  );
}

export function DiaryDetailClient({ diaryData }: { diaryData: DiaryData }): React.ReactElement {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="flex w-full flex-col px-4">
        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageTitle title="일지 상세" />
        </div>

        <div className="flex w-full flex-col">
          <Spacing className="h-8" />

          <DiaryHeader
            title={diaryData.title}
            author={diaryData.author}
            createdAt={diaryData.createdAt}
          />

          <Spacing className="h-6" />

          <ChallengeGoalsSection goals={diaryData.challengeGoals} />

          <Spacing className="h-6" />

          <DiaryContentField
            value={diaryData.content}
            editable={false}
            imageSrc={diaryData.imageSrc}
          />
        </div>

        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageWatermark />
        </div>
        <Spacing className="h-8" />
      </div>
    </div>
  );
}
