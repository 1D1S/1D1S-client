import { ImagePicker, Text } from '@1d1s/design-system';
import React from 'react';

interface DiaryCreateThumbnailSectionProps {
  thumbnailPreviewUrl: string;
  hasThumbnail: boolean;
  onSelectThumbnailFile(file: File): void;
  onClearThumbnail(): void;
}

function DiaryCreateThumbnailSectionComponent({
  thumbnailPreviewUrl,
  onSelectThumbnailFile,
  onClearThumbnail,
}: DiaryCreateThumbnailSectionProps): React.ReactElement {
  return (
    <section>
      <Text size="caption1" weight="bold" className="mb-2 block text-gray-600">
        사진 첨부 <span className="font-medium text-gray-400">· 선택</span>
      </Text>
      <ImagePicker
        previewUrl={thumbnailPreviewUrl}
        onSelectFile={onSelectThumbnailFile}
        onClear={onClearThumbnail}
      />
    </section>
  );
}

export const DiaryCreateThumbnailSection = React.memo(
  DiaryCreateThumbnailSectionComponent
);
