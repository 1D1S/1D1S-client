'use client';

import { cn } from '@module/utils/cn';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import React, { useState } from 'react';

interface FilterDisclosureProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

/**
 * 카테고리 외 세부 필터(종류·상태 등)를 접기/펴기 한다. 기본 접힘.
 * 챌린지 보드·내 챌린지 목록의 상단 필터 영역 높이를 줄이기 위한 공용 래퍼.
 *
 * 토글은 히트영역을 넉넉히(px-3.5 py-2, 아이콘~셰브론 전체가 탭 타깃) 잡고,
 * 접힘/펼침은 오른쪽 셰브론 회전 + 펼침 시 강조 톤으로 표시한다(예전 12px
 * "접기/펴기" 텍스트 대비 명확·큰 타깃). 앱 네이티브 필터도 이 디자인에 맞춘다.
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
          'inline-flex items-center gap-2 rounded-full border px-3.5 py-2',
          'text-[13px] font-bold transition-colors',
          open
            ? 'border-main-200 bg-main-50 text-main-800'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        )}
      >
        <SlidersHorizontal
          className={cn('h-4 w-4', open ? 'text-main-700' : 'text-gray-500')}
          aria-hidden
        />
        {label}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            open ? 'rotate-180 text-main-700' : 'text-gray-400'
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="mt-2.5 flex flex-col gap-2.5">{children}</div>
      ) : null}
    </div>
  );
}
