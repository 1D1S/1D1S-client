'use client';

import { DiaryCard, Text } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/login-required-dialog';
import { DiaryItem, Feeling } from '@feature/diary/board/type/diary';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/use-diary-mutations';
import { normalizeApiError } from '@module/api/error';
import { authStorage } from '@module/utils/auth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useChallengeDiaryList } from '../hooks/use-challenge-diary-queries';

type DiaryEmotion = 'happy' | 'soso' | 'sad';

interface ChallengeDiaryListScreenProps {
  id: string;
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat('ko', {
  numeric: 'auto',
});

function mapFeelingToEmotion(feeling: Feeling): DiaryEmotion {
  switch (feeling) {
    case 'HAPPY':
      return 'happy';
    case 'SAD':
      return 'sad';
    case 'NORMAL':
    case 'NONE':
    default:
      return 'soso';
  }
}

function toRelativeDateLabel(createdAt: string): string {
  if (!createdAt) {
    return '방금 전';
  }

  const targetDate = new Date(createdAt);
  if (Number.isNaN(targetDate.getTime())) {
    return '방금 전';
  }

  const diffMinutes = Math.round((targetDate.getTime() - Date.now()) / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 60) {
    return relativeTimeFormatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return relativeTimeFormatter.format(diffDays, 'day');
}

function getDiaryAchievementRate(diary: DiaryItem): number {
  const rate =
    diary.achievementRate ?? diary.diaryInfoDto?.achievementRate ?? 0;
  return Math.min(100, Math.max(0, rate));
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

    return () => observer.disconnect();
  }, []);

  return {
    ref,
    inView: isIntersectionObserverUnsupported ? true : observedInView,
  };
}

export function ChallengeDiaryListScreen({
  id,
}: ChallengeDiaryListScreenProps): React.ReactElement {
  const challengeId = Number(id);
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
  } = useChallengeDiaryList(challengeId, { size: 12 });
  const { ref, inView } = useInViewObserver();

  const diaries = useMemo(() => {
    const flattened = data?.pages?.flatMap((page) => page?.items ?? []) ?? [];
    const map = new Map<number, DiaryItem>();
    flattened.forEach((diary) => map.set(diary.id, diary));
    return Array.from(map.values());
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const hasDiaries = diaries.length > 0;
  const isLikePending = likeDiary.isPending || unlikeDiary.isPending;

  const handleLikeToggle = (diary: DiaryItem): void => {
    if (!authStorage.hasTokens()) {
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
            {diaries.map((diary) => {
              const diaryInfo = diary.diaryInfoDto;
              const authorInfo = diary.authorInfoDto;

              return (
                <DiaryCard
                  key={diary.id}
                  imageUrl={diary.imgUrl?.[0] ?? '/images/default-card.png'}
                  percent={getDiaryAchievementRate(diary)}
                  isLiked={diary.likeInfo.likedByMe}
                  likes={diary.likeInfo.likeCnt}
                  title={diary.title}
                  user={authorInfo?.nickname ?? '익명'}
                  userImage={
                    authorInfo?.profileImage ?? '/images/default-profile.png'
                  }
                  challengeLabel={
                    diary.challenge?.title ??
                    diary.challenge?.category ??
                    '챌린지'
                  }
                  onChallengeClick={() => undefined}
                  date={toRelativeDateLabel(diaryInfo?.createdAt ?? '')}
                  emotion={mapFeelingToEmotion(diaryInfo?.feeling ?? 'NONE')}
                  onLikeToggle={() => handleLikeToggle(diary)}
                  onClick={() => undefined}
                />
              );
            })}
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
          className="mt-4 flex h-10 w-full items-center justify-center"
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
