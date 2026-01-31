'use client';

import React, { useState } from 'react';
import {
  PageTitle,
  Spacing,
  PageWatermark,
  Text,
  TextField,
  ChallengeListItem,
} from '@1d1s/design-system';
import { ChallengePicker } from '@feature/diary/presentation/components/challenge-picker';
import { ChallengeGoalToggle } from '@feature/diary/presentation/components/challenge-goal-toggle';
import { DiaryContentField } from '@feature/diary/presentation/components/diary-content-field';
import BottomExpandablePanel from '@feature/diary/presentation/components/bottom-expandable-panel';

export default function DiaryCreate(): React.ReactElement {
  const [challengeSelected, setChallengeSelected] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState(false);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | undefined>(undefined);
  const [preview, setPreview] = useState<string | undefined>(undefined);

  const handleImageSelect = (file: File): void => {
    setImage(file);
    setImage(image);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="flex w-full flex-col px-4">
        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageTitle title="일지 작성" />
        </div>

        <div className="flex w-full flex-col">
          <Text size="heading2" weight="bold" className="mt-8">
            일지 제목
          </Text>
          <TextField className="mt-3 flex" placeholder="일지 제목" />

          <Text size="heading2" weight="bold" className="mt-8">
            챌린지
          </Text>
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

          <Text size="heading2" weight="bold" className="mt-8">
            챌린지 목표
          </Text>
          {challengeSelected ? (
            <ChallengeGoalToggle
              className="mt-3"
              label={'고라니 밥주기'}
              checked={isChecked}
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

          <Text size="heading2" weight="bold" className="mt-8">
            일지 내용
          </Text>
          <DiaryContentField
            className="mt-3"
            value={content}
            imageSrc={preview}
            onChange={setContent}
            onImageSelect={handleImageSelect}
          />
        </div>

        <Spacing className="h-12" />
        <div className="flex w-full justify-center">
          <PageWatermark />
        </div>
        <Spacing className="h-8" />
      </div>
      <BottomExpandablePanel />
    </div>
  );
}
