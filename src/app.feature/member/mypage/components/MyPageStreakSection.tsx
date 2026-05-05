'use client';

import { Streak, Text } from '@1d1s/design-system';
import type { StreakCalendarItem } from '@feature/member/type/member';
import React from 'react';

import { buildYearStreak } from '../utils/mypageUtils';

interface MyPageStreakSectionProps {
  calendar: StreakCalendarItem[];
}

export function MyPageStreakSection({
  calendar,
}: MyPageStreakSectionProps): React.ReactElement {
  return (
    <section>
      <Text size="display2" weight="bold" className="text-gray-900">
        활동 기록
      </Text>
      <div className="mt-4">
        <Streak data={buildYearStreak(calendar)} size={14} gap={6} />
      </div>
    </section>
  );
}
