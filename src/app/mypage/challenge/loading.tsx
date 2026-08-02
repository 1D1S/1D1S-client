import { ChallengeBoardSkeleton } from '@component/skeletons/ChallengeBoardSkeleton';

export default function Loading(): React.ReactElement {
  return (
    <div data-native-hide className="contents">
      <ChallengeBoardSkeleton />
    </div>
  );
}
