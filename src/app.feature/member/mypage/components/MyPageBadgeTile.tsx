import { AchievementBadge } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

import type { AchievementBadgeTone } from '../utils/mypageUtils';

interface MyPageBadgeTileProps {
  emoji: string;
  label: string;
  tone: AchievementBadgeTone;
  achieved: boolean;
}

export function MyPageBadgeTile({
  emoji,
  label,
  tone,
  achieved,
}: MyPageBadgeTileProps): React.ReactElement {
  return (
    <AchievementBadge
      emoji={emoji}
      label={label}
      tone={tone}
      layout="vertical"
      size="lg"
      className={cn(!achieved && 'opacity-60')}
    />
  );
}
