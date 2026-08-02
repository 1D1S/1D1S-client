import { DiaryDetailSkeleton } from '@component/skeletons/DiaryDetailSkeleton';
import React from 'react';

export default function DiaryDetailLoading(): React.ReactElement {
  return (
    <div data-native-hide className="contents">
      <DiaryDetailSkeleton />
    </div>
  );
}
