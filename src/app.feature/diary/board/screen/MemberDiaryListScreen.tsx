'use client';

import { Text } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { DiaryCardSkeletonGrid } from '@component/skeletons/DiaryCardSkeleton';
import { getCategoryLabel } from '@constants/categories';
import { DiaryItem } from '@feature/diary/board/type/diary';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/useDiaryMutations';
import { DiaryCard } from '@feature/diary/shared/components/DiaryCard';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diaryImageUrl';
import { mapFeelingToEmotion } from '@feature/diary/shared/utils/feeling';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useMemberProfileDiariesInfinite } from '@feature/member/hooks/useMemberQueries';
import { normalizeApiError } from '@module/api/error';
import { useInViewObserver } from '@module/hooks/useInViewObserver';
import { cn } from '@module/utils/cn';
import { getRelativeTimeLabel } from '@module/utils/date';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

const MEMBER_DIARY_PAGE_SIZE = 12;

interface MemberDiaryListScreenProps {
  memberId: string;
}

export function MemberDiaryListScreen({
  memberId,
}: MemberDiaryListScreenProps): React.ReactElement {
  const memberIdNum = Number(memberId);
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMemberProfileDiariesInfinite(memberIdNum, MEMBER_DIARY_PAGE_SIZE);
  const { ref, inView } = useInViewObserver();

  const diaryItems = useMemo(() => {
    const flattened =
      data?.pages?.flatMap((page) => page?.diaryList?.items ?? []) ?? [];
    const diaryMap = new Map<number, DiaryItem>();
    flattened.forEach((diary) => {
      diaryMap.set(diary.id, diary);
    });
    return Array.from(diaryMap.values());
  }, [data]);

  const hasDiaries = diaryItems.length > 0;
  const isLikePending = likeDiary.isPending || unlikeDiary.isPending;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLikeToggle = (diary: DiaryItem): void => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }
    if (isLikePending) {
      return;
    }
    if (diary.likeInfo.likedByMe) {
      unlikeDiary.mutate(diary.id);
    } else {
      likeDiary.mutate(diary.id);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
      <section className="rounded-3 w-full bg-white p-2">
        <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <Link
              href={`/member/${memberId}`}
              className="inline-flex w-fit items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              프로필로
            </Link>
            <Text size="display1" weight="bold" className="text-gray-900">
              일지 전체 보기
            </Text>
            <Text size="body1" weight="regular" className="text-gray-600">
              작성한 일지 전체 목록입니다.
            </Text>
          </div>
        </div>

        {isLoading ? (
          <DiaryCardSkeletonGrid
            count={MEMBER_DIARY_PAGE_SIZE}
            className={cn(
              'mt-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
              'lg:grid-cols-4 xl:grid-cols-6'
            )}
          />
        ) : null}

        {isError && !hasDiaries ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-red-600">
              {error
                ? normalizeApiError(error).message
                : '일지를 불러오지 못했습니다.'}
            </Text>
          </div>
        ) : null}

        {!isLoading && hasDiaries ? (
          <div
            className={cn(
              'data-fade-in mt-6 grid grid-cols-1 gap-4',
              'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
            )}
          >
            {diaryItems.map((diary) => (
              <DiaryCard
                key={diary.id}
                imageUrl={
                  resolveDiaryImageUrl(diary.imgUrl?.[0]) ||
                  '/images/default-card.png'
                }
                percent={Math.min(
                  100,
                  Math.max(
                    0,
                    diary.achievementRate ??
                      diary.diaryInfoDto?.achievementRate ??
                      0
                  )
                )}
                isLiked={diary.likeInfo.likedByMe}
                likes={diary.likeInfo.likeCnt}
                title={diary.title}
                user={diary.authorInfoDto?.nickname ?? '익명'}
                userImage={
                  resolveDiaryImageUrl(diary.authorInfoDto?.profileImage) ||
                  '/images/default-profile.png'
                }
                challengeLabel={
                  diary.challenge?.title ||
                  getCategoryLabel(diary.challenge?.category) ||
                  '일지'
                }
                onUserClick={
                  diary.authorInfoDto?.id
                    ? () =>
                        router.push(`/member/${diary.authorInfoDto!.id}`)
                    : undefined
                }
                onChallengeClick={() => {
                  if (diary.challenge?.challengeId) {
                    router.push(
                      `/challenge/${diary.challenge.challengeId}`
                    );
                  }
                }}
                date={getRelativeTimeLabel(
                  diary.diaryInfoDto?.createdAt ??
                    diary.diaryInfoDto?.challengedDate ??
                    ''
                )}
                emotion={mapFeelingToEmotion(
                  diary.diaryInfoDto?.feeling ?? 'NONE'
                )}
                commentCount={diary.commentCount}
                onLikeToggle={() => handleLikeToggle(diary)}
                onClick={() => router.push(`/diary/${diary.id}`)}
              />
            ))}
          </div>
        ) : null}

        {!isLoading && !isError && !hasDiaries ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              아직 작성한 일지가 없습니다.
            </Text>
          </div>
        ) : null}

        {isFetchingNextPage ? (
          <DiaryCardSkeletonGrid
            count={4}
            className={cn(
              'mt-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
              'lg:grid-cols-4 xl:grid-cols-6'
            )}
          />
        ) : null}

        <div
          ref={ref}
          className="mt-6 flex h-10 w-full items-center justify-center"
        >
          {isFetchingNextPage ? null : isError && hasDiaries ? (
            <Text size="body2" className="text-red-500">
              {error
                ? normalizeApiError(error).message
                : '추가 일지를 불러오지 못했습니다.'}
            </Text>
          ) : hasNextPage ? (
            <div />
          ) : hasDiaries ? (
            <Text size="body2" className="text-gray-400">
              마지막 일지입니다.
            </Text>
          ) : null}
        </div>
      </section>
    </div>
  );
}
