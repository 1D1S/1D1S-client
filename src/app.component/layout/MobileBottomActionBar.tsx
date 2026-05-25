import { cn } from '@module/utils/cn';
import React from 'react';

interface MobileBottomActionBarProps {
  children: React.ReactNode;
  className?: string;
  hideOnDesktop?: boolean;
  // Flutter / native WebView 처럼 네이티브가 자체 바텀바를 그리는 환경에서
  // true 로 넘기면 액션바 자체를 렌더링하지 않는다. 추후 root provider 에서
  // user-agent 또는 bridge 신호로 일괄 토글할 수 있게 prop 만 노출해 둔다.
  hidden?: boolean;
}

// 모바일 하단 고정 액션바. safe-area-inset-bottom, border, 배경, z-index,
// 데스크톱 숨김 처리를 한 곳에서 관리한다.
//
// - 페이지 본문은 `pb-mobile-action-bar`(또는 입력창 액션바인 경우
//   `pb-mobile-action-bar-tall`) 유틸리티로 spacer 를 잡는다.
// - 사용처는 transform 을 가진 래퍼(`data-fade-in` 등) 밖에 둬야 한다 —
//   부모의 transform 이 containing block 을 만들어 position: fixed 가
//   뷰포트 대신 래퍼 기준이 되는 문제를 피한다.
export function MobileBottomActionBar({
  children,
  className,
  hideOnDesktop = true,
  hidden = false,
}: MobileBottomActionBarProps): React.ReactElement | null {
  if (hidden) {
    return null;
  }
  return (
    <div
      className={cn(
        'fixed right-0 bottom-0 left-0 z-20',
        'border-t border-gray-100 bg-white/95 backdrop-blur',
        'px-5 pt-3',
        'pb-[calc(1.75rem+env(safe-area-inset-bottom))]',
        hideOnDesktop && 'lg:hidden',
        className
      )}
    >
      {children}
    </div>
  );
}
