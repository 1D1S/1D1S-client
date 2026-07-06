import { ImagePicker, Text } from '@1d1s/design-system';
import { ImageCropDialog } from '@component/ImageCropDialog';
import React from 'react';

// 일지 카드 썸네일과 동일한 16:9 비율
const DIARY_THUMBNAIL_SIZE = {
  width: 1600,
  height: 900,
} as const;

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
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = React.useState(false);

  const handleSelectFile = (file: File): void => {
    setPendingFile(file);
    setIsCropDialogOpen(true);
  };

  const handleCropDialogOpenChange = (open: boolean): void => {
    setIsCropDialogOpen(open);

    if (!open) {
      setPendingFile(null);
    }
  };

  const handleCropApply = (file: File): void => {
    setPendingFile(null);
    onSelectThumbnailFile(file);
  };

  return (
    <div>
      <Text size="caption1" weight="bold" className="mb-2 block text-gray-600">
        사진 첨부 <span className="font-medium text-gray-400">· 선택</span>
      </Text>
      <ImagePicker
        previewUrl={thumbnailPreviewUrl}
        onSelectFile={handleSelectFile}
        onClear={onClearThumbnail}
        clearLabel={hasThumbnail ? '사진 제거' : undefined}
        dropZoneClassName="aspect-video"
      />
      <ImageCropDialog
        open={isCropDialogOpen}
        file={pendingFile}
        title="일지 사진 맞추기"
        outputSize={DIARY_THUMBNAIL_SIZE}
        onOpenChange={handleCropDialogOpenChange}
        onApply={handleCropApply}
      />
    </div>
  );
}

export const DiaryCreateThumbnailSection = React.memo(
  DiaryCreateThumbnailSectionComponent
);
