import ChallengeBoardScreen from '@feature/challenge/board/screen/ChallengeBoardScreen';
import React, { Suspense } from 'react';

export default function ChallengeListPage(): React.ReactElement {
  return (
    <Suspense>
      <ChallengeBoardScreen />
    </Suspense>
  );
}
