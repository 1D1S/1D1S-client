'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@module/lib/utils';
import Image from 'next/image';
import { Text } from '@1d1s/design-system';

interface DiaryContentFieldProps {
  value: string;
  onChange?(value: string): void;
  imageSrc?: string;
  networkImageSrc?: string; // ✅ 추가됨
  onImageSelect?(file: File): void;
  className?: string;
  editable?: boolean;
}

export function DiaryContentField({
  value,
  onChange,
  imageSrc,
  networkImageSrc,
  onImageSelect,
  className = '',
  editable = true, // ✅ 기본값 true
}: DiaryContentFieldProps): React.ReactElement {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files?.[0] && onImageSelect) {
      onImageSelect(event.target.files[0]);
    }
  };

  return (
    <div
      className={cn(
        'bg-main-200 rounded-lg p-4',
        editable &&
          'focus-within:ring-main-900 focus-within:ring-offset-main-200 focus-within:ring-2 focus-within:ring-offset-2',
        'ring-0 transition-all duration-200 ease-in-out',
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
          onChange={(event) => {
            if (onChange) {
              onChange(event.target.value);
            }
          }}
          readOnly={!editable}
        />

        {(editable || imageSrc || (!editable && networkImageSrc)) && (
          <label
            className={cn(
              'h-40 w-40 flex-shrink-0 rounded-md',
              'flex items-center justify-center',
              editable ? 'cursor-pointer transition-colors hover:border-gray-400' : '',
              imageSrc || networkImageSrc ? '' : 'border-3 border-dashed border-gray-300'
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
            ) : !editable && networkImageSrc ? (
              <Image
                src={networkImageSrc}
                alt="네트워크 이미지"
                width={160}
                height={160}
                className="h-40 w-40 rounded-md object-cover"
              />
            ) : (
              editable && (
                <div className="flex items-center text-gray-400">
                  <Plus className="mb-1 h-6 w-6" />
                  <Text size={'body1'} weight={'bold'} className="ml-2 text-gray-400">
                    사진 추가
                  </Text>
                </div>
              )
            )}
            {editable && (
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            )}
          </label>
        )}
      </div>
    </div>
  );
}
