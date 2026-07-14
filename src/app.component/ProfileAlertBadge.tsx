import { cn } from '@module/utils/cn';
import React from 'react';

/**
 * 프로필 아바타 우상단에 겹치는 작은 경고 배지(느낌표).
 * 전화번호 미입력처럼 사용자 조치가 필요할 때 노출한다.
 *
 * - 부모 요소는 `relative` 여야 하며, 아바타의 `overflow-hidden` 바깥에
 *   형제로 둬야 잘리지 않는다.
 * - `absolute` 라 레이아웃 시프트를 만들지 않는다.
 * - `pointer-events-none` 로 아바타 클릭을 가로막지 않는다.
 */
export function ProfileAlertBadge({
  className,
}: {
  className?: string;
}): React.ReactElement {
  return (
    <span
      role="img"
      aria-label="전화번호 미입력"
      className={cn(
        'pointer-events-none absolute -top-0.5 -right-0.5 z-10',
        'flex h-4 w-4 items-center justify-center rounded-full',
        'bg-amber-500 text-[10px] leading-none font-extrabold text-white',
        'ring-2 ring-white',
        className
      )}
    >
      !
    </span>
  );
}
