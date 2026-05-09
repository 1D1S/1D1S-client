import { Text } from '@1d1s/design-system';
import React from 'react';

export default function DiaryDetailLoading(): React.ReactElement {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Text size="body1" weight="regular" className="text-gray-400">
        불러오는 중...
      </Text>
    </div>
  );
}
