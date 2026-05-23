'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ImageOff } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface InstallStepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
}

/**
 * 홈 화면 추가 가이드의 한 단계를 보여주는 카드.
 * imageSrc 가 없으면 추후 이미지 추가용 placeholder 박스를 렌더한다.
 */
export function InstallStepCard({
  stepNumber,
  title,
  description,
  imageSrc,
  imageAlt,
}: InstallStepCardProps): React.ReactElement {
  return (
    <article
      className={cn(
        'rounded-3 flex flex-col gap-4 border border-gray-200 bg-white',
        'p-4 lg:p-5'
      )}
    >
      <header className="flex items-center gap-3">
        <span
          className={cn(
            'bg-main-200 text-main-800 flex h-8 w-8 shrink-0',
            'items-center justify-center rounded-full text-sm font-bold'
          )}
        >
          {stepNumber}
        </span>
        <Text as="h3" size="body1" weight="bold" className="text-gray-900">
          {title}
        </Text>
      </header>

      <div
        className={cn(
          'relative w-full overflow-hidden rounded-2xl border',
          'border-dashed border-gray-300 bg-gray-50',
          'aspect-[9/16]'
        )}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            fill
            sizes="(min-width: 1024px) 360px, 100vw"
            className="object-contain"
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center',
              'gap-2 text-gray-400'
            )}
          >
            <ImageOff className="h-8 w-8" />
            <Text size="caption2" weight="regular" className="text-gray-400">
              이미지 자리
            </Text>
          </div>
        )}
      </div>

      <Text
        size="body2"
        weight="regular"
        className="leading-6 whitespace-pre-line text-gray-700"
      >
        {description}
      </Text>
    </article>
  );
}
