'use client';

import { DiaryCard, Text } from '@1d1s/design-system';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { useDiaryList } from '../hooks/use-diary-queries';
import { DiaryItem } from '../type/diary';

type SortMode = 'latest' | 'likes';

function getRelativeTimeLabel(dateTime: string): string {
  const createdAt = new Date(dateTime).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - createdAt);
  const minuteMs = 60_000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.floor(diffMs / minuteMs));
    return `${minutes}분 전`;
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    return `${hours}시간 전`;
  }

  const days = Math.floor(diffMs / dayMs);
  return `${days}일 전`;
}

function mapFeelingToEmotion(
  feeling: DiaryItem['diaryInfo']['feeling']
): 'happy' | 'soso' | 'sad' {
  if (feeling === 'HAPPY') {
    return 'happy';
  }
  if (feeling === 'SAD') {
    return 'sad';
  }
  return 'soso';
}

export default function DiaryListScreen(): React.ReactElement {
  const router = useRouter();
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const { ref, inView } = useInView();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useDiaryList({ size: 20 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const diaries = useMemo(() => {
    const items = data?.pages.flatMap((page) => page.items ?? []) ?? [];

    return [...items].sort((a, b) => {
      if (sortMode === 'likes') {
        return b.likeInfo.likeCnt - a.likeInfo.likeCnt;
      }
      return (
        new Date(b.diaryInfo.createdAt).getTime() -
        new Date(a.diaryInfo.createdAt).getTime()
      );
    });
  }, [data, sortMode]);

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

        <div className="diary-grid-container mt-6">
          <div className="diary-card-grid grid grid-cols-2 gap-4">
            {diaries.map((item) => (
              <motion.div
                key={item.id}
                layout
                transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              >
                <DiaryCard
                  imageUrl={item.imgUrl ?? '/images/default-card.png'}
                  percent={item.diaryInfo.achievementRate ?? 0}
                  likes={item.likeInfo.likeCnt}
                  title={item.title}
                  user={item.authorInfo.nickname ?? '익명'}
                  userImage={item.authorInfo.profileImage ?? '/images/default-profile.png'}
                  challengeLabel={item.challenge?.title ?? '챌린지 미연결'}
                  challengeUrl={'/challenge'}
                  date={getRelativeTimeLabel(item.diaryInfo.createdAt)}
                  emotion={mapFeelingToEmotion(item.diaryInfo.feeling)}
                  onClick={() => router.push(`/diary/${item.id}`)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 py-8 text-center">
            <Text size="body2" weight="medium" className="text-gray-500">
              일지를 불러오는 중입니다...
            </Text>
          </div>
        ) : null}

        {isError ? (
          <div className="mt-6 py-8 text-center">
            <Text size="body2" weight="medium" className="text-red-600">
              일지 목록을 불러오지 못했습니다.
            </Text>
          </div>
        ) : null}

        <div ref={ref} className="h-8" />
        {isFetchingNextPage ? (
          <div className="pb-4 text-center">
            <Text size="body2" weight="medium" className="text-gray-500">
              추가 일지를 불러오는 중...
            </Text>
          </div>
        ) : null}
      </section>
    </div>
  );
}
