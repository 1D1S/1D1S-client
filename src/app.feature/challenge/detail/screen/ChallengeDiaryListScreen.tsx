'use client';

import { Text } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { getCategoryLabel } from '@constants/categories';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/useDiaryMutations';
import { DiaryCard } from '@feature/diary/shared/components/DiaryCard';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diaryImageUrl';
import { getRelativeDiaryDateLabel } from '@feature/diary/shared/utils/diaryRelativeTime';
import { mapFeelingToEmotion } from '@feature/diary/shared/utils/feeling';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { normalizeApiError } from '@module/api/error';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useChallengeDiaryListInfinite } from '../hooks/useChallengeDiaryQueries';
import { ChallengeDiaryItem } from '../type/challengeDiary';

const CHALLENGE_DIARY_PAGE_SIZE = 12;

interface ChallengeDiaryListScreenProps {
  id: string;
}

function useInViewObserver(): {
  ref: React.RefObject<HTMLDivElement | null>;
  inView: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [observedInView, setObservedInView] = useState(false);
  const isIntersectionObserverUnsupported =
    typeof window !== 'undefined' &&
    typeof IntersectionObserver === 'undefined';

  useEffect(() => {
    const target = ref.current;

    if (!target || typeof window === 'undefined') {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setObservedInView(entry.isIntersecting);
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  const inView = isIntersectionObserverUnsupported ? true : observedInView;

  return { ref, inView };
}

export function ChallengeDiaryListScreen({
  id,
}: ChallengeDiaryListScreenProps): React.ReactElement {
  const challengeId = Number(id);
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
  } = useChallengeDiaryListInfinite(challengeId, CHALLENGE_DIARY_PAGE_SIZE);
  const { ref, inView } = useInViewObserver();

  const diaryItems = useMemo(() => {
    const flattened = data?.pages?.flatMap((page) => page?.items ?? []) ?? [];
    const diaryMap = new Map<number, ChallengeDiaryItem>();
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

  const handleLikeToggle = (diary: ChallengeDiaryItem): void => {
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
              href={`/challenge/${id}`}
              className="inline-flex w-fit items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              챌린지 상세로
            </Link>
            <Text size="display1" weight="bold" className="text-gray-900">
              챌린지 일지
            </Text>
            <Text size="body1" weight="regular" className="text-gray-600">
              챌린지 참여자가 작성한 일지 목록입니다.
            </Text>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              일지를 불러오는 중입니다.
            </Text>
          </div>
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
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {diaryItems.map((diary) => (
              <DiaryCard
                key={diary.id}
                imageUrl={
                  resolveDiaryImageUrl(diary.imgUrl?.[0]) ||
                  '/images/default-card.png'
                }
                percent={Math.min(
                  100,
                  Math.max(0, diary.diaryInfo?.achievementRate ?? 0)
                )}
                isLiked={diary.likeInfo.likedByMe}
                likes={diary.likeInfo.likeCnt}
                title={diary.title}
                user={diary.author?.nickname ?? '익명'}
                userImage={
                  resolveDiaryImageUrl(diary.author?.profileImage) ||
                  '/images/default-profile.png'
                }
                challengeLabel={
                  diary.challenge?.title ||
                  getCategoryLabel(diary.challenge?.category) ||
                  '챌린지'
                }
                onUserClick={
                  diary.author?.id
                    ? () => router.push(`/member/${diary.author!.id}`)
                    : undefined
                }
                onChallengeClick={() => {
                  const targetChallengeId =
                    diary.challenge?.challengeId ?? challengeId;
                  if (targetChallengeId > 0) {
                    router.push(`/challenge/${targetChallengeId}`);
                  }
                }}
                date={getRelativeDiaryDateLabel(
                  diary.diaryInfo?.createdAt ??
                    diary.diaryInfo?.challengedDate ??
                    ''
                )}
                emotion={mapFeelingToEmotion(
                  diary.diaryInfo?.feeling ?? 'NONE'
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
              아직 등록된 일지가 없습니다.
            </Text>
          </div>
        ) : null}

        <div
          ref={ref}
          className="mt-6 flex h-10 w-full items-center justify-center"
        >
          {isFetchingNextPage ? (
            <Text size="body2" className="text-gray-400">
              데이터를 불러오는 중...
            </Text>
          ) : isError && hasDiaries ? (
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
