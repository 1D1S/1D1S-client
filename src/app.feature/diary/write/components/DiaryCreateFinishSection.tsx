import { Text } from '@1d1s/design-system';
import React from 'react';

import type { Feeling } from '../../board/type/diary';
import { DiaryCreateDatePicker } from './DiaryCreateDatePicker';
import { DiaryCreateMoodSelector } from './DiaryCreateMoodSelector';

interface DiaryCreateFinishSectionProps {
  achievedDate: Date | undefined;
  onAchievedDateChange(date: Date | undefined): void;
  disabledAchievedDateKeys: string[];
  challengeStartDate?: string;
  selectedMood: Feeling;
  onMoodChange(mood: Feeling): void;
}

export function DiaryCreateFinishSection({
  achievedDate,
  onAchievedDateChange,
  disabledAchievedDateKeys,
  challengeStartDate,
  selectedMood,
  onMoodChange,
}: DiaryCreateFinishSectionProps): React.ReactElement {
  return (
    <section>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Text size="caption1" weight="bold" className="mb-2 block text-gray-600">
            언제의 기록인가요?
          </Text>
          <DiaryCreateDatePicker
            value={achievedDate}
            onChange={onAchievedDateChange}
            disabledDateKeys={disabledAchievedDateKeys}
            challengeStartDate={challengeStartDate}
            placeholder="날짜를 선택해주세요"
          />
          <Text size="caption2" weight="regular" className="mt-1.5 text-gray-400">
            오늘 포함 최근 3일 중 이미 작성한 날짜는 비활성화됩니다.
          </Text>
        </div>

        <div>
          <Text size="caption1" weight="bold" className="mb-2 block text-gray-600">
            오늘의 기분
          </Text>
          <DiaryCreateMoodSelector
            selectedMood={selectedMood}
            onSelectMood={onMoodChange}
          />
        </div>
      </div>
    </section>
  );
}
