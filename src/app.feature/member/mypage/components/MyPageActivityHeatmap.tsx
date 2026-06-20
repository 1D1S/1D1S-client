import { Heatmap, Text } from '@1d1s/design-system';
import type { StreakCalendarItem } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import { formatDateKR } from '@module/utils/date';
import React, { useMemo } from 'react';

import { buildHeatmapData } from '../utils/mypageUtils';

interface MyPageActivityHeatmapProps {
  calendar: StreakCalendarItem[];
}

function parseLocalDateKey(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/**
 * 최근 20주 (140일) 활동 잔디. DS Heatmap (7×20) 사용.
 * 셀에 hover 시 툴팁이 뜨고, 클릭하면 선택 상태로 고정된다.
 */
export function MyPageActivityHeatmap({
  calendar,
}: MyPageActivityHeatmapProps): React.ReactElement {
  const entries = useMemo(() => buildHeatmapData(calendar), [calendar]);
  const cells = useMemo(() => entries.map((item) => item.level), [entries]);

  return (
    <div
      className={cn(
        'rounded-4 flex h-full flex-col border border-gray-200',
        'bg-white p-6'
      )}
    >
      <Text size="caption1" weight="bold" className="text-gray-500">
        최근 20주 활동
      </Text>
      <div className="mt-4 flex flex-1 items-center">
        <Heatmap
          className="heatmap-stagger"
          cells={cells}
          cols={20}
          tone="main"
          ariaLabel={(index) => {
            const entry = entries[index];
            if (!entry) {
              return '';
            }
            const parsed = parseLocalDateKey(entry.date);
            const dateLabel = parsed ? formatDateKR(parsed) : entry.date;
            return entry.count > 0
              ? `${dateLabel} · 활동 ${entry.count}개`
              : `${dateLabel} · 기록 없음`;
          }}
          renderCellTooltip={({ index }) => {
            const entry = entries[index];
            if (!entry) {
              return null;
            }
            const parsed = parseLocalDateKey(entry.date);
            const dateLabel = parsed ? formatDateKR(parsed) : entry.date;
            return (
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold">{dateLabel}</span>
                <span className="text-gray-200">
                  {entry.count > 0 ? `활동 ${entry.count}개` : '기록 없음'}
                </span>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
