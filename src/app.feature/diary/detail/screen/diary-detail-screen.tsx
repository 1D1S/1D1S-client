'use client';

import { Button, CheckList, Tag, Text } from '@1d1s/design-system';
import {
  CalendarDays,
  ChevronRight,
  Edit3,
  ListChecks,
  NotebookPen,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

import { useChallengeDetail } from '../../../challenge/board/hooks/use-challenge-queries';
import { ChallengeGoal } from '../../../challenge/board/type/challenge';
import { useDiaryDetail } from '../../board/hooks/use-diary-queries';
import { DiaryDetail, Feeling } from '../../board/type/diary';

interface ChecklistItem {
  id: string;
  label: string;
}

interface DiaryDetailViewData {
  id: number;
  title: string;
  dateLabel: string;
  weekdayLabel: string;
  feelingEmoji: string;
  connectedChallengeTitle: string;
  checklistItems: ChecklistItem[];
  checkedChecklistIds: string[];
  contentParagraphs: string[];
  imageUrl: string;
  tags: string[];
}

function feelingToEmoji(feeling: Feeling): string {
  switch (feeling) {
    case 'HAPPY':
      return '🙂';
    case 'SAD':
      return '🙁';
    case 'NORMAL':
      return '😐';
    case 'NONE':
    default:
      return '📝';
  }
}

function formatDate(
  dateValue: string
): { dateLabel: string; weekdayLabel: string } {
  if (!dateValue) {
    return { dateLabel: '-', weekdayLabel: '-' };
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: '-', weekdayLabel: '-' };
  }

  const dateLabel = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replace(/\.\s/g, '.')
    .replace(/\.$/, '');

  const weekdayLabel = new Intl.DateTimeFormat('ko-KR', {
    weekday: 'long',
  }).format(date);

  return { dateLabel, weekdayLabel };
}

function mapDiaryToViewData(
  diary: DiaryDetail,
  challengeGoals: ChallengeGoal[] = []
): DiaryDetailViewData {
  const baseDate =
    diary.diaryInfoDto?.challengedDate || diary.diaryInfoDto?.createdAt || '';
  const { dateLabel, weekdayLabel } = formatDate(baseDate);

  const achievedGoalIds = (diary.diaryInfoDto?.achievement ?? []).map(
    (goalId) => String(goalId)
  );
  const achievedGoalIdSet = new Set(achievedGoalIds);

  const checklistItemsFromChallenge = challengeGoals.map((goal) => ({
    id: String(goal.challengeGoalId),
    label: goal.content,
  }));

  const checklistItemIdSet = new Set(
    checklistItemsFromChallenge.map((item) => item.id)
  );
  const missingAchievedItems = achievedGoalIds
    .filter((goalId) => !checklistItemIdSet.has(goalId))
    .map((goalId) => ({
      id: goalId,
      label: `목표 ${goalId}`,
    }));

  const checklistItems =
    checklistItemsFromChallenge.length > 0
      ? [...checklistItemsFromChallenge, ...missingAchievedItems]
      : achievedGoalIds.map((goalId) => ({
          id: goalId,
          label: `목표 ${goalId}`,
        }));

  const contentParagraphs = diary.content
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return {
    id: diary.id,
    title: diary.title || '제목 없는 일지',
    dateLabel,
    weekdayLabel,
    feelingEmoji: feelingToEmoji(diary.diaryInfoDto?.feeling ?? 'NONE'),
    connectedChallengeTitle: diary.challenge?.title ?? '연동된 챌린지가 없습니다.',
    checklistItems,
    checkedChecklistIds: checklistItems
      .map((item) => item.id)
      .filter((itemId) => achievedGoalIdSet.has(itemId)),
    contentParagraphs:
      contentParagraphs.length > 0 ? contentParagraphs : ['작성된 내용이 없습니다.'],
    imageUrl: diary.imgUrl?.[0] ?? '/images/default-card.png',
    tags: [diary.challenge?.category, diary.diaryInfoDto?.feeling].filter(
      (tag): tag is string => Boolean(tag)
    ),
  };
}

function DiaryDetailView({
  diaryData,
}: {
  diaryData: DiaryDetailViewData;
}): React.ReactElement {
  const router = useRouter();
  const checkedIds = diaryData.checkedChecklistIds;

  const leftChecklistOptions = useMemo(
    () =>
      diaryData.checklistItems
        .filter((_, index) => index % 2 === 0)
        .map((item) => ({ id: item.id, label: item.label })),
    [diaryData.checklistItems]
  );
  const rightChecklistOptions = useMemo(
    () =>
      diaryData.checklistItems
        .filter((_, index) => index % 2 === 1)
        .map((item) => ({ id: item.id, label: item.label })),
    [diaryData.checklistItems]
  );

  const handleShare = async (): Promise<void> => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: diaryData.title,
        text: `${diaryData.title} 일지를 공유합니다.`,
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
  };

  const handleReadOnlyChecklistChange = (): void => {};

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto w-full max-w-[1080px] px-4 pt-8 pb-12">
        <div className="flex items-center gap-1 text-gray-500">
          <Text size="caption2" weight="medium" className="text-gray-500">
            일지
          </Text>
          <ChevronRight className="h-3 w-3" />
          <Text size="caption2" weight="medium" className="text-gray-500">
            일지 상세
          </Text>
        </div>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Text size="display1" weight="bold" className="text-gray-900">
                {diaryData.title}
              </Text>
              <span className="bg-main-200 flex h-7 w-7 items-center justify-center rounded-full">
                {diaryData.feelingEmoji}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-gray-500">
              <CalendarDays className="h-4 w-4" />
              <Text size="body2" weight="medium" className="text-gray-500">
                {diaryData.dateLabel} | {diaryData.weekdayLabel}
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              size="medium"
              onClick={() => void handleShare()}
            >
              <Share2 className="mr-1 h-4 w-4" />
              공유
            </Button>
            <Button
              variant="default"
              size="medium"
              onClick={() => router.push(`/diary/create?diaryId=${diaryData.id}`)}
            >
              <Edit3 className="mr-1 h-4 w-4" />
              일지 수정
            </Button>
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-gray-200" />

        <section className="rounded-3 mt-6 border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-main-200 text-main-800 flex h-10 w-10 items-center justify-center rounded-xl">
                <NotebookPen className="h-5 w-5" />
              </div>
              <div>
                <Text size="caption2" weight="bold" className="text-gray-500">
                  연결된 챌린지
                </Text>
                <Text
                  size="heading2"
                  weight="bold"
                  className="line-clamp-2 max-w-[560px] break-words text-gray-900"
                >
                  {diaryData.connectedChallengeTitle}
                </Text>
              </div>
            </div>

            <Button
              variant="outlined"
              size="small"
              onClick={() => router.push('/challenge')}
            >
              챌린지 보기
            </Button>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="text-main-800 h-5 w-5" />
            <Text size="heading1" weight="bold" className="text-gray-900">
              오늘의 체크리스트
            </Text>
          </div>

          {diaryData.checklistItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <CheckList
                options={leftChecklistOptions}
                value={checkedIds}
                onValueChange={handleReadOnlyChecklistChange}
                disabled
              />
              <CheckList
                options={rightChecklistOptions}
                value={checkedIds}
                onValueChange={handleReadOnlyChecklistChange}
                disabled
              />
            </div>
          ) : (
            <Text size="body2" weight="regular" className="text-gray-500">
              달성 목표 데이터가 없습니다.
            </Text>
          )}
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <NotebookPen className="text-main-800 h-5 w-5" />
            <Text size="heading1" weight="bold" className="text-gray-900">
              일지 내용
            </Text>
          </div>

          <div className="rounded-3 border border-gray-200 bg-white p-5">
            <div className="space-y-2">
              {diaryData.contentParagraphs.map((paragraph, index) => (
                <Text
                  key={index}
                  size="body2"
                  weight="regular"
                  className="text-gray-700"
                >
                  {paragraph}
                </Text>
              ))}
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl">
              <Image
                src={diaryData.imageUrl}
                alt={`${diaryData.title} 이미지`}
                width={1000}
                height={800}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            {diaryData.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {diaryData.tags.map((tag) => (
                  <Tag key={tag} size="caption3" weight="medium">
                    #{tag}
                  </Tag>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export function DiaryDetailScreen({
  id,
}: {
  id: number;
}): React.ReactElement {
  const safeDiaryId = Number.isFinite(id) && id > 0 ? id : 0;
  const { data, isLoading, isError } = useDiaryDetail(safeDiaryId);
  const challengeId = data?.challenge?.challengeId ?? 0;
  const { data: challengeDetailData } = useChallengeDetail(challengeId);

  if (!safeDiaryId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-4">
        <Text size="body1" weight="medium" className="text-red-600">
          유효하지 않은 일지 ID입니다.
        </Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-4">
        <Text size="body1" weight="medium" className="text-gray-500">
          일지 상세를 불러오는 중입니다.
        </Text>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-4">
        <Text size="body1" weight="medium" className="text-red-600">
          일지 상세를 불러오지 못했습니다.
        </Text>
      </div>
    );
  }

  return (
    <DiaryDetailView
      diaryData={mapDiaryToViewData(data, challengeDetailData?.challengeGoals)}
    />
  );
}
