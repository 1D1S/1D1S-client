import ChallengeBoardScreen from '@feature/challenge/board/screen/challenge-board-screen';
import React, { Suspense } from 'react';

export default function ChallengeListPage(): React.ReactElement {
  return (
    <Suspense>
      <ChallengeBoardScreen />
    </Suspense>
  );
}
