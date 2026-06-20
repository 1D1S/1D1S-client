'use client';

import { useCountUp } from '@module/hooks/useCountUp';
import React from 'react';

interface CountUpProps {
  value: number;
  // 숫자 뒤에 붙는 단위(예: '일', '%'). 카운트와 함께 한 덩어리로 렌더한다.
  suffix?: string;
  durationMs?: number;
}

// 스타일은 부모(타이포/색/tabular-nums)를 그대로 상속한다. 숫자 텍스트만 낸다.
export function CountUp({
  value,
  suffix,
  durationMs,
}: CountUpProps): React.ReactElement {
  const display = useCountUp(value, durationMs ? { durationMs } : undefined);
  return (
    <>
      {display}
      {suffix}
    </>
  );
}
