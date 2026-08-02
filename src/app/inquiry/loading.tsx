import { SubPageRouteSkeleton } from '@component/skeletons/SubPageRouteSkeleton';

export default function Loading(): React.ReactElement {
  return (
    <div data-native-hide className="contents">
      <SubPageRouteSkeleton />
    </div>
  );
}
