'use client';

import React from 'react';
import { OdosPageBackground } from '@/shared/components/odos-ui/page-background';
import { OdosPageTitle } from '@/shared/components/odos-ui/page-title';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';
import { OdosPageWatermark } from '@/shared/components/odos-ui/page-watermark';
import { ChallengeListItem } from '@/shared/components/odos-ui/challenge-list-item';
import { OdosFooter } from '@/shared/components/odos-ui/footer';
import { SearchTextField } from '@/shared/components/odos-ui/search-text-field';

export default function ChallengeList(): React.ReactElement {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <OdosPageBackground className="min-h-screen min-w-250 px-5">
            <OdosSpacing className="h-20" />
            <OdosPageTitle title="챌린지 목록" />
            <OdosSpacing className="h-20" />

            <div className="flex w-full justify-end">
              <SearchTextField className="w-75" placeholder="검색어를 입력해주세요." />
            </div>
            <div className="w-full">
              {Array.from({ length: 10 }).map((_, idx) => (
                <ChallengeListItem
                  key={idx}
                  className="mt-6"
                  challengeName={`고라니 밥주기 챌린지 ${idx + 1}`}
                  startDate={'2025.04.05'}
                  endDate={'2025.04.10'}
                  maxParticipants={20}
                  currentParticipants={idx + 1}
                />
              ))}
            </div>

            <OdosSpacing className="h-20" />
            <OdosPageWatermark />
            <OdosSpacing className="h-20" />
          </OdosPageBackground>
        </div>
        <OdosFooter />
      </div>
  );
}
