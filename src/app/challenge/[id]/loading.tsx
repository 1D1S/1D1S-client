import { ChallengeDetailSkeleton } from '@feature/challenge/detail/components/ChallengeDetailSkeleton';
import React from 'react';

export default function ChallengeDetailLoading(): React.ReactElement {
  return (
    <div data-native-hide className="contents">
      <ChallengeDetailSkeleton />
    </div>
  );
}
