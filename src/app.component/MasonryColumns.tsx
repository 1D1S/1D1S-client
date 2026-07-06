'use client';

import { cn } from '@module/utils/cn';
import React from 'react';

// Tailwind 기본 브레이크포인트와 동일 (sm: 640px)
const SM_QUERY = '(min-width: 640px)';

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(SM_QUERY);
  mql.addEventListener('change', onChange);
  return () => {
    mql.removeEventListener('change', onChange);
  };
}

function getSnapshot(): number {
  return window.matchMedia(SM_QUERY).matches ? 3 : 2;
}

// SSR/하이드레이션 첫 렌더에서는 뷰포트를 알 수 없다. 0(미확정)을 돌려
// CSS 그리드 폴백으로 렌더하고, 클라이언트 스냅샷이 잡히면 masonry 로
// 전환한다 (컬럼 수/폭이 같아 열 개수 플래시가 없다).
function getServerSnapshot(): number {
  return 0;
}

interface MasonryColumnsProps {
  /** 컨테이너(가로 flex) 추가 클래스 */
  className?: string;
  /** 컬럼 간/아이템 간 간격. Tailwind gap 클래스.
   *  모바일은 간격을 줄여 카드 폭을 확보한다 (기본 gap-2.5 sm:gap-4) */
  gapClassName?: string;
  children: React.ReactNode;
}

/**
 * CSS 컬럼(masonry)의 세로 패킹을 유지하되, 아이템 순서는 가로 우선
 * (최신이 좌→중→우로 행을 채움)이 되도록 라운드로빈으로 분배한다.
 * CSS `columns`는 세로 우선이라 순서가 열 단위로 흘러 쓰지 않는다.
 */
export default function MasonryColumns({
  className,
  gapClassName = 'gap-2.5 sm:gap-4',
  children,
}: MasonryColumnsProps): React.ReactElement {
  const columnCount = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // 컬럼 수 미확정(SSR/하이드레이션) — 같은 브레이크포인트의 CSS 그리드로
  // 렌더해 첫 페인트부터 열 개수와 카드 폭이 정확하게 보이도록 한다.
  if (columnCount === 0) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 items-start sm:grid-cols-3',
          gapClassName,
          className
        )}
      >
        {children}
      </div>
    );
  }

  const items = React.Children.toArray(children);
  const columns = Array.from({ length: columnCount }, (_, columnIndex) =>
    items.filter((_, itemIndex) => itemIndex % columnCount === columnIndex)
  );

  return (
    <div className={cn('flex items-start', gapClassName, className)}>
      {columns.map((columnItems, columnIndex) => (
        <div
          key={columnIndex}
          className={cn('flex min-w-0 flex-1 flex-col', gapClassName)}
        >
          {columnItems}
        </div>
      ))}
    </div>
  );
}
