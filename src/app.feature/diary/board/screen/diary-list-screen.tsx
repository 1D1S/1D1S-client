'use client';

import { DiaryCard, Text } from '@1d1s/design-system';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { COMMUNITY_DIARIES, SortMode } from '../consts/diary-list-data';

export default function DiaryListScreen(): React.ReactElement {
  const router = useRouter();
  const [sortMode, setSortMode] = useState<SortMode>('latest');

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
            {COMMUNITY_DIARIES.map((item) => (
              <motion.div
                key={item.id}
                layout
                transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              >
                <DiaryCard
                  imageUrl={item.imageUrl}
                  percent={item.percent}
                  likes={item.likes}
                  title={item.title}
                  user={item.user}
                  userImage={'/images/default-profile.png'}
                  challengeLabel={item.challengeLabel}
                  challengeUrl={'/challenge'}
                  date={item.date}
                  emotion={item.emotion}
                  onClick={() => router.push(`/diary/${item.id}`)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
