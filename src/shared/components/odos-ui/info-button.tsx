'use client';

import React from 'react';
import Image from 'next/image';
import { OdosLabel } from '@/shared/components/odos-ui/label';
import { cn } from '@/shared/lib/utils';

interface InfoButtonProps {
  /** 상단 작은 글씨 */
  mainText: string;
  /** 상단 큰 글씨 */
  subText: string;
  /** 왼쪽 하단에 표시할 이미지 URL 또는 import */
  imageSrc: string;
  /** 이미지 대체 텍스트 */
  imageAlt?: string;
  /** 그라데이션 시작 색상 (CSS color) */
  gradientFrom: string;
  /** 그라데이션 끝 색상 (CSS color) */
  gradientTo: string;
  /** 추가 Tailwind 클래스 */
  className?: string;

  onClick?(): void;
}

export function InfoButton({
  mainText,
  subText,
  imageSrc,
  imageAlt = 'icon',
  gradientFrom,
  gradientTo,
  onClick,
  className,
}: InfoButtonProps): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-odos-2 relative overflow-hidden p-6 text-white',
        'flex flex-col justify-between',
        'h-47.5 w-56',
        'hover:shadow-odos-default',
        'hover:-translate-y-1',
        'transition-all duration-300',
        'cursor-pointer',
        className
      )}
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
      }}
      onClick={onClick}
    >
      <div className="flex w-full flex-col gap-1">
        <OdosLabel size="caption2" weight="medium" className="opacity-80">
          {mainText}
        </OdosLabel>
        <OdosLabel size="heading2" weight="bold" className="mt-1">
          {subText}
        </OdosLabel>
      </div>

      {/* 하단 아이콘 (좌) */}
      <div className="absolute bottom-6 left-6">
        <Image src={imageSrc} alt={imageAlt} width={48} height={78} className="object-contain" />
      </div>
      {/* 하단 화살표 (우) */}
      <OdosLabel size="display2" weight="bold" className="absolute right-6 bottom-6">
        →
      </OdosLabel>
    </div>
  );
}
