import { Text } from '@1d1s/design-system';
import React from 'react';

interface HomeSectionHeaderProps {
  title: string;
  subtitle: string;
  onMoreClick?(): void;
}

export default function HomeSectionHeader({
  title,
  subtitle,
  onMoreClick,
}: HomeSectionHeaderProps): React.ReactElement {
  return (
    <div className="flex w-full flex-col gap-2 px-4">
      <div className="flex flex-row items-center gap-2">
        <Text size="heading1" weight="bold" className="text-black">
          {title}
        </Text>
        <button
          type="button"
          onClick={onMoreClick}
          className="cursor-pointer text-gray-500 transition-colors hover:text-gray-700"
        >
          <Text size="body2" weight="medium" className="text-inherit">
            더보기 +
          </Text>
        </button>
      </div>
      <Text size="caption3" weight="medium" className="text-gray-600">
        {subtitle}
      </Text>
    </div>
  );
}
