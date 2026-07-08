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

      {/* 최대 5장(useDiaryCreateForm 의 MAX_DIARY_IMAGES 와 일치). 크롭/비율
          조정 없이 원본을 업로드한다. */}
      <ThumbnailPicker
        max={5}
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
              · 미선택 시 목록·카드에 이미지가 표시되지 않습니다
            </span>
          </Text>
          {/* py-1 로 선택 테두리가 스크롤 컨테이너에 잘리지 않게 여유를 준다. */}
          <div className="flex gap-2 overflow-x-auto px-0.5 py-1">
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
                    'border-2 transition-colors',
                    isSelected
                      ? 'border-main-600'
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
                        'bg-main-600 absolute top-1 left-1 rounded px-1',
                        'text-[9px] leading-tight font-bold text-white'
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
