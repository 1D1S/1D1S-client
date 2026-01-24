// pages/DiaryCreate.tsx (혹은 DiaryCreate 컴포넌트 부분)
'use client';

import React, { useState } from 'react';
import { OdosPageBackground } from '@/shared/components/odos-ui/page-background';
import { OdosPageTitle } from '@/shared/components/odos-ui/page-title';
import { OdosSpacing } from '@/shared/components/odos-ui/spacing';
import { OdosPageWatermark } from '@/shared/components/odos-ui/page-watermark';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { OdosTextField } from '@/shared/components/odos-ui/text-field';
import { ChallengePicker } from '@/features/diary/presentation/components/challenge-picker';
import { ChallengeGoalToggle } from '@/features/diary/presentation/components/challenge-goal-toggle';
import { DiaryContentField } from '@/features/diary/presentation/components/diary-content-field';
import BottomExpandablePanel from '@/features/diary/presentation/components/bottom-expandable-panel';
import { ChallengeListItem } from '@/shared/components/odos-ui/challenge-list-item';

export default function DiaryCreate(): React.ReactElement {
  const [challengeSelected, setChallengeSelected] = useState<boolean>(false);

  // ✅ isChecked 상태를 useState로 선언
  const [isChecked, setIsChecked] = useState(false);

  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | undefined>(undefined);
  const [preview, setPreview] = useState<string | undefined>(undefined);

  // 이미지가 선택되면 미리보기 URL 생성
  const handleImageSelect = (file: File): void => {
    setImage(file);
    setImage(image); // Lint 오류 방지용
    setPreview(URL.createObjectURL(file));
  };

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
              {challengeSelected ? (
                <ChallengeListItem
                  className="mt-3 transition-colors duration-200 hover:bg-gray-100"
                  onClick={() => setChallengeSelected(false)}
                  challengeName={''}
                  startDate={''}
                  endDate={''}
                  maxParticipants={0}
                  currentParticipants={0}
                />
              ) : (
                <ChallengePicker
                  className="mt-3"
                  onSelect={() => {
                    setChallengeSelected(true);
                  }}
                />
              )}

              <OdosLabel size="heading2" weight="bold" className="mt-12">
                챌린지 목표
              </OdosLabel>
              {challengeSelected ? (
                <ChallengeGoalToggle
                  className="mt-3"
                  label={'고라니 밥주기'}
                  checked={isChecked} // ✅ 여기
                  onCheckedChange={(newChecked: boolean) => {
                    setIsChecked(newChecked);
                  }}
                />
              ) : (
                <ChallengePicker
                  className="mt-3"
                  onSelect={() => {
                    setChallengeSelected(true);
                  }}
                />
              )}

              <OdosLabel size="heading2" weight="bold" className="mt-12">
                일지 내용
              </OdosLabel>
              <DiaryContentField
                className="mt-3"
                value={content}
                imageSrc={preview}
                onChange={setContent}
                onImageSelect={handleImageSelect}
              />
            </div>
            <OdosSpacing className="h-20" />
            <OdosPageWatermark />
            <OdosSpacing className="h-20" />
          </OdosPageBackground>
        </div>
        <BottomExpandablePanel></BottomExpandablePanel>
      </div>
  );
}
