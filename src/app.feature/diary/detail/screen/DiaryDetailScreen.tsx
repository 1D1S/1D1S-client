'use client';

import { Button, MobileHeader, Text } from '@1d1s/design-system';
import LikeBurst from '@component/LikeBurst';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { DiaryDetailSkeleton } from '@component/skeletons/DiaryDetailSkeleton';
import { normalizeApiError } from '@module/api/error';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import {
  Edit3,
  Flag,
  Heart,
  MessageCircle,
  MoreVertical,
  Share2,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useChallengeDetail } from '../../../challenge/board/hooks/useChallengeQueries';
import { useIsLoggedIn } from '../../../member/hooks/useIsLoggedIn';
import { useSidebar } from '../../../member/hooks/useMemberQueries';
import { useDiaryDetail } from '../../board/hooks/useDiaryQueries';
import { DiaryContentRenderer } from '../../shared/components/DiaryContentRenderer';
import { DiaryAuthorRow } from '../components/DiaryAuthorRow';
import {
  DiaryCommentSection,
  DiaryMobileCommentBar,
} from '../components/DiaryCommentSection';
import {
  DiaryConnectedChallengeCard,
  DiaryConnectedChallengeFallback,
} from '../components/DiaryConnectedChallenge';
import { DiaryGoalsCard } from '../components/DiaryGoalsCard';
import { DiaryImageGallery } from '../components/DiaryImageGallery';
import { DiaryReportDialog } from '../components/DiaryReportDialog';
import {
  COMMENT_LIST_PARAMS,
  REPLIES_MAP_PARAMS,
} from '../hooks/useCommentTree';
import {
  useCommentRepliesMap,
  useDiaryComments,
} from '../hooks/useDiaryCommentQueries';
import {
  useDeleteDiary,
  useLikeDiary,
  useUnlikeDiary,
} from '../hooks/useDiaryMutations';
import { getDiaryCommentTotal } from '../utils/commentCount';
import {
  type DiaryDetailViewData,
  getAuthorInfo,
  mapDiaryToViewData,
  resolveSidebarMemberId,
} from '../utils/diaryViewData';

function getFeelingTextClass(feeling: DiaryDetailViewData['feeling']): string {
  if (feeling === 'HAPPY') {
    return 'text-main-800';
  }
  if (feeling === 'NORMAL') {
    return 'text-green-800';
  }
  if (feeling === 'SAD') {
    return 'text-blue-600';
  }
  return 'text-gray-500';
}

function DiaryActionToolbar({
  diaryData,
  totalCommentCount,
  isLikePending,
  onLikeToggle,
  onShare,
}: {
  diaryData: DiaryDetailViewData;
  totalCommentCount: number;
  isLikePending: boolean;
  onLikeToggle(): void;
  onShare(): void;
}): React.ReactElement {
  const pillClass = cn(
    'inline-flex items-center gap-1.5 rounded-full border',
    'px-4 py-2 text-[13px] font-bold transition-colors'
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-label="좋아요"
        onClick={onLikeToggle}
        disabled={isLikePending}
        className={cn(
          pillClass,
          'relative disabled:opacity-60',
          diaryData.likedByMe
            ? 'border-main-800 bg-main-100 text-main-800'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        )}
      >
        <LikeBurst liked={diaryData.likedByMe} />
        <Heart
          className={cn('h-3.5 w-3.5', diaryData.likedByMe && 'fill-current')}
        />
        {diaryData.likeCount}
      </button>
      <span
        aria-label={`댓글 ${totalCommentCount}개`}
        className={cn(pillClass, 'border-gray-200 bg-white text-gray-700')}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {totalCommentCount}
      </span>
      <button
        type="button"
        aria-label="공유"
        onClick={onShare}
        className={cn(
          pillClass,
          'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        )}
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function DiaryOwnerMenu({
  onEdit,
  onDelete,
}: {
  onEdit(): void;
  onDelete(): void;
}): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="secondary"
        size="md"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      {isOpen ? (
        <div
          className={cn(
            'absolute top-full right-0 z-10 mt-1 w-32',
            'overflow-hidden rounded-lg border border-gray-200',
            'bg-white shadow-md'
          )}
        >
          <button
            type="button"
            className={cn(
              'flex w-full cursor-pointer items-center gap-2',
              'px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50'
            )}
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
          >
            <Edit3 className="h-4 w-4" />
            일지 수정
          </button>
          <button
            type="button"
            className={cn(
              'flex w-full cursor-pointer items-center gap-2',
              'px-4 py-2.5 text-left text-sm text-red-500 hover:bg-gray-50'
            )}
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
            일지 삭제
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DiaryDetailView({
  diaryData,
  onLikeToggle,
  isLikePending,
  isOwner,
  onDelete,
  onRequireLogin,
}: {
  diaryData: DiaryDetailViewData;
  onLikeToggle(): void;
  isLikePending: boolean;
  isOwner: boolean;
  onDelete(): void;
  onRequireLogin(): void;
}): React.ReactElement {
  const router = useRouter();
  // 알림 딥링크/콜드 스타트로 진입해 history 가 없을 때 일지 목록으로 보낸다.
  const handleBack = useSafeBack('/diary');
  const { data: sidebarData } = useSidebar();
  const isLoggedIn = useIsLoggedIn();
  const currentMemberId = useMemo(
    () => resolveSidebarMemberId(sidebarData),
    [sidebarData]
  );
  const currentUserNickname = useMemo(
    () => sidebarData?.nickname?.trim() ?? null,
    [sidebarData?.nickname]
  );
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { data: commentsData } = useDiaryComments(
    diaryData.id,
    COMMENT_LIST_PARAMS
  );
  const previewCommentIds = useMemo(
    () => commentsData?.items?.map((comment) => comment.id) ?? [],
    [commentsData?.items]
  );
  const previewRepliesMapParams = useMemo(
    () => ({
      ...REPLIES_MAP_PARAMS,
      enabled: previewCommentIds.length > 0,
    }),
    [previewCommentIds.length]
  );
  const { data: commentRepliesMap = {} } = useCommentRepliesMap(
    previewCommentIds,
    previewRepliesMapParams
  );
  const totalCommentCount = useMemo(
    () =>
      getDiaryCommentTotal({
        totalElements: commentsData?.pageInfo.totalElements ?? 0,
        items: commentsData?.items ?? [],
        repliesMap: commentRepliesMap,
      }),
    [
      commentsData?.items,
      commentsData?.pageInfo.totalElements,
      commentRepliesMap,
    ]
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

  const isHundredPercent = diaryData.achievementPercent === 100;

  return (
    <div
      className={cn(
        'allow-user-select',
        'detail-fade-in min-h-screen w-full bg-white',
        'pb-mobile-action-bar-tall sm:pb-0'
      )}
    >
      <MobileHeader title="일지" onBack={handleBack} />

      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-4 py-3 sm:px-5 sm:py-7 lg:px-8 lg:py-10'
        )}
      >
        <div
          className={cn(
            'grid gap-4 lg:gap-7',
            'lg:grid-cols-[minmax(0,1fr)_380px]'
          )}
        >
          <article className="flex min-w-0 flex-col gap-3.5">
            {/* Card 1 — Author + actions */}
            <section
              className={cn(
                'flex items-center gap-3',
                'lg:rounded-[14px] lg:border lg:border-gray-200',
                'lg:bg-white lg:p-4'
              )}
            >
              <div className="min-w-0 flex-1">
                <DiaryAuthorRow
                  authorName={diaryData.authorName}
                  authorId={diaryData.authorId}
                  authorProfileImage={diaryData.authorProfileImage}
                  relativeDateLabel={diaryData.relativeDateLabel}
                />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!isOwner ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsReportOpen(true)}
                  >
                    <Flag className="mr-1 h-3.5 w-3.5" />
                    신고
                  </Button>
                ) : null}
                {isOwner ? (
                  <DiaryOwnerMenu
                    onEdit={() =>
                      router.push(`/diary/create?diaryId=${diaryData.id}`)
                    }
                    onDelete={onDelete}
                  />
                ) : null}
              </div>
            </section>

            {/* 연동된 챌린지 카드 — 풀 리스트 아이템 */}
            {diaryData.connectedChallengeSummary &&
            diaryData.connectedChallengeId ? (
              <DiaryConnectedChallengeCard
                summary={diaryData.connectedChallengeSummary}
                onClick={() =>
                  router.push(`/challenge/${diaryData.connectedChallengeId}`)
                }
              />
            ) : (
              <DiaryConnectedChallengeFallback
                title={diaryData.connectedChallengeTitle}
              />
            )}

            {/* Card 2 — 제목 + 액션(좋아요/댓글/공유) */}
            <section
              className={cn(
                'lg:rounded-[14px] lg:border lg:border-gray-200',
                'lg:bg-white lg:p-6'
              )}
            >
              <Text
                as="h1"
                size="display1"
                weight="bold"
                className="block leading-[1.3] tracking-[-0.4px] text-gray-900"
              >
                {diaryData.title}
              </Text>

              <div className="mt-4">
                <DiaryActionToolbar
                  diaryData={diaryData}
                  totalCommentCount={totalCommentCount}
                  isLikePending={isLikePending}
                  onLikeToggle={onLikeToggle}
                  onShare={() => void handleShare()}
                />
              </div>
            </section>

            {/* Card 3 — 오늘의 기분 + 달성률 (독립 섹션, 프레스 모션) */}
            <section
              className={cn(
                'flex items-center gap-2.5 rounded-[10px]',
                'border border-gray-200 bg-white px-3.5 py-3',
                'transition duration-200 ease-out active:scale-[0.97]'
              )}
            >
              {diaryData.feelingMoodImage ? (
                /* 무드 SVG: prod 최적화기 SVG 차단 회피 위해 unoptimized */
                <Image
                  src={diaryData.feelingMoodImage.src}
                  alt={diaryData.feelingMoodImage.alt}
                  width={24}
                  height={24}
                  className="h-6 w-6"
                  unoptimized
                />
              ) : (
                <span className="text-xl leading-none" aria-hidden>
                  {diaryData.feelingEmoji}
                </span>
              )}
              <Text
                size="caption1"
                weight="semibold"
                className={getFeelingTextClass(diaryData.feeling)}
              >
                오늘의 기분 · {diaryData.feelingLabel}
              </Text>
              <Text
                size="caption1"
                weight="extrabold"
                className={cn(
                  'ml-auto shrink-0',
                  isHundredPercent ? 'text-green-600' : 'text-main-800'
                )}
              >
                달성 {diaryData.achievementPercent}%
              </Text>
            </section>

            <DiaryGoalsCard
              checklistItems={diaryData.checklistItems}
              checkedChecklistIds={diaryData.checkedChecklistIds}
            />

            {/* Card 4 — 오늘의 기록: 본문 + 이미지 (모바일·태블릿은 플랫).
                본문·이미지가 모두 없으면 섹션 자체를 렌더하지 않는다. */}
            {diaryData.hasContentHtml ||
            diaryData.contentImageUrls.length > 0 ? (
              <section
                className={cn(
                  'lg:rounded-[14px] lg:border lg:border-gray-200',
                  'lg:bg-white lg:p-6'
                )}
              >
                <Text
                  size="caption2"
                  weight="semibold"
                  className="hidden tracking-[0.2px] text-gray-500 lg:block"
                >
                  오늘의 기록
                </Text>

                {/* 첨부 이미지 — 본문보다 먼저 노출. '오늘의 기록' 라벨
                    아래 일정 간격(lg:mt-3.5)을 준다. */}
                {diaryData.contentImageUrls.length > 0 ? (
                  <div className="lg:mt-3.5">
                    <DiaryImageGallery imageUrls={diaryData.contentImageUrls} />
                  </div>
                ) : null}

                {/* 본문 — 이미지가 있으면 그 아래 mt-5, 없으면 라벨
                    아래 일정 간격(lg:mt-3.5)을 준다. */}
                {diaryData.hasContentHtml ? (
                  <div
                    className={cn(
                      diaryData.contentImageUrls.length > 0
                        ? 'mt-5'
                        : 'lg:mt-3.5'
                    )}
                  >
                    <DiaryContentRenderer
                      html={diaryData.contentHtml}
                      className="text-[15px] leading-[1.9]"
                    />
                  </div>
                ) : null}
              </section>
            ) : null}
          </article>

          <aside>
            <DiaryCommentSection
              diaryId={diaryData.id}
              currentMemberId={currentMemberId}
              currentUserNickname={currentUserNickname}
              isLoggedIn={isLoggedIn}
              onRequireLogin={onRequireLogin}
            />
          </aside>
        </div>
      </div>

      <DiaryReportDialog
        diaryId={diaryData.id}
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
      />
    </div>
  );
}

export function DiaryDetailScreen({ id }: { id: number }): React.ReactElement {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const [isDeleting, setIsDeleting] = useState(false);
  const safeDiaryId = Number.isFinite(id) && id > 0 ? id : 0;
  const deleteDiary = useDeleteDiary();
  const { data, isLoading, isError, error } = useDiaryDetail(safeDiaryId, {
    enabled: Boolean(safeDiaryId) && !isDeleting,
  });
  const showSkeleton = useMinimumLoading(isLoading);
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

  if (!isLoggedIn) {
    return (
      <LoginRequiredDialog
        open
        onOpenChange={() => {}}
        title="간편 가입 후에 둘러보세요!"
        description="일지 상세는 로그인 후 이용할 수 있습니다."
        required
        onClose={() => router.push('/diary')}
      />
    );
  }

  if (!safeDiaryId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-4">
        <Text size="body1" weight="medium" className="text-red-600">
          유효하지 않은 일지 ID입니다.
        </Text>
      </div>
    );
  }

  if (showSkeleton) {
    return <DiaryDetailSkeleton />;
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
      <DiaryDetailView
        diaryData={mapDiaryToViewData(data, challengeDetailData)}
        onLikeToggle={handleLikeToggle}
        isLikePending={isLikePending}
        isOwner={isOwner}
        onDelete={handleDelete}
        onRequireLogin={() => {}}
      />
      {/* 모바일 sticky 댓글 입력바 — data-fade-in 래퍼 밖에 둔다:
          래퍼의 transform 이 containing block 을 만들어 position: fixed 가
          뷰포트 대신 래퍼 기준이 되는 문제를 피한다. */}
      <DiaryMobileCommentBar
        diaryId={data.id}
        isLoggedIn={isLoggedIn}
        onRequireLogin={() => {}}
      />
    </>
  );
}
