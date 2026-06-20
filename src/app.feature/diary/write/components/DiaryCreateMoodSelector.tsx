import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

import type { Feeling } from '../../board/type/diary';
import type { MoodOption } from '../consts/diaryCreateData';
import { DIARY_CREATE_MOOD_OPTIONS } from '../consts/diaryCreateData';

function MoodOptionButton({
  option,
  active,
  onClick,
}: {
  option: MoodOption;
  active: boolean;
  onClick(): void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-3 relative flex flex-1 cursor-pointer flex-col items-center',
        'justify-center gap-1 border px-3 py-3 transition',
        active
          ? 'border-main-800 bg-main-100 text-main-800'
          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
      )}
    >
      {/* 무드 SVG: prod 최적화기 SVG 차단 회피 위해 unoptimized 로 직접 서빙 */}
      <Image
        src={option.imageSrc}
        alt={option.alt}
        width={36}
        height={36}
        unoptimized
      />
      <Text size="caption2" weight="medium" className="mt-0.5">
        {option.label}
      </Text>
    </button>
  );
}

interface DiaryCreateMoodSelectorProps {
  selectedMood: Feeling;
  onSelectMood(mood: Feeling): void;
}

export function DiaryCreateMoodSelector({
  selectedMood,
  onSelectMood,
}: DiaryCreateMoodSelectorProps): React.ReactElement {
  return (
    <div className="flex gap-2">
      {DIARY_CREATE_MOOD_OPTIONS.map((option) => (
        <MoodOptionButton
          key={option.id}
          option={option}
          active={selectedMood === option.id}
          onClick={() => onSelectMood(option.id)}
        />
      ))}
    </div>
  );
}
