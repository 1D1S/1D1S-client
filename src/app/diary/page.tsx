'use client';

import React from 'react';
import {
  PageTitle,
  Spacing,
  PageWatermark,
  Text,
  DiaryCard,
} from '@1d1s/design-system';
import { useDiaryItems } from '@feature/diary/presentation/hooks/diary-items';

export default function DiaryList(): React.ReactElement {
  const { items, loading } = useDiaryItems(12, 12);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      {/* 메인 콘텐츠 */}
      <div className="flex w-full flex-col px-4 pt-16">
        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageTitle title="일지 목록" />
        </div>
        <Spacing className="h-8" />

        <div className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <div className="flex flex-col items-center justify-center py-4">
            <Text size="body1" weight="regular">
              로딩 중...
            </Text>
          </div>
        )}

        <Spacing className="h-12" />
        <div className="flex w-full justify-center">
          <PageWatermark />
        </div>
        <Spacing className="h-8" />
      </div>
    </div>
  );
}
