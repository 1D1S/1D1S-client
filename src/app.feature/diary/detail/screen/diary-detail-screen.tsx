'use client';

import {
  Button,
  ChallengeListItem,
  CheckList,
  Tag,
  Text,
} from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/login-required-dialog';
import { getCategoryLabel } from '@constants/categories';
import { normalizeApiError } from '@module/api/error';
import { authStorage } from '@module/utils/auth';
import {
  CalendarDays,
  Edit3,
  Heart,
  ListChecks,
  MoreVertical,
  NotebookPen,
  Share2,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { useChallengeDetail } from '../../../challenge/board/hooks/use-challenge-queries';
import {
  ChallengeDetailResponse,
  ChallengeGoal,
} from '../../../challenge/board/type/challenge';
import { useSidebar } from '../../../member/hooks/use-member-queries';
import { useDiaryDetail } from '../../board/hooks/use-diary-queries';
import {
  AuthorInfo,
  DiaryDetail,
  DiaryGoalStatus,
  Feeling,
} from '../../board/type/diary';
import {
  resolveDiaryImageList,
  resolveDiaryImageUrl,
} from '../../shared/utils/diary-image-url';
import {
  useDeleteDiary,
  useLikeDiary,
  useUnlikeDiary,
} from '../hooks/use-diary-mutations';

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
  author?: AuthorInfo | null;
};

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
  connectedChallengeCategory: string;
  connectedChallengeType: string;
  connectedChallengeStartDate: string;
  connectedChallengeEndDate: string;
  connectedChallengeCurrentUsers: number;
  connectedChallengeMaxUsers: number;
  likedByMe: boolean;
  likeCount: number;
  checklistItems: ChecklistItem[];
  checkedChecklistIds: string[];
  contentHtml: string;
  hasContentHtml: boolean;
  contentThumbnailUrl: string | null;
  tags: string[];
  authorName: string | null;
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

function getAuthorInfo(diary: DiaryDetail): AuthorInfo | null {
  const diaryWithAliases = diary as DiaryDetailWithAliases;
  return diaryWithAliases.authorInfoDto ?? diaryWithAliases.author ?? null;
}

function mapDiaryToViewData(
  diary: DiaryDetail,
  challengeDetailData?: ChallengeDetailResponse
): DiaryDetailViewData {
  const diaryInfo = getDiaryInfo(diary);
  const authorInfo = getAuthorInfo(diary);
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
          .map((goal) => String(goal.challengeGoalId))
      );
      const achievedDiaryGoalNames = new Set(
        diaryGoals
          .filter((goal) => goal.isAchieved && Boolean(goal.challengeGoalName))
          .map((goal) => goal.challengeGoalName.trim())
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
      id: String(goal.challengeGoalId),
      label: goal.challengeGoalName || `목표 ${goal.challengeGoalId}`,
    }));
    checkedChecklistIds = diaryGoals
      .filter((goal) => goal.isAchieved)
      .map((goal) => String(goal.challengeGoalId));
  } else {
    const achievedGoalIds = Array.from(achievementIds);
    checklistItems = achievedGoalIds.map((goalId) => ({
      id: goalId,
      label: `목표 ${goalId}`,
    }));
    checkedChecklistIds = achievedGoalIds;
  }

  const summary = challengeDetailData?.challengeSummary;
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
    connectedChallengeCategory:
      getCategoryLabel(summary?.category ?? diary.challenge?.category) || '-',
    connectedChallengeType:
      summary?.challengeType ?? diary.challenge?.challengeType ?? '-',
    connectedChallengeStartDate:
      summary?.startDate ?? diary.challenge?.startDate ?? '',
    connectedChallengeEndDate:
      summary?.endDate ?? diary.challenge?.endDate ?? '',
    connectedChallengeCurrentUsers:
      summary?.participantCnt ?? diary.challenge?.participantCnt ?? 0,
    connectedChallengeMaxUsers:
      summary?.maxParticipantCnt ?? diary.challenge?.maxParticipantCnt ?? 0,
    likedByMe: diary.likeInfo?.likedByMe ?? false,
    likeCount: diary.likeInfo?.likeCnt ?? 0,
    checklistItems,
    checkedChecklistIds,
    contentHtml: diary.content ?? '',
    hasContentHtml: hasVisibleHtmlContent(diary.content ?? ''),
    contentThumbnailUrl,
    tags: [diary.challenge?.category, diaryInfo?.feeling]
      .filter((tag): tag is string => Boolean(tag))
      .map((tag) => getCategoryLabel(tag) || tag),
    authorName: authorInfo?.nickname ?? null,
  };
}

function DiaryDetailView({
  diaryData,
  onLikeToggle,
  isLikePending,
  isOwner,
  onDelete,
}: {
  diaryData: DiaryDetailViewData;
  onLikeToggle(): void;
  isLikePending: boolean;
  isOwner: boolean;
  onDelete(): void;
}): React.ReactElement {
  const router = useRouter();
  const checkedIds = diaryData.checkedChecklistIds;

  const checklistOptions = useMemo(
    () =>
      diaryData.checklistItems.map((item) => ({
        id: item.id,
        label: item.label,
      })),
    [diaryData.checklistItems]
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

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
            {diaryData.authorName ? (
              <Text size="body2" weight="medium" className="mt-1 text-gray-500">
                작성자 {diaryData.authorName}
              </Text>
            ) : null}
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
            {isOwner && (
              <div ref={menuRef} className="relative">
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
                {isMenuOpen && (
                  <div className="absolute top-full right-0 z-10 mt-1 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push(`/diary/create?diaryId=${diaryData.id}`);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                      일지 수정
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-500 hover:bg-gray-50"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDelete();
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      일지 삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-gray-200" />

        <div className="mt-6">
          <Text
            size="caption2"
            weight="bold"
            className="mb-2 block text-gray-500"
          >
            연결된 챌린지
          </Text>
          <ChallengeListItem
            challengeTitle={diaryData.connectedChallengeTitle}
            challengeType={diaryData.connectedChallengeType}
            challengeCategory={diaryData.connectedChallengeCategory}
            currentUserCount={diaryData.connectedChallengeCurrentUsers}
            maxUserCount={diaryData.connectedChallengeMaxUsers}
            startDate={diaryData.connectedChallengeStartDate}
            endDate={diaryData.connectedChallengeEndDate}
            isOngoing={(() => {
              const now = new Date();
              const start = new Date(diaryData.connectedChallengeStartDate);
              const end = new Date(diaryData.connectedChallengeEndDate);
              return now >= start && now <= end;
            })()}
            isEnded={new Date() > new Date(diaryData.connectedChallengeEndDate)}
            onClick={
              diaryData.connectedChallengeId
                ? () =>
                    router.push(`/challenge/${diaryData.connectedChallengeId}`)
                : undefined
            }
          />
        </div>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="text-main-800 h-5 w-5" />
            <Text size="heading1" weight="bold" className="text-gray-900">
              오늘의 체크리스트
            </Text>
          </div>

          {diaryData.checklistItems.length > 0 ? (
            <CheckList
              options={checklistOptions}
              value={checkedIds}
              onValueChange={handleReadOnlyChecklistChange}
              disabled
            />
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
  const router = useRouter();
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [dismissed, setDismissed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const showAuthDialog = hasMounted && !authStorage.hasTokens() && !dismissed;
  const safeDiaryId = Number.isFinite(id) && id > 0 ? id : 0;
  const deleteDiary = useDeleteDiary();
  const { data, isLoading, isError, error } = useDiaryDetail(safeDiaryId, {
    enabled: Boolean(safeDiaryId) && !isDeleting,
  });
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();
  const challengeId = data?.challenge?.challengeId ?? 0;
  const { data: challengeDetailData } = useChallengeDetail(challengeId);
  const { data: sidebarData } = useSidebar();
  const isLikePending = likeDiary.isPending || unlikeDiary.isPending;
  const authorInfo = data ? getAuthorInfo(data) : null;
  const isOwner = Boolean(
    sidebarData?.nickname &&
      authorInfo?.nickname &&
      sidebarData.nickname === authorInfo.nickname
  );

  const handleDelete = (): void => {
    if (!window.confirm('일지를 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    deleteDiary.mutate(safeDiaryId, {
      onSuccess: () => router.push('/diary'),
      onError: () => setIsDeleting(false),
    });
  };

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

  const authDialog = (
    <LoginRequiredDialog
      open={showAuthDialog}
      onOpenChange={(open) => {
        if (!open) {
          setDismissed(true);
        }
      }}
      title="간편 가입 후에 둘러보세요!"
      description="일지 상세는 로그인 후 이용할 수 있습니다."
    />
  );

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
      <>
        {authDialog}
        <div className="flex min-h-[40vh] items-center justify-center p-4">
          <Text size="body1" weight="medium" className="text-gray-500">
            일지 상세를 불러오는 중입니다.
          </Text>
        </div>
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        {authDialog}
        <div className="flex min-h-[40vh] items-center justify-center p-4">
          <Text size="body1" weight="medium" className="text-red-600">
            {error
              ? normalizeApiError(error).message
              : '일지 상세를 불러오지 못했습니다.'}
          </Text>
        </div>
      </>
    );
  }

  return (
    <>
      {authDialog}
      <DiaryDetailView
        diaryData={mapDiaryToViewData(data, challengeDetailData)}
        onLikeToggle={handleLikeToggle}
        isLikePending={isLikePending}
        isOwner={isOwner}
        onDelete={handleDelete}
      />
    </>
  );
}
