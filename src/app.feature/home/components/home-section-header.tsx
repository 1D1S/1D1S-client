import { Button, Text } from '@1d1s/design-system';
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
        <Button variant="ghost" size="small" onClick={onMoreClick}>
          전체 보기
        </Button>
      </div>
      <Text size="caption3" weight="medium" className="text-gray-600">
        {subtitle}
      </Text>
    </div>
  );
}
