import { ChallengeBoardSkeleton } from '@feature/challenge/board/components/ChallengeBoardSkeleton';

export default function Loading(): React.ReactElement {
  return (
    <div data-native-hide className="contents">
      <ChallengeBoardSkeleton />
    </div>
  );
}
