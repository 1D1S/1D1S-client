import { Checkbox, Text } from '@1d1s/design-system';
import React from 'react';

import type { Feeling } from '../../board/type/diary';
import { DiaryCreateDatePicker } from './diary-create-date-picker';
import { DiaryCreateMoodSelector } from './diary-create-mood-selector';

interface DiaryCreateFinishSectionProps {
  achievedDate: Date | undefined;
  onAchievedDateChange(date: Date | undefined): void;
  disabledAchievedDateKeys: string[];
  challengeStartDate?: string;
  selectedMood: Feeling;
  onMoodChange(mood: Feeling): void;
  isPublic: boolean;
  onPublicChange(value: boolean): void;
}

export function DiaryCreateFinishSection({
  achievedDate,
  onAchievedDateChange,
  disabledAchievedDateKeys,
  challengeStartDate,
  selectedMood,
  onMoodChange,
  isPublic,
  onPublicChange,
}: DiaryCreateFinishSectionProps): React.ReactElement {
  return (
    <section className="border-t border-gray-200 pt-8">
      <Text size="heading1" weight="bold" className="text-gray-900">
        일지 마무리
      </Text>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Text size="body1" weight="medium" className="mb-4 text-gray-700">
            언제의 기록인가요?
          </Text>
          <DiaryCreateDatePicker
            value={achievedDate}
            onChange={onAchievedDateChange}
            disabledDateKeys={disabledAchievedDateKeys}
            challengeStartDate={challengeStartDate}
            placeholder="날짜를 선택해주세요"
          />
          <Text size="caption1" weight="regular" className="mt-2 text-gray-500">
            오늘 포함 최근 3일 중 이미 작성한 날짜는 비활성화됩니다.
          </Text>
        </div>

        <div>
          <Text size="body1" weight="medium" className="mb-4 text-gray-700">
            오늘의 기분은 어땠나요?
          </Text>
          <DiaryCreateMoodSelector
            selectedMood={selectedMood}
            onSelectMood={onMoodChange}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Checkbox
          id="isPublic"
          checked={isPublic}
          onCheckedChange={(checked) => onPublicChange(Boolean(checked))}
        />
        <label htmlFor="isPublic">
          <Text size="body2" weight="medium" className="text-gray-700">
            일지를 공개합니다
          </Text>
        </label>
      </div>
    </section>
  );
}
