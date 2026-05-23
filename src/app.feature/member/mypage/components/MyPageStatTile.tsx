import { Icon, type IconName, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

export type StatTileTone = 'white' | 'brand' | 'mint' | 'blue' | 'gray';

interface MyPageStatTileProps {
  label: string;
  value: React.ReactNode;
  helper?: string;
  iconName?: IconName;
  tone?: StatTileTone;
}

const toneClass: Record<StatTileTone, string> = {
  white: 'border-gray-200 bg-white',
  brand: 'border-main-200 bg-main-100',
  mint: 'border-mint-200 bg-mint-100',
  blue: 'border-blue-200 bg-blue-200/50',
  gray: 'border-gray-200 bg-gray-50',
};

/**
 * 마이페이지/대시보드용 통계 타일.
 * DS StatCard 가 v0.2.x 에 없어 로컬 구현 (1.1.x StatCard 와 동일한 API/룩).
 */
export function MyPageStatTile({
  label,
  value,
  helper,
  iconName,
  tone = 'white',
}: MyPageStatTileProps): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-3 border p-4',
        toneClass[tone],
      )}
    >
      <div className="flex items-center gap-1.5">
        {iconName && (
          <span
            className={cn(
              'inline-flex h-4 w-4 items-center justify-center',
              'text-gray-500'
            )}
          >
            <Icon name={iconName} size={14} aria-hidden />
          </span>
        )}
        <Text size="caption2" weight="medium" className="text-gray-500">
          {label}
        </Text>
      </div>
      <div
        className={cn(
          'mt-1.5 text-2xl font-extrabold tracking-[-0.4px]',
          'leading-none text-gray-900 tabular-nums',
        )}
      >
        {value}
      </div>
      {helper && (
        <Text
          size="caption2"
          weight="regular"
          className="mt-1.5 block text-gray-500"
        >
          {helper}
        </Text>
      )}
    </div>
  );
}
