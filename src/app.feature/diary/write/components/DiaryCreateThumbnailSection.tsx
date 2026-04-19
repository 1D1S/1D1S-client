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
    <section className="lg:h-full">
      <Text size="heading2" weight="bold" className="mb-6 text-gray-900">
        썸네일 이미지
      </Text>
      <ImagePicker
        previewUrl={thumbnailPreviewUrl}
        onSelectFile={onSelectThumbnailFile}
        onClear={onClearThumbnail}
        className="mt-2"
      />
    </section>
  );
}

export const DiaryCreateThumbnailSection = React.memo(
  DiaryCreateThumbnailSectionComponent
);
