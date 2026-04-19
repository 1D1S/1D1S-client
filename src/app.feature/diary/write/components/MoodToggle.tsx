// MoodToggle.tsx
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

export type Mood = 'happy' | 'soso' | 'sad';

interface MoodToggleProps {
  selected?: Mood;
  onSelect(mood: Mood): void;
}

const options = [
  { id: 'happy' as Mood, src: '/images/mood-happy.PNG', alt: '행복한 얼굴' },
  { id: 'soso' as Mood, src: '/images/mood-soso.PNG', alt: '무표정 얼굴' },
  { id: 'sad' as Mood, src: '/images/mood-sad.PNG', alt: '슬픈 얼굴' },
];

export function MoodToggle({
  selected,
  onSelect,
}: MoodToggleProps): React.ReactElement {
  return (
    <div className="bg-main-200 flex h-30 w-100 items-center justify-center space-x-4 rounded-xl p-4">
      {options.map((option) => {
        const isActive = selected === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              'relative rounded-lg p-2 transition-colors focus:outline-none',
              isActive ? 'bg-main-500' : 'bg-transparent',
            )}
          >
            <Image width={60} height={60} src={option.src} alt={option.alt} />
          </button>
        );
      })}
    </div>
  );
}
