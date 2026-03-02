'use client';

import { DiaryCard, Text } from '@1d1s/design-system';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { useLikeDiary, useUnlikeDiary } from '../../detail/hooks/use-diary-mutations';
import { useAllDiaries } from '../hooks/use-diary-queries';
import { type DiaryItem, Feeling } from '../type/diary';

type SortMode = 'latest' | 'likes';
type DiaryEmotion = 'happy' | 'soso' | 'sad';
type DiaryItemWithAliases = DiaryItem & {
  author?: DiaryItem['authorInfoDto'] | null;
  diaryInfo?: DiaryItem['diaryInfoDto'] | null;
};

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

function sortDiaries(items: DiaryItem[], sortMode: SortMode): DiaryItem[] {
  const sorted = [...items];

  if (sortMode === 'likes') {
    sorted.sort(
      (leftDiary, rightDiary) =>
        rightDiary.likeInfo.likeCnt - leftDiary.likeInfo.likeCnt
    );
    return sorted;
  }

  sorted.sort((leftDiary, rightDiary) => {
    const leftDiaryWithAliases = leftDiary as DiaryItemWithAliases;
    const rightDiaryWithAliases = rightDiary as DiaryItemWithAliases;
    const leftDiaryInfo =
      leftDiaryWithAliases.diaryInfoDto ??
      leftDiaryWithAliases.diaryInfo ??
      null;
    const rightDiaryInfo =
      rightDiaryWithAliases.diaryInfoDto ??
      rightDiaryWithAliases.diaryInfo ??
      null;
    const leftDiaryTime = new Date(
      leftDiaryInfo?.createdAt || leftDiaryInfo?.challengedDate || ''
    ).getTime();
    const rightDiaryTime = new Date(
      rightDiaryInfo?.createdAt || rightDiaryInfo?.challengedDate || ''
    ).getTime();

    return rightDiaryTime - leftDiaryTime;
  });

  return sorted;
}

function getDiaryAuthorInfo(diary: DiaryItem): DiaryItem['authorInfoDto'] {
  const diaryWithAliases = diary as DiaryItemWithAliases;
  return diaryWithAliases.authorInfoDto ?? diaryWithAliases.author ?? null;
}

function getDiaryInfo(diary: DiaryItem): DiaryItem['diaryInfoDto'] {
  const diaryWithAliases = diary as DiaryItemWithAliases;
  return diaryWithAliases.diaryInfoDto ?? diaryWithAliases.diaryInfo ?? null;
}

function getDiaryAchievementRate(diary: DiaryItem): number {
  const diaryInfo = getDiaryInfo(diary);
  const rawAchievementRate =
    diary.achievementRate ?? diaryInfo?.achievementRate ?? 0;

  return Math.min(100, Math.max(0, rawAchievementRate));
}

export default function DiaryListScreen(): React.ReactElement {
  const router = useRouter();
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();
  const { data: diaries = [], isLoading, isError } = useAllDiaries();
  const isLikePending = likeDiary.isPending || unlikeDiary.isPending;

  const sortedDiaries = useMemo(
    () => sortDiaries(diaries, sortMode),
    [diaries, sortMode]
  );

  const handleLikeToggle = (diary: DiaryItem): void => {
    if (isLikePending) {
      return;
    }

    if (diary.likeInfo.likedByMe) {
      unlikeDiary.mutate(diary.id);
      return;
    }

    likeDiary.mutate(diary.id);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <section className="rounded-3 w-full bg-white p-2">
        <div className="flex items-start justify-between border-b border-gray-200 pb-5">
          <div className="flex flex-col gap-2">
            <Text size="display1" weight="bold" className="text-gray-900">
              일지
            </Text>
            <Text size="body1" weight="regular" className="text-gray-600">
              다른 챌린저의 일지를 보며 동기부여를 얻어보세요
            </Text>
          </div>

          <button
            type="button"
            className="mt-1 flex items-center gap-1 rounded-full px-3 py-2 text-gray-600 transition hover:bg-gray-200"
            onClick={() =>
              setSortMode((prev) => (prev === 'latest' ? 'likes' : 'latest'))
            }
          >
            <ArrowUpDown className="h-4 w-4" />
            <Text size="body2" weight="medium">
              {sortMode === 'latest' ? '최신순' : '좋아요순'}
            </Text>
          </button>
        </div>

        {isLoading ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              일지를 불러오는 중입니다.
            </Text>
          </div>
        ) : null}

        {isError ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-red-600">
              일지를 불러오지 못했습니다.
            </Text>
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <div className="diary-grid-container mt-6">
            <div className="diary-card-grid grid grid-cols-2 gap-4">
              {sortedDiaries.map((item) => {
                const diaryInfo = getDiaryInfo(item);
                const authorInfo = getDiaryAuthorInfo(item);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                  >
                    <DiaryCard
                      imageUrl={item.imgUrl?.[0] ?? '/images/default-card.png'}
                      percent={getDiaryAchievementRate(item)}
                      isLiked={item.likeInfo.likedByMe}
                      likes={item.likeInfo.likeCnt}
                      title={item.title}
                      user={authorInfo?.nickname ?? '익명'}
                      userImage={
                        authorInfo?.profileImage ?? '/images/default-profile.png'
                      }
                      challengeLabel={
                        item.challenge?.title ?? item.challenge?.category ?? '챌린지'
                      }
                      onChallengeClick={() =>
                        router.push(
                          item.challenge
                            ? `/challenge/${item.challenge.challengeId}`
                            : '/challenge'
                        )
                      }
                      date={toRelativeDateLabel(diaryInfo?.createdAt ?? '')}
                      emotion={mapFeelingToEmotion(diaryInfo?.feeling ?? 'NONE')}
                      onLikeToggle={() => handleLikeToggle(item)}
                      onClick={() => router.push(`/diary/${item.id}`)}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : null}

        {!isLoading && !isError && sortedDiaries.length === 0 ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              아직 등록된 일지가 없습니다.
            </Text>
          </div>
        ) : null}
      </section>
    </div>
  );
}
