import { Button, Text } from '@1d1s/design-system';
import Image from 'next/image';
import React, { useRef, useState } from 'react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null);
  const hasPreviewImage =
    Boolean(thumbnailPreviewUrl) && failedPreviewUrl !== thumbnailPreviewUrl;
  const isLocalPreviewImage = /^(blob:|data:)/i.test(thumbnailPreviewUrl);

  const handlePickClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (file: File | null): void => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    setFailedPreviewUrl(null);
    onSelectThumbnailFile(file);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0] ?? null;
    handleFileSelect(file);
    event.target.value = '';
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    handleFileSelect(file);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePickClick();
    }
  };

  return (
    <section className="lg:h-full">
      <Text size="heading2" weight="bold" className="mb-6 text-gray-900">
        썸네일 이미지
      </Text>
      <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4">
        <div
          role="button"
          tabIndex={0}
          className={`relative flex min-h-[220px] flex-1 cursor-pointer overflow-hidden rounded-xl border bg-gray-100 transition outline-none lg:min-h-[440px] ${
            isDragging
              ? 'border-main-700 ring-main-300 ring-3'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={handlePickClick}
          onKeyDown={handleKeyDown}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {hasPreviewImage ? (
            <Image
              src={thumbnailPreviewUrl}
              alt="썸네일 미리보기"
              width={1200}
              height={672}
              className="h-full w-full object-cover"
              onError={() => setFailedPreviewUrl(thumbnailPreviewUrl)}
              unoptimized={isLocalPreviewImage}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-gray-500">
              <Text size="body2" weight="medium" className="text-gray-700">
                썸네일 영역을 클릭해 이미지를 선택하세요.
              </Text>
              <Text size="caption1" weight="regular" className="text-gray-500">
                또는 이미지를 드래그해서 놓아주세요.
              </Text>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Text size="caption1" weight="regular" className="text-gray-500">
            JPG, PNG, GIF 파일을 업로드할 수 있습니다.
          </Text>
          {hasThumbnail ? (
            <Button
              type="button"
              variant="outlined"
              size="small"
              className="shrink-0"
              onClick={onClearThumbnail}
            >
              선택 해제
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export const DiaryCreateThumbnailSection = React.memo(
  DiaryCreateThumbnailSectionComponent
);
