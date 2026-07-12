'use client';

import { Text } from '@1d1s/design-system';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { useHasMounted } from '@module/hooks/useHasMounted';
import React from 'react';

export default function HomeWarmGreeting(): React.ReactElement {
  const hasMounted = useHasMounted();
  const { data: sidebar } = useSidebar();
  // 홈 페이지는 `Prefetch` 에서 sidebar 를 prefetch 하지 않으므로 서버는 항상
  // nickname 이 없는 상태로 렌더한다. 반면 클라이언트는 브라우저 query cache
  // 에 사이드바 데이터가 남아 있으면 첫 렌더에 nickname 을 보여 hydration
  // mismatch 가 발생한다. mount 전까지 서버와 같은 값으로 그려 미스매치를
  // 막고, mount 이후 nickname 이 들어오면 자연스럽게 업데이트된다.
  const nickname = hasMounted ? (sidebar?.nickname?.trim() ?? '') : '';
  const greetingTitle = nickname ? `안녕하세요, ${nickname}님` : '안녕하세요';

  // 스트릭 표기는 아래 배너/스트릭 슬롯과 중복되므로 인사말에서는 제외한다.
  return (
    <div className="w-full">
      <Text
        as="h1"
        size="heading2"
        weight="extrabold"
        className="block text-gray-900"
      >
        {greetingTitle}
      </Text>
      <Text
        size="caption2"
        weight="medium"
        className="mt-1 block text-gray-600"
      >
        오늘도 작은 한 걸음을 응원해요.
      </Text>
    </div>
  );
}
