import DiaryListScreen from '@feature/diary/board/screen/DiaryListScreen';
import React, { Suspense } from 'react';

export default function DiaryListPage(): React.ReactElement {
  return (
    <Suspense>
      <DiaryListScreen />
    </Suspense>
  );
}
