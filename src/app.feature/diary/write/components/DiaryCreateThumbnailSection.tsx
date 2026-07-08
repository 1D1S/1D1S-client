import { Text, ThumbnailPicker } from '@1d1s/design-system';
import React from 'react';

interface DiaryCreateThumbnailSectionProps {
  previews: string[];
  onSelectFiles(files: File[]): void;
  onRemove(index: number): void;
}

function DiaryCreateThumbnailSectionComponent({
  previews,
  onSelectFiles,
  onRemove,
}: DiaryCreateThumbnailSectionProps): React.ReactElement {
  return (
    <div>
      <Text size="caption1" weight="bold" className="mb-2 block text-gray-600">
        사진 첨부 <span className="font-medium text-gray-400">· 선택</span>
      </Text>

      {/* max 미지정 = 다중 업로드. 크롭/비율 조정 없이 원본을 업로드한다. */}
      <ThumbnailPicker
        previews={previews}
        onSelectFiles={onSelectFiles}
        onRemove={onRemove}
      />
    </div>
  );
}

export const DiaryCreateThumbnailSection = React.memo(
  DiaryCreateThumbnailSectionComponent
);
