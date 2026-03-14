import DiaryListScreen from '@feature/diary/board/screen/diary-list-screen';
import React, { Suspense } from 'react';

export default function DiaryListPage(): React.ReactElement {
  return (
    <Suspense>
      <DiaryListScreen />
    </Suspense>
  );
}
