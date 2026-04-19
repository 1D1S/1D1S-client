import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

import type { Feeling } from '../../board/type/diary';
import type { MoodOption } from '../consts/diary-create-data';
import { DIARY_CREATE_MOOD_OPTIONS } from '../consts/diary-create-data';

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
        'rounded-2 relative flex h-[92px] w-[92px] cursor-pointer flex-col items-center justify-center border transition',
        active
          ? 'border-main-800 bg-main-100 text-main-800'
          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100',
      )}
    >
      {active ? (
        <span className="bg-main-800 absolute top-1 right-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white">
          PICK
        </span>
      ) : null}
      <Image
        src={option.imageSrc}
        alt={option.alt}
        width={52}
        height={52}
      />
      <Text size="caption2" weight="medium" className="mt-1">
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
    <div className="flex flex-wrap gap-2">
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
