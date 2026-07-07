import { Text, ThumbnailPicker } from '@1d1s/design-system';
import React from 'react';

interface DiaryCreateThumbnailSectionProps {
  thumbnailPreviewUrl: string;
  hasThumbnail: boolean;
  onSelectThumbnailFile(file: File): void;
  onClearThumbnail(): void;
}

function DiaryCreateThumbnailSectionComponent({
  thumbnailPreviewUrl,
  hasThumbnail,
  onSelectThumbnailFile,
  onClearThumbnail,
}: DiaryCreateThumbnailSectionProps): React.ReactElement {
  // 크롭/비율 조정 없이 선택한 원본을 그대로 업로드한다.
  const handleSelectFiles = (files: File[]): void => {
    const [file] = files;
    if (file) {
      onSelectThumbnailFile(file);
    }
  };

  return (
    <div>
      <Text size="caption1" weight="bold" className="mb-2 block text-gray-600">
        사진 첨부 <span className="font-medium text-gray-400">· 선택</span>
      </Text>

      <ThumbnailPicker
        max={1}
        previews={hasThumbnail ? [thumbnailPreviewUrl] : []}
        onSelectFiles={handleSelectFiles}
        onRemove={onClearThumbnail}
      />
    </div>
  );
}

export const DiaryCreateThumbnailSection = React.memo(
  DiaryCreateThumbnailSectionComponent
);
