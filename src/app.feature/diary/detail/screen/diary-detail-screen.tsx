'use client';

import { Button, CheckList, Tag, Text } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/login-required-dialog';
import { normalizeApiError } from '@module/api/error';
import { authStorage } from '@module/utils/auth';
import {
  CalendarDays,
  ChevronRight,
  Edit3,
  Heart,
  ListChecks,
  NotebookPen,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState, useSyncExternalStore } from 'react';

import { useChallengeDetail } from '../../../challenge/board/hooks/use-challenge-queries';
import {
  ChallengeDetailResponse,
  ChallengeGoal,
} from '../../../challenge/board/type/challenge';
import { useDiaryDetail } from '../../board/hooks/use-diary-queries';
import { DiaryDetail, DiaryGoalStatus, Feeling } from '../../board/type/diary';
import {
  resolveDiaryImageList,
  resolveDiaryImageUrl,
} from '../../shared/utils/diary-image-url';
import { useLikeDiary, useUnlikeDiary } from '../hooks/use-diary-mutations';

interface ChecklistItem {
  id: string;
  label: string;
}

interface DiaryInfoWithAliases {
  createdAt?: string;
  challengedDate?: string;
  feeling?: Feeling;
  achievement?: number[] | null;
  diaryGoal?: DiaryGoalStatus[] | null;
}

type DiaryDetailWithAliases = DiaryDetail & {
  diaryInfoDto?: DiaryInfoWithAliases | null;
  diaryInfo?: DiaryInfoWithAliases | null;
};

interface ChallengeImageFields {
  imgUrl?: unknown;
  imageUrl?: unknown;
  thumbnailUrl?: unknown;
}

interface DiaryImageFields {
  imgUrl?: unknown;
  img?: unknown;
  imageUrl?: unknown;
  thumbnailUrl?: unknown;
  images?: unknown;
  thumbnail?: unknown;
}

interface DiaryDetailViewData {
  id: number;
  title: string;
  dateLabel: string;
  weekdayLabel: string;
  feelingEmoji: string;
  connectedChallengeId: number | null;
  connectedChallengeTitle: string;
  connectedChallengeImageUrl: string;
  connectedChallengeCategory: string;
  connectedChallengePeriod: string;
  connectedChallengeParticipants: string;
  connectedChallengeParticipationRate: string;
  connectedChallengeGoalCompletionRate: string;
  likedByMe: boolean;
  likeCount: number;
  checklistItems: ChecklistItem[];
  checkedChecklistIds: string[];
  contentHtml: string;
  hasContentHtml: boolean;
  contentThumbnailUrl: string | null;
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

function formatDate(dateValue: string): {
  dateLabel: string;
  weekdayLabel: string;
} {
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

function hasVisibleHtmlContent(contentHtml: string): boolean {
  if (!contentHtml) {
    return false;
  }

  if (/<img[\s>]/i.test(contentHtml)) {
    return true;
  }

  const textWithoutTags = contentHtml
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();

  return textWithoutTags.length > 0;
}

function formatPercent(value?: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '-';
  }

  return `${Math.round(value)}%`;
}

function resolveFirstImage(...rawSources: unknown[]): string | null {
  for (const rawSource of rawSources) {
    const resolvedImage = resolveDiaryImageList(rawSource)?.[0];
    if (resolvedImage) {
      return resolvedImage;
    }

    const resolvedSingleImage = resolveDiaryImageUrl(rawSource);
    if (resolvedSingleImage) {
      return resolvedSingleImage;
    }
  }

  return null;
}

function getDiaryInfo(diary: DiaryDetail): DiaryInfoWithAliases | null {
  const diaryWithAliases = diary as DiaryDetailWithAliases;
  return diaryWithAliases.diaryInfoDto ?? diaryWithAliases.diaryInfo ?? null;
}

function getChallengeImageUrl(
  challengeDetailData?: ChallengeDetailResponse,
  diary?: DiaryDetail
): string {
  const challengeSummary = challengeDetailData?.challengeSummary as
    | (ChallengeDetailResponse['challengeSummary'] & ChallengeImageFields)
    | undefined;
  const diaryChallenge = diary?.challenge as
    | (DiaryDetail['challenge'] & ChallengeImageFields)
    | null
    | undefined;

  const challengeSummaryImage = resolveFirstImage(
    challengeSummary?.imgUrl,
    challengeSummary?.imageUrl,
    challengeSummary?.thumbnailUrl
  );
  if (challengeSummaryImage) {
    return challengeSummaryImage;
  }

  const diaryChallengeImage = resolveFirstImage(
    diaryChallenge?.imgUrl,
    diaryChallenge?.imageUrl,
    diaryChallenge?.thumbnailUrl
  );
  if (diaryChallengeImage) {
    return diaryChallengeImage;
  }

  return '/images/default-card.png';
}

function mapDiaryToViewData(
  diary: DiaryDetail,
  challengeDetailData?: ChallengeDetailResponse
): DiaryDetailViewData {
  const diaryInfo = getDiaryInfo(diary);
  const baseDate = diaryInfo?.createdAt ?? diaryInfo?.challengedDate ?? '';
  const { dateLabel, weekdayLabel } = formatDate(baseDate);
  const challengeGoals: ChallengeGoal[] =
    challengeDetailData?.challengeGoals ?? [];
  const diaryGoals = diaryInfo?.diaryGoal ?? [];
  const achievementIds = new Set(
    (diaryInfo?.achievement ?? []).map((goalId) => String(goalId))
  );
  const checklistItemsFromChallenge = challengeGoals.map((goal) => ({
    id: String(goal.challengeGoalId),
    label: goal.content,
  }));

  let checklistItems: ChecklistItem[] = [];
  let checkedChecklistIds: string[] = [];

  if (checklistItemsFromChallenge.length > 0) {
    checklistItems = checklistItemsFromChallenge;

    if (diaryGoals.length > 0) {
      const achievedDiaryGoalIds = new Set(
        diaryGoals
          .filter((goal) => goal.isAchieved)
          .map((goal) => String(goal.goalId))
      );
      const achievedDiaryGoalNames = new Set(
        diaryGoals
          .filter((goal) => goal.isAchieved && Boolean(goal.goalName))
          .map((goal) => goal.goalName.trim())
      );

      checkedChecklistIds = checklistItems
        .filter(
          (item) =>
            achievedDiaryGoalIds.has(item.id) ||
            achievedDiaryGoalNames.has(item.label.trim())
        )
        .map((item) => item.id);
    } else {
      checkedChecklistIds = checklistItems
        .filter((item) => achievementIds.has(item.id))
        .map((item) => item.id);
    }
  } else if (diaryGoals.length > 0) {
    checklistItems = diaryGoals.map((goal) => ({
      id: String(goal.goalId),
      label: goal.goalName || `목표 ${goal.goalId}`,
    }));
    checkedChecklistIds = diaryGoals
      .filter((goal) => goal.isAchieved)
      .map((goal) => String(goal.goalId));
  } else {
    const achievedGoalIds = Array.from(achievementIds);
    checklistItems = achievedGoalIds.map((goalId) => ({
      id: goalId,
      label: `목표 ${goalId}`,
    }));
    checkedChecklistIds = achievedGoalIds;
  }

  const summary = challengeDetailData?.challengeSummary;
  const period =
    summary?.startDate && summary?.endDate
      ? `${summary.startDate} ~ ${summary.endDate}`
      : diary.challenge?.startDate && diary.challenge?.endDate
        ? `${diary.challenge.startDate} ~ ${diary.challenge.endDate}`
        : '-';

  const participantCnt =
    summary?.participantCnt ?? diary.challenge?.participantCnt;
  const maxParticipantCnt =
    summary?.maxParticipantCnt ?? diary.challenge?.maxParticipantCnt;
  const participantsText =
    typeof participantCnt === 'number' && typeof maxParticipantCnt === 'number'
      ? `${participantCnt}/${maxParticipantCnt}명`
      : '-';
  const diaryWithImageAliases = diary as DiaryDetail & DiaryImageFields;
  const contentThumbnailUrl =
    resolveFirstImage(
      diaryWithImageAliases.imgUrl,
      diaryWithImageAliases.img,
      diaryWithImageAliases.imageUrl,
      diaryWithImageAliases.thumbnailUrl,
      diaryWithImageAliases.images,
      diaryWithImageAliases.thumbnail
    ) ?? null;

  return {
    id: diary.id,
    title: diary.title || '제목 없는 일지',
    dateLabel,
    weekdayLabel,
    feelingEmoji: feelingToEmoji(diaryInfo?.feeling ?? 'NONE'),
    connectedChallengeId:
      summary?.challengeId ?? diary.challenge?.challengeId ?? null,
    connectedChallengeTitle:
      summary?.title ?? diary.challenge?.title ?? '연동된 챌린지가 없습니다.',
    connectedChallengeImageUrl: getChallengeImageUrl(
      challengeDetailData,
      diary
    ),
    connectedChallengeCategory:
      summary?.category ?? diary.challenge?.category ?? '-',
    connectedChallengePeriod: period,
    connectedChallengeParticipants: participantsText,
    connectedChallengeParticipationRate: formatPercent(
      challengeDetailData?.challengeDetail?.participationRate
    ),
    connectedChallengeGoalCompletionRate: formatPercent(
      challengeDetailData?.challengeDetail?.goalCompletionRate
    ),
    likedByMe: diary.likeInfo?.likedByMe ?? false,
    likeCount: diary.likeInfo?.likeCnt ?? 0,
    checklistItems,
    checkedChecklistIds,
    contentHtml: diary.content ?? '',
    hasContentHtml: hasVisibleHtmlContent(diary.content ?? ''),
    contentThumbnailUrl,
    tags: [diary.challenge?.category, diaryInfo?.feeling].filter(
      (tag): tag is string => Boolean(tag)
    ),
  };
}

function DiaryDetailView({
  diaryData,
  onLikeToggle,
  isLikePending,
}: {
  diaryData: DiaryDetailViewData;
  onLikeToggle(): void;
  isLikePending: boolean;
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
                작성일 {diaryData.dateLabel} | {diaryData.weekdayLabel}
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={diaryData.likedByMe ? 'default' : 'outlined'}
              size="medium"
              onClick={onLikeToggle}
              disabled={isLikePending}
            >
              <Heart
                className={`mr-1 h-4 w-4 ${
                  diaryData.likedByMe ? 'fill-current' : ''
                }`}
              />
              좋아요 {diaryData.likeCount}
            </Button>
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
              onClick={() =>
                router.push(`/diary/create?diaryId=${diaryData.id}`)
              }
            >
              <Edit3 className="mr-1 h-4 w-4" />
              일지 수정
            </Button>
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-gray-200" />

        <button
          type="button"
          className={`rounded-3 mt-6 w-full border border-gray-200 bg-white p-4 text-left transition ${
            diaryData.connectedChallengeId
              ? 'hover:border-main-400 cursor-pointer'
              : 'cursor-default'
          }`}
          onClick={() => {
            if (!diaryData.connectedChallengeId) {
              return;
            }
            router.push(`/challenge/${diaryData.connectedChallengeId}`);
          }}
          disabled={!diaryData.connectedChallengeId}
        >
          <div className="flex items-start gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
              <Image
                src={diaryData.connectedChallengeImageUrl}
                alt={`${diaryData.connectedChallengeTitle} 썸네일`}
                fill
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
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

              <div className="mt-3 grid grid-cols-1 gap-y-1 text-gray-600 sm:grid-cols-2 sm:gap-x-4">
                <Text size="caption2" weight="medium">
                  카테고리: {diaryData.connectedChallengeCategory}
                </Text>
                <Text size="caption2" weight="medium">
                  인원수: {diaryData.connectedChallengeParticipants}
                </Text>
                <Text size="caption2" weight="medium">
                  참여율: {diaryData.connectedChallengeParticipationRate}
                </Text>
                <Text size="caption2" weight="medium">
                  목표 달성률: {diaryData.connectedChallengeGoalCompletionRate}
                </Text>
                <Text size="caption2" weight="medium" className="sm:col-span-2">
                  기간: {diaryData.connectedChallengePeriod}
                </Text>
              </div>
            </div>
          </div>
        </button>

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
            <div
              className={`gap-5 ${
                diaryData.contentThumbnailUrl
                  ? 'grid grid-cols-1 items-start md:grid-cols-[minmax(0,1fr)_220px]'
                  : ''
              }`}
            >
              {diaryData.hasContentHtml ? (
                <div
                  className="prose prose-sm max-w-none text-gray-700 [&_img]:max-h-80 [&_img]:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: diaryData.contentHtml }}
                />
              ) : (
                <Text size="body2" weight="regular" className="text-gray-500">
                  작성된 내용이 없습니다.
                </Text>
              )}

              {diaryData.contentThumbnailUrl ? (
                <div className="relative h-48 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 md:h-56">
                  <Image
                    src={diaryData.contentThumbnailUrl}
                    alt="일지 썸네일"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null}
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

export function DiaryDetailScreen({ id }: { id: number }): React.ReactElement {
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [dismissed, setDismissed] = useState(false);
  const showAuthDialog = hasMounted && !authStorage.hasTokens() && !dismissed;
  const safeDiaryId = Number.isFinite(id) && id > 0 ? id : 0;
  const { data, isLoading, isError, error } = useDiaryDetail(safeDiaryId);
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();
  const challengeId = data?.challenge?.challengeId ?? 0;
  const { data: challengeDetailData } = useChallengeDetail(challengeId);
  const isLikePending = likeDiary.isPending || unlikeDiary.isPending;

  const handleLikeToggle = (): void => {
    if (!data || isLikePending) {
      return;
    }

    if (data.likeInfo?.likedByMe) {
      unlikeDiary.mutate(data.id);
      return;
    }

    likeDiary.mutate(data.id);
  };

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
          {error
            ? normalizeApiError(error).message
            : '일지 상세를 불러오지 못했습니다.'}
        </Text>
      </div>
    );
  }

  return (
    <>
      <LoginRequiredDialog
        open={showAuthDialog}
        onOpenChange={(open) => { if (!open) {setDismissed(true);} }}
        title="간편 가입 후에 둘러보세요!"
        description="일지 상세는 로그인 후 이용할 수 있습니다."
      />
      <DiaryDetailView
        diaryData={mapDiaryToViewData(data, challengeDetailData)}
        onLikeToggle={handleLikeToggle}
        isLikePending={isLikePending}
      />
    </>
  );
}
