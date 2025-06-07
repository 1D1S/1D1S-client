// components/DiaryContentField.tsx
import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import Image from 'next/image';
import { OdosLabel } from '@/shared/components/odos-ui/label';

interface DiaryContentFieldProps {
  value: string;
  onChange(value: string): void;
  imageSrc?: string;
  onImageSelect(file: File): void;
  className?: string;
}

export function DiaryContentField({
  value,
  onChange,
  imageSrc,
  onImageSelect,
  className = '',
}: DiaryContentFieldProps): React.ReactElement {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files?.[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  return (
    <div
      className={cn(
        'bg-main-200 rounded-lg p-4', // 배경 + padding
        'ring-0', // 기본 링 없음
        'focus-within:ring-2', // child focus 시 링 두께 2
        'focus-within:ring-main-900', // 링 색
        'focus-within:ring-offset-2', // 오프셋 두께
        'focus-within:ring-offset-main-200', // 오프셋 색
        'transition-all duration-200 ease-in-out', // 페이드 인·아웃
        className
      )}
    >
      <div className="flex space-x-4">
        <textarea
          className={cn(
            'flex-1 resize-none rounded-md bg-transparent p-2',
            'focus:ring-0 focus:outline-none',
            'text-md font-normal'
          )}
          rows={10}
          placeholder="일지 내용(선택)"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />

        {/* 이미지 선택 / 미리보기 박스 */}
        <label
          className={cn(
            'h-40 w-40 flex-shrink-0 rounded-md',
            'flex cursor-pointer items-center justify-center',
            'transition-colors hover:border-gray-400',
            imageSrc ? '' : 'border-3 border-dashed border-gray-300'
          )}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt="선택된 이미지"
              width={160}
              height={160}
              className="h-40 w-40 rounded-md object-cover"
            />
          ) : (
            <div className="flex items-center text-gray-400">
              <Plus className="mb-1 h-6 w-6" />
              <OdosLabel size={'body1'} weight={'bold'} className="ml-2 text-gray-400">
                사진 추가
              </OdosLabel>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
    </div>
  );
}
