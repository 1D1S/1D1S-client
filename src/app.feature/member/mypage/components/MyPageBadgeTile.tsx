import { AchievementBadge, Icon, type IconName } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

import type { AchievementBadgeTone } from '../utils/mypageUtils';

interface MyPageBadgeTileProps {
  badgeId: string;
  label: string;
  tone: AchievementBadgeTone;
  achieved: boolean;
}

function SproutBadgeIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M12 20V13"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <path
        d="M12 13c0-3 2-5 5-5c0 3-2 5-5 5Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15c0-2.5-1.6-4.2-4-5c-.2 2.8 1 4.8 4 5Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getBadgeIcon(badgeId: string): React.ReactNode {
  const iconMap: Record<string, IconName> = {
    'streak-7': 'Flame',
    'first-finish': 'Trophy',
    'diary-30': 'BookOpen',
    'challenge-3': 'Target',
  };
  const iconName = iconMap[badgeId];
  if (iconName) {
    return <Icon name={iconName} size={20} aria-hidden />;
  }

  // TODO(DS): 디자인 시스템에 새싹 배지 아이콘이 추가되면 교체한다.
  return <SproutBadgeIcon />;
}

export function MyPageBadgeTile({
  badgeId,
  label,
  tone,
  achieved,
}: MyPageBadgeTileProps): React.ReactElement {
  return (
    <AchievementBadge
      emoji={getBadgeIcon(badgeId)}
      label={label}
      tone={tone}
      layout="vertical"
      size="lg"
      className={cn('w-full', !achieved && 'opacity-60')}
    />
  );
}
