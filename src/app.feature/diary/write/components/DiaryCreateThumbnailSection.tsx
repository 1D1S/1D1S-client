import { Text, ThumbnailPicker } from '@1d1s/design-system';
import React from 'react';

interface DiaryCreateThumbnailSectionProps {
  previews: string[];
  /** previews 중 대표 썸네일 인덱스(없으면 -1). */
  thumbnailIndex: number;
  onSelectFiles(files: File[]): void;
  onRemove(index: number): void;
  onSelectThumbnail(index: number): void;
}

function DiaryCreateThumbnailSectionComponent({
  previews,
  thumbnailIndex,
  onSelectFiles,
  onRemove,
  onSelectThumbnail,
}: DiaryCreateThumbnailSectionProps): React.ReactElement {
  return (
    <div>
      <Text size="caption1" weight="bold" className="mb-2 block text-gray-600">
        사진 첨부 <span className="font-medium text-gray-400">· 선택</span>
      </Text>

      {/* 최대 5장. 이미지를 누르면 대표 썸네일로 지정/해제(토글)된다.
          대표는 목록·카드에 노출되며, 미선택 시 표시되지 않는다. */}
      <ThumbnailPicker
        max={5}
        previews={previews}
        onSelectFiles={onSelectFiles}
        onRemove={onRemove}
        primaryIndex={thumbnailIndex}
        onSelectPrimary={onSelectThumbnail}
        helperText="이미지를 눌러 대표 썸네일을 지정하세요 · 미선택 시 카드 미표시"
      />
    </div>
  );
}

export const DiaryCreateThumbnailSection = React.memo(
  DiaryCreateThumbnailSectionComponent
);
