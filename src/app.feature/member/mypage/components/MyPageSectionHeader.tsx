import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

interface MyPageSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * 페이지 섹션 헤더 (DS SectionHeader 가 v0.2.x 에 없어 로컬 구현).
 * 제목 + 부제 + 우측 액션 슬롯.
 */
export function MyPageSectionHeader({
  title,
  subtitle,
  action,
  className,
}: MyPageSectionHeaderProps): React.ReactElement {
  return (
    <div className={cn('flex items-baseline justify-between gap-3', className)}>
      <div className="min-w-0">
        <Text size="display2" weight="bold" className="text-gray-900">
          {title}
        </Text>
        {subtitle && (
          <Text
            size="caption1"
            weight="regular"
            className="mt-1 block text-gray-500"
          >
            {subtitle}
          </Text>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
