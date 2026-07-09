import { Text, ThumbnailPicker } from '@1d1s/design-system';
import React from 'react';

interface DiaryCreateThumbnailSectionProps {
  previews: string[];
  /** previews 중 대표 썸네일 인덱스(없으면 -1). */
  thumbnailIndex: number;
  /** 인증샷 필수 챌린지면 라벨/안내를 필수로 표시하고 빈 상태를 경고한다. */
  required?: boolean;
  onSelectFiles(files: File[]): void;
  onRemove(index: number): void;
  onSelectThumbnail(index: number): void;
}

function DiaryCreateThumbnailSectionComponent({
  previews,
  thumbnailIndex,
  required = false,
  onSelectFiles,
  onRemove,
  onSelectThumbnail,
}: DiaryCreateThumbnailSectionProps): React.ReactElement {
  const showRequiredWarning = required && previews.length === 0;

  return (
    <div>
      <Text size="caption1" weight="bold" className="mb-2 block text-gray-600">
        사진 첨부{' '}
        {required ? (
          <span className="text-red-500">· 인증샷 필수</span>
        ) : (
          <span className="font-medium text-gray-400">· 선택</span>
        )}
      </Text>

      {showRequiredWarning ? (
        <Text
          size="caption2"
          weight="regular"
          className="mb-2 block text-red-500"
        >
          이 챌린지는 인증샷(사진)을 1장 이상 첨부해야 저장할 수 있어요.
        </Text>
      ) : null}

      {/* 최대 5장. 이미지를 누르면 대표 썸네일로 지정/해제(토글)된다.
          대표는 목록·카드에 노출되며, 미선택 시 표시되지 않는다. */}
      {/* size=200: DS ThumbnailPicker 는 고정 정사각형만 지원한다(fluid 없음).
          최대 크기를 200px 로 키워 폼 폭을 최대한 채우게 한다. */}
      <ThumbnailPicker
        max={5}
        size={200}
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
