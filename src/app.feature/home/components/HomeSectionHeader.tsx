import { Text } from '@1d1s/design-system';
import React from 'react';

interface HomeSectionHeaderProps {
  title: string;
  subtitle: string;
  emoji?: string;
  onMoreClick?(): void;
}

export default function HomeSectionHeader({
  title,
  subtitle,
  emoji,
  onMoreClick,
}: HomeSectionHeaderProps): React.ReactElement {
  return (
    <div className="w-full px-5">
      <div className="flex items-baseline justify-between gap-3">
        <Text size="body1" weight="extrabold" className="text-gray-900">
          {emoji ? (
            <span aria-hidden className="mr-1.5">
              {emoji}
            </span>
          ) : null}
          {title}
        </Text>
        {onMoreClick ? (
          <button
            type="button"
            onClick={onMoreClick}
            className="text-brand hover:text-main-900 text-xs font-bold transition"
          >
            전체 보기
          </button>
        ) : null}
      </div>
      <Text size="caption2" weight="medium" className="mt-1 text-gray-500">
        {subtitle}
      </Text>
    </div>
  );
}
