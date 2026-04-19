import DiaryCreateScreen from '@feature/diary/write/screen/DiaryCreateScreen';
import { Suspense } from 'react';

export default function DiaryCreatePage(): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <DiaryCreateScreen />
    </Suspense>
  );
}
