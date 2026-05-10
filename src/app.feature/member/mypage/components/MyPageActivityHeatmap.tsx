import { Heatmap, Text } from '@1d1s/design-system';
import type { StreakCalendarItem } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import React from 'react';

import { buildHeatmapData } from '../utils/mypageUtils';

interface MyPageActivityHeatmapProps {
  calendar: StreakCalendarItem[];
}

/**
 * 최근 20주 (140일) 활동 잔디. DS Heatmap (7×20) 사용.
 */
export function MyPageActivityHeatmap({
  calendar,
}: MyPageActivityHeatmapProps): React.ReactElement {
  const cells = buildHeatmapData(calendar).map((item) => item.count);

  return (
    <div
      className={cn(
        'rounded-4 flex h-full flex-col border border-gray-200',
        'bg-white p-6',
      )}
    >
      <Text size="caption1" weight="bold" className="text-gray-500">
        최근 20주 활동
      </Text>
      <div className="mt-4 flex flex-1 items-center">
        <Heatmap cells={cells} cols={20} tone="main" />
      </div>
    </div>
  );
}
