'use client';

import React from 'react';
import { DiaryCard } from '../../../shared/components/odos-ui/diary-card';
import { OdosPageBackground } from '@/shared/components/odos-ui/page-background';
import { OdosPageTitle } from '@/shared/components/odos-ui/page-title';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';
import { OdosPageWatermark } from '@/shared/components/odos-ui/page-watermark';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { useDiaryItems } from '@/features/diary/presentation/hooks/diary-items';

export default function DiaryList(): React.ReactElement {
  const { items, loading } = useDiaryItems(12, 12);

  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <OdosPageBackground className="min-h-screen min-w-250 px-5">
          <OdosSpacing className="h-20" />
          <OdosPageTitle title="일지 목록" />
          <OdosSpacing className="h-20" />

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
              <OdosSpacing className="h-20" />
              <OdosLabel size="body1" weight="regular">
                로딩 중...
              </OdosLabel>
            </div>
          )}

          <OdosSpacing className="h-20" />
          <OdosPageWatermark />
          <OdosSpacing className="h-20" />
        </OdosPageBackground>
      </div>
    </div>
  );
}
