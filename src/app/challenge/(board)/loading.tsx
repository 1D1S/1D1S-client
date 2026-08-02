import { ChallengeBoardSkeleton } from '@component/skeletons/ChallengeBoardSkeleton';
import React from 'react';

export default function ChallengeListLoading(): React.ReactElement {
  return (
    <div data-native-hide className="contents">
      <ChallengeBoardSkeleton />
    </div>
  );
}
