'use client';

import React from 'react';
import { OdosPageBackground } from '@/shared/components/odos-ui/page-background';
import { OdosPageTitle } from '@/shared/components/odos-ui/page-title';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';
import { OdosPageWatermark } from '@/shared/components/odos-ui/page-watermark';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosTextField } from '@/shared/components/odos-ui/text-field';
import { ChallengePicker } from '@/features/diary/presentation/components/challenge-picker';

export default function DiaryCreate(): React.ReactElement {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <OdosPageBackground className="min-h-screen min-w-250 px-7.5">
          <OdosSpacing className="h-20" />
          <OdosPageTitle title="일지 작성" />

          <div className="flex w-full flex-col self-start">
            <OdosLabel size="heading2" weight="bold" className="mt-12">
              일지 제목
            </OdosLabel>
            <OdosTextField className="text-10xl mt-3 flex" placeholder="일지 제목" />
            <OdosLabel size="heading2" weight="bold" className="mt-12">
              챌린지
            </OdosLabel>
            <ChallengePicker className="mt-3" />
            <OdosLabel size="heading2" weight="bold" className="mt-12">
              챌린지 목표
            </OdosLabel>
            <ChallengePicker className="mt-3" />
            <OdosLabel size="heading2" weight="bold" className="mt-12">
              일지 내용
            </OdosLabel>
          </div>
          <OdosSpacing className="h-20" />
          <OdosPageWatermark />
          <OdosSpacing className="h-20" />
        </OdosPageBackground>
      </div>
    </div>
  );
}
