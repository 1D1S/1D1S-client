import type { MyPageStreak } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import React from 'react';

import { buildMyPageBadges } from '../utils/mypageUtils';
import { MyPageBadgeTile } from './MyPageBadgeTile';
import { MyPageSectionHeader } from './MyPageSectionHeader';

interface MyPageBadgesSectionProps {
  streak: MyPageStreak;
}

/**
 * 획득한 배지 5종 그리드. 데스크탑 5-col / 모바일 2-3 col.
 * 미달성 배지는 gray tone + opacity-60.
 */
export function MyPageBadgesSection({
  streak,
}: MyPageBadgesSectionProps): React.ReactElement {
  const badges = buildMyPageBadges(streak);
  const achievedCount = badges.filter((badge) => badge.achieved).length;

  return (
    <section>
      <MyPageSectionHeader
        title="획득한 배지"
        subtitle={`${achievedCount}/${badges.length}개 달성`}
      />
      <div
        className={cn(
          'mt-4 grid grid-cols-2 gap-2.5',
          'sm:grid-cols-3 md:grid-cols-5 md:gap-3',
        )}
      >
        {badges.map((badge) => (
          <MyPageBadgeTile
            key={badge.id}
            emoji={badge.emoji}
            label={badge.label}
            tone={badge.tone}
            achieved={badge.achieved}
          />
        ))}
      </div>
    </section>
  );
}
