'use client';

import React from 'react';

import {
  PageBackground,
  PageTitle,
  Spacing,
  PageWatermark,
  Text,
  DiaryCard,
} from '@1d1s/design-system';
import { useDiaryItems } from '@/features/diary/presentation/hooks/diary-items';

export default function DiaryList(): React.ReactElement {
  const { items, loading } = useDiaryItems(12, 12);

  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <PageBackground className="min-h-screen min-w-250 px-5">
            <Spacing className="h-20" />
            <PageTitle title="일지 목록" />
            <Spacing className="h-20" />

            <div className="grid grid-cols-4 gap-5">
              {items.map((item) => (
                <DiaryCard
                  key={item.id}
                  imageUrl={item.imageUrl}
                  percent={item.percent}
                  likes={item.likes}
                  title={item.title}
                  user={item.user}
                  userImage={item.userImage}
                  challengeLabel={item.challengeLabel}
                  challengeUrl={item.challengeUrl}
                  date={item.date}
                  emotion={item.emotion}
                />
              ))}
            </div>

            {loading && (
              <div className="flex flex-col justify-center py-4">
                <Spacing className="h-20" />
                <Text size="body1" weight="regular">
                  로딩 중...
                </Text>
              </div>
            )}

            <Spacing className="h-20" />
            <PageWatermark />
            <Spacing className="h-20" />
          </PageBackground>
        </div>
      </div>
  );
}
