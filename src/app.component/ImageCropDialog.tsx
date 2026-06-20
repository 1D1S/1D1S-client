'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Text,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ImageIcon, Maximize2, Minimize2 } from 'lucide-react';
import Image from 'next/image';
import type { ReactElement, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import {
  cropImageFile,
  type ImageCropMode,
  type ImageCropSize,
} from '@/app.lib/cropImage';

interface ImageCropDialogProps {
  open: boolean;
  file: File | null;
  title: string;
  outputSize: ImageCropSize;
  onOpenChange(open: boolean): void;
  onApply(file: File): void;
}

const BACKGROUND_OPTIONS = [
  { value: '#ffffff', label: '흰색' },
  { value: '#f3f4f6', label: '회색' },
  { value: '#111827', label: '검정' },
] as const;

function ModeButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick(): void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-20 items-center gap-3 rounded-xl border p-3',
        'text-left transition-colors',
        active
          ? 'border-main-800 bg-main-50 text-main-900'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          active ? 'bg-main-800 text-white' : 'bg-gray-100 text-gray-600'
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-extrabold">{title}</span>
        <span className="mt-0.5 block text-xs leading-4 text-gray-500">
          {description}
        </span>
      </span>
    </button>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange(value: number): void;
}): ReactElement {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-gray-600">{label}</span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-main-800 w-full"
      />
    </label>
  );
}

export function ImageCropDialog({
  open,
  file,
  title,
  outputSize,
  onOpenChange,
  onApply,
}: ImageCropDialogProps): ReactElement {
  const [previewUrl, setPreviewUrl] = useState('');
  const [mode, setMode] = useState<ImageCropMode>('cover');
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const previewOffsetFactor = mode === 'cover' ? 1 : zoom - 1;
  const imageTransform =
    `translate(${offsetX * 18 * previewOffsetFactor}%, ` +
    `${offsetY * 18 * previewOffsetFactor}%) ` +
    `scale(${zoom})`;
  const aspectRatio = useMemo(
    () => `${outputSize.width} / ${outputSize.height}`,
    [outputSize.height, outputSize.width]
  );

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setMode('cover');
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setBackgroundColor('#ffffff');
    setErrorMessage(null);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleApply = async (): Promise<void> => {
    if (!file || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const croppedFile = await cropImageFile(file, {
        mode,
        outputSize,
        zoom,
        offsetX,
        offsetY,
        backgroundColor,
      });
      onApply(croppedFile);
      onOpenChange(false);
    } catch {
      setErrorMessage('이미지를 편집하지 못했습니다. 다른 사진을 선택해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[92dvh] flex-col gap-0 p-0',
          'sm:max-w-[560px]'
        )}
      >
        <DialogHeader className="border-b border-gray-100 px-5 py-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="space-y-5">
            <div
              className={cn(
                'relative w-full overflow-hidden rounded-xl',
                'border border-gray-200 bg-gray-100'
              )}
              style={{ aspectRatio, backgroundColor }}
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="선택한 이미지 미리보기"
                  fill
                  unoptimized
                  className={cn(
                    mode === 'cover' ? 'object-cover' : 'object-contain'
                  )}
                  style={{
                    transform: imageTransform,
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <ModeButton
                active={mode === 'cover'}
                icon={<Maximize2 className="h-4 w-4" />}
                title="비율에 맞게 잘라내기"
                description="빈 공간 없이 화면을 채워요."
                onClick={() => {
                  setMode('cover');
                  setZoom(1);
                }}
              />
              <ModeButton
                active={mode === 'contain'}
                icon={<Minimize2 className="h-4 w-4" />}
                title="여백 채우기"
                description="사진 전체를 살리고 남는 곳을 채워요."
                onClick={() => {
                  setMode('contain');
                  setZoom(1);
                }}
              />
            </div>

            <div className="space-y-3">
              <RangeControl
                label="확대"
                value={zoom}
                min={1}
                max={3}
                step={0.01}
                onChange={setZoom}
              />
              <RangeControl
                label="가로 위치"
                value={offsetX}
                min={-1}
                max={1}
                step={0.01}
                onChange={setOffsetX}
              />
              <RangeControl
                label="세로 위치"
                value={offsetY}
                min={-1}
                max={1}
                step={0.01}
                onChange={setOffsetY}
              />
            </div>

            {mode === 'contain' ? (
              <div className="space-y-2">
                <Text size="caption1" weight="bold" className="text-gray-600">
                  여백 색상
                </Text>
                <div className="flex gap-2">
                  {BACKGROUND_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-label={`${option.label} 여백`}
                      onClick={() => setBackgroundColor(option.value)}
                      className={cn(
                        'h-9 w-9 rounded-full border-2 transition-colors',
                        backgroundColor === option.value
                          ? 'border-main-800'
                          : 'border-gray-200'
                      )}
                      style={{ backgroundColor: option.value }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {errorMessage !== null ? (
              <Text size="caption1" className="text-red-500">
                {errorMessage}
              </Text>
            ) : null}
          </div>
        </div>

        <DialogFooter
          className={cn(
            'grid grid-cols-2 gap-3 border-t',
            'border-gray-100 p-5'
          )}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={() => void handleApply()}
            disabled={!file || isProcessing}
          >
            {isProcessing ? '적용 중...' : '적용하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
