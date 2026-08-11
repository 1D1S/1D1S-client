import type { ReactElement } from 'react';

import VoteFloatingWidget from '../components/VoteFloatingWidget';

interface VoteFloatingScreenProps {
  enabled: boolean;
  hasBottomNav: boolean;
  hasRightRail: boolean;
}

export default function VoteFloatingScreen({
  enabled,
  hasBottomNav,
  hasRightRail,
}: VoteFloatingScreenProps): ReactElement {
  return (
    <VoteFloatingWidget
      enabled={enabled}
      hasBottomNav={hasBottomNav}
      hasRightRail={hasRightRail}
    />
  );
}
