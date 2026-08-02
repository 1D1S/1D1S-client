'use client';

import { cn } from '@module/utils/cn';
import { SlidersHorizontal } from 'lucide-react';
import React, { useState } from 'react';

interface FilterDisclosureProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

/**
 * 카테고리 외 세부 필터(종류·상태 등)를 접기/펴기 한다. 기본 접힘.
 * 챌린지 보드·내 챌린지 목록의 상단 필터 영역 높이를 줄이기 위한 공용 래퍼.
 */
export function FilterDisclosure({
  children,
  className,
  label = '상세 필터',
}: FilterDisclosureProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1.5 text-[12px] font-bold text-gray-500',
          'transition-colors hover:text-gray-700'
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {label}
        <span className="text-gray-400">{open ? '접기' : '펴기'}</span>
      </button>
      {open ? <div className="mt-2 flex flex-col gap-2.5">{children}</div> : null}
    </div>
  );
}
