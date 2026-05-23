import { cn } from '@module/utils/cn';
import React from 'react';

interface MobileBottomActionBarProps {
  children: React.ReactNode;
  className?: string;
  hideOnDesktop?: boolean;
}

// 모바일 하단 고정 액션바. safe-area-inset-bottom 처리, border-top, 배경,
// z-index 를 한 곳에서 관리해 페이지별로 padding 이 0~20px 로 흩어져 노치/
// 제스처바 기기에서 버튼이 딱 붙어 보이던 문제를 없앤다.
//
// 사용처는 transform 을 가진 래퍼(`data-fade-in` 등) 밖에 둬야 한다 — 부모의
// transform 이 containing block 을 만들어 position: fixed 가 뷰포트 대신
// 래퍼 기준이 되는 문제를 피한다.
export function MobileBottomActionBar({
  children,
  className,
  hideOnDesktop = true,
}: MobileBottomActionBarProps): React.ReactElement {
  return (
    <div
      className={cn(
        'fixed right-0 bottom-0 left-0 z-20',
        'border-t border-gray-100 bg-white/95 backdrop-blur',
        'px-5 pt-3',
        'pb-[calc(1.25rem+env(safe-area-inset-bottom))]',
        hideOnDesktop && 'lg:hidden',
        className
      )}
    >
      {children}
    </div>
  );
}
