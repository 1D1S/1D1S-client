import { Text } from '@1d1s/design-system';
import { ResponsiveCheckList } from '@component/ResponsiveCheckList';
import { cn } from '@module/utils/cn';
import React, { useMemo } from 'react';

import type { ChecklistItem } from '../utils/diaryViewData';

const NOOP_VALUE_CHANGE = (): void => {};

interface DiaryGoalsCardProps {
  checklistItems: ChecklistItem[];
  checkedChecklistIds: string[];
}

export function DiaryGoalsCard({
  checklistItems,
  checkedChecklistIds,
}: DiaryGoalsCardProps): React.ReactElement {
  const checklistOptions = useMemo(
    () =>
      checklistItems.map((item) => ({
        id: item.id,
        label: item.label,
      })),
    [checklistItems]
  );
  return (
    <section
      className={cn(
        'rounded-[14px] border border-gray-100 bg-gray-50',
        'lg:border-gray-200 lg:bg-white',
        'p-4 sm:p-5'
      )}
    >
      <div className="mb-4 flex items-baseline justify-between">
        <Text size="caption1" weight="bold" className="text-gray-900">
          오늘의 목표
        </Text>
        <Text size="caption2" weight="medium" className="text-gray-500">
          {checkedChecklistIds.length}/{checklistItems.length} 달성
        </Text>
      </div>
      {checklistItems.length > 0 ? (
        <ResponsiveCheckList
          options={checklistOptions}
          value={checkedChecklistIds}
          onValueChange={NOOP_VALUE_CHANGE}
          readOnly
        />
      ) : (
        <Text size="caption1" weight="regular" className="text-gray-500">
          달성 목표 데이터가 없습니다.
        </Text>
      )}
    </section>
  );
}
