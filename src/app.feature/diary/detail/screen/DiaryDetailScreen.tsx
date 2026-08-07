'use client';

import { Button, MobileHeader, Text } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { DiaryDetailSkeleton } from '@component/skeletons/DiaryDetailSkeleton';
import { normalizeApiError } from '@module/api/error';
import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { useNativeCapability } from '@module/hooks/useNativeCapability';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { useSignalPageReady } from '@module/hooks/useSignalPageReady';
import { cn } from '@module/utils/cn';
import {
  isNativeSkeletonAvailable,
  requestNativePushRoute,
} from '@module/utils/nativeBridge';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { Flag } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { useChallengeDetail } from '../../../challenge/board/hooks/useChallengeQueries';
import { MemberBlockButton } from '../../../friend/components/MemberBlockButton';
import { useIsLoggedIn } from '../../../member/hooks/useIsLoggedIn';
import { useSidebar } from '../../../member/hooks/useMemberQueries';
import { useDiaryDetail } from '../../board/hooks/useDiaryQueries';
import { DiaryContentRenderer } from '../../shared/components/DiaryContentRenderer';
import { toneFromFeeling } from '../../shared/utils/feeling';
import { DiaryActionToolbar } from '../components/DiaryActionToolbar';
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
import { DiaryOwnerMenu } from '../components/DiaryOwnerMenu';
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

function DiaryDetailView({
  diaryData,
  onLikeToggle,
  isLikePending,
  isOwner,
  onDelete,
  onBlocked,
  onRequireLogin,
}: {
  diaryData: DiaryDetailViewData;
  onLikeToggle(): void;
  isLikePending: boolean;
  isOwner: boolean;
  onDelete(): void;
  onBlocked(): void;
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

  // 기분·달성률·목표 체크 색을 카드와 동일한 무드 톤으로 통일(공유 소스).
  const feelingTone = toneFromFeeling(diaryData.feeling);

  return (
    <div
      className={cn(
        'allow-user-select',
        'detail-fade-in min-h-screen w-full bg-white',
        // 하단 여백: 웹 댓글바(고정)든 앱 네이티브 입력바(오버레이)든 마지막
        // 콘텐츠가 가리지 않도록 항상 확보한다(sm↑ 데스크톱은 0).
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
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsReportOpen(true)}
                    >
                      <Flag className="mr-1 h-3.5 w-3.5" />
                      신고
                    </Button>
                    {diaryData.authorId ? (
                      <MemberBlockButton
                        memberId={diaryData.authorId}
                        nickname={diaryData.authorName}
                        blocked={false}
                        size="sm"
                        onBlocked={onBlocked}
                      />
                    ) : null}
                  </>
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
                onClick={() => {
                  const path = `/challenge/${diaryData.connectedChallengeId}`;
                  if (!requestNativePushRoute(path)) {
                    router.push(path);
                  }
                }}
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

            {/* Card 3 — 오늘의 기분 + 달성률 (표시 전용, 클릭/프레스 없음) */}
            <section
              className={cn(
                'flex items-center gap-2.5 rounded-[10px]',
                'border border-gray-200 bg-white px-3.5 py-3'
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
              ) : null}
              <Text
                size="caption1"
                weight="semibold"
                className={feelingTone.fg}
              >
                오늘의 기분 · {diaryData.feelingLabel}
              </Text>
              <Text
                size="caption1"
                weight="extrabold"
                className={cn('ml-auto shrink-0', feelingTone.fg)}
              >
                달성 {diaryData.achievementPercent}%
              </Text>
            </section>

            <DiaryGoalsCard
              checklistItems={diaryData.checklistItems}
              checkedChecklistIds={diaryData.checkedChecklistIds}
              checkColor={feelingTone.checkColor}
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

export function DiaryDetailScreen({
  id,
}: {
  id: number;
}): React.ReactElement | null {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const authStatus = useAuthStatus();
  const [isDeleting, setIsDeleting] = useState(false);
  // 작성자를 차단하면 이 일지가 접근 불가가 되어, block 성공 후 invalidate 로
  // 재요청한 상세가 403(DIARY_NOT_ACCESS)을 받아 "볼 수 없습니다" 에러 화면이
  // 떴다. 차단 성공 시 이 플래그를 세워 에러 화면 대신 이탈(스켈레톤)만 보이게
  // 하고 목록으로 나간다.
  const [isLeaving, setIsLeaving] = useState(false);
  const safeDiaryId = Number.isFinite(id) && id > 0 ? id : 0;
  const deleteDiary = useDeleteDiary();
  const { data, isLoading, isError, error } = useDiaryDetail(safeDiaryId, {
    enabled: Boolean(safeDiaryId) && !isDeleting && !isLeaving,
    // 인라인 에러 화면을 직접 렌더하므로 전역 에러 토스트는 중복. 차단 후
    // 403 재요청 토스트도 이걸로 억제된다.
    skipGlobalErrorToast: true,
  });
  const showSkeleton = useMinimumLoading(isLoading);
  useSignalPageReady('diary_detail', !showSkeleton && Boolean(data));
  // 앱이 native_skeleton 을 그리는 동안 웹 스켈레톤을 또 그리면 이중이 된다.
  // 이 경우 로딩 중엔 아무것도 렌더하지 않고(네이티브가 덮음) page_ready 로
  // 콘텐츠 준비를 알려 네이티브 스켈레톤을 걷게 한다.
  const nativeSkeleton = useNativeCapability(isNativeSkeletonAvailable);
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

  // 인증 확인 중(unknown)에는 게스트/로그인 UI 를 렌더하지 않는다. 푸시 딥링크·
  // resume 로 세션 재주입 전에 상세가 열리면 잠깐 게스트로 보여 로그인 팝업이
  // 떴다(resume 과 동일 증상). runAuthBootProbe grace(native:auth_ready/유예)가
  // 확정할 때까지 스켈레톤으로 대기하고, **확정된 게스트일 때만** 로그인을
  // 띄운다(useIsLoggedIn 은 unknown 에도 false 라 여기선 쓰지 않는다).
  if (authStatus === 'unknown') {
    return nativeSkeleton ? null : <DiaryDetailSkeleton />;
  }
  if (authStatus === 'guest') {
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
    return nativeSkeleton ? null : <DiaryDetailSkeleton />;
  }

  // 차단 후 이탈 중 — 접근 불가(403) 에러 화면 대신 스켈레톤만 보이고 나간다.
  if (isLeaving) {
    return nativeSkeleton ? null : <DiaryDetailSkeleton />;
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
        onBlocked={() => {
          setIsLeaving(true);
          router.push('/diary');
        }}
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
