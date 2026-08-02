import { DiaryBoardSkeleton } from '@component/skeletons/DiaryBoardSkeleton';

export default function Loading(): React.ReactElement {
  return (
    <div data-native-hide className="contents">
      <DiaryBoardSkeleton />
    </div>
  );
}
