import { cn } from '@module/utils/cn';
import React from 'react';

/**
 * MyPage 상단 풀블리드 그라데이션 배너 (장식용)
 * - 높이 180px, 우상단/좌하단에 부드러운 원형 라이트 데코.
 * - Profile card 가 음수 마진으로 위에 겹쳐 올라옵니다.
 */
export function MyPageHeroBanner(): React.ReactElement {
  return (
    <div
      aria-hidden
      className={cn(
        'relative h-[180px] w-full overflow-hidden',
        'bg-[linear-gradient(135deg,#ff8a65_0%,#ff5722_100%)]'
      )}
    >
      <div
        className={cn(
          'absolute -top-10 -right-10 h-[220px] w-[220px]',
          'rounded-full bg-white/10'
        )}
      />
      <div
        className={cn(
          'absolute -bottom-16 left-30 h-[160px] w-[160px]',
          'rounded-full bg-white/[0.08]'
        )}
      />
    </div>
  );
}
