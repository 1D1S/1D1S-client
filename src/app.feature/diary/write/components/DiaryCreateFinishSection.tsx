import { DatePicker, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

import type { Feeling } from '../../board/type/diary';
import { DiaryCreateMoodSelector } from './DiaryCreateMoodSelector';

interface DiaryCreateFinishSectionProps {
  achievedDate: Date | undefined;
  onAchievedDateChange(date: Date | undefined): void;
  isDateDisabled(date: Date): boolean;
  selectedMood: Feeling;
  onMoodChange(mood: Feeling): void;
  thumbnailSlot?: React.ReactNode;
}

function DiaryCreateFinishSectionComponent({
  achievedDate,
  onAchievedDateChange,
  isDateDisabled,
  selectedMood,
  onMoodChange,
  thumbnailSlot,
}: DiaryCreateFinishSectionProps): React.ReactElement {
  const leftColumn = (
    <div className="flex flex-col gap-5">
      <div>
        <Text
          size="caption1"
          weight="bold"
          className="mb-2 block text-gray-600"
        >
          언제의 기록인가요?
        </Text>
        <DatePicker
          value={achievedDate}
          onChange={onAchievedDateChange}
          placeholder="날짜를 선택해주세요"
          calendarProps={{ disabled: isDateDisabled }}
        />
        <Text size="caption2" weight="regular" className="mt-1.5 text-gray-400">
          오늘 포함 최근 3일 중 작성 가능한 날짜만 반영됩니다.
        </Text>
      </div>

      <div>
        <Text
          size="caption1"
          weight="bold"
          className="mb-2 block text-gray-600"
        >
          오늘의 기분
        </Text>
        <DiaryCreateMoodSelector
          selectedMood={selectedMood}
          onSelectMood={onMoodChange}
        />
      </div>
    </div>
  );

  if (!thumbnailSlot) {
    return <section>{leftColumn}</section>;
  }

  return (
    <section>
      <div
        className={cn(
          'grid gap-5',
          'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
        )}
      >
        {leftColumn}
        <div>{thumbnailSlot}</div>
      </div>
    </section>
  );
}

export const DiaryCreateFinishSection = React.memo(
  DiaryCreateFinishSectionComponent
);
