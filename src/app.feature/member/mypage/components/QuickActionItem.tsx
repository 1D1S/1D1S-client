'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

interface QuickActionItemProps {
  icon: React.ReactNode;
  title: string;
  onClick(): void;
  tone?: 'main' | 'blue';
}

export function QuickActionItem({
  icon,
  title,
  onClick,
  tone = 'main',
}: QuickActionItemProps): React.ReactElement {
  const iconClass =
    tone === 'main'
      ? 'bg-main-200 text-main-800'
      : 'bg-blue-100 text-blue-600';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full cursor-pointer items-center justify-between',
        'rounded-2xl border border-gray-200 bg-white px-3 py-3',
        'transition hover:bg-gray-100',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            iconClass,
          )}
        >
          {icon}
        </span>
        <Text size="heading2" weight="medium" className="text-gray-800">
          {title}
        </Text>
      </div>
      <Text size="heading2" weight="medium" className="text-gray-400">
        ›
      </Text>
    </button>
  );
}
