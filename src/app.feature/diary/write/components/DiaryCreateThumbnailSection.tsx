import { Text, ThumbnailPicker } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
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

      {/* max 미지정 = 다중 업로드. 크롭/비율 조정 없이 원본을 업로드한다. */}
      <ThumbnailPicker
        previews={previews}
        onSelectFiles={onSelectFiles}
        onRemove={onRemove}
      />

      {/* 대표 썸네일 선택 — 목록/카드에 노출될 한 장을 고른다. */}
      {previews.length > 0 ? (
        <div className="mt-3">
          <Text
            size="caption2"
            weight="bold"
            className="mb-1.5 block text-gray-500"
          >
            대표 썸네일{' '}
            <span className="font-medium text-gray-400">
              · 목록·카드에 표시됩니다
            </span>
          </Text>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {previews.map((url, index) => {
              const isSelected = index === thumbnailIndex;
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => onSelectThumbnail(index)}
                  aria-pressed={isSelected}
                  aria-label={`${index + 1}번째 이미지를 대표로 지정`}
                  className={cn(
                    'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg',
                    'border transition-all',
                    isSelected
                      ? 'border-main-600 ring-main-600 ring-2'
                      : 'border-gray-200 opacity-60 hover:opacity-100'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {isSelected ? (
                    <span
                      className={cn(
                        'bg-main-600 absolute inset-x-0 bottom-0 py-0.5',
                        'text-center text-[10px] font-bold text-white'
                      )}
                    >
                      대표
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const DiaryCreateThumbnailSection = React.memo(
  DiaryCreateThumbnailSectionComponent
);
