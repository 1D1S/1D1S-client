'use client';

import { Text } from '@1d1s/design-system';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { useHasMounted } from '@module/hooks/useHasMounted';
import { cn } from '@module/utils/cn';
import React from 'react';

interface HomeWarmGreetingProps {
  /** 인증/사이드바 확정 전 — 이름 자리를 스켈레톤으로 예약한다. */
  isLoading?: boolean;
}

export default function HomeWarmGreeting({
  isLoading = false,
}: HomeWarmGreetingProps): React.ReactElement {
  const hasMounted = useHasMounted();
  const status = useAuthStatus();
  const { data: sidebar, isLoading: isSidebarLoading } = useSidebar();

  // 이름(닉네임)이 확정되기 전 빈 이름으로 렌더하지 않는다. 가입 직후 앱이 탭을
  // 리로드하면 member/sidebar 를 fresh 로 받기 전이라, 부모의 isLoading(streak
  // 기준)이 이미 false 여도 닉네임이 비어 "안녕하세요"만 떴다가 이름이 팝인하거나
  // 빈 줄(안 보임)이 노출됐다. 닉네임의 실제 소스(sidebar)+인증 상태로 직접
  // 판정: 마운트 전·인증 확정 전(unknown)·인증됐는데 sidebar 로딩 중이면
  // 스켈레톤. 게스트로 확정되면 이름 없는 일반 인사로 정착한다.
  const isNameResolving =
    !hasMounted ||
    status === 'unknown' ||
    (status === 'authenticated' && isSidebarLoading);

  // 로그인 셸 로딩 중에는 이름이 확정되기 전 "안녕하세요"만 떴다가 이름이
  // 붙는 팝인이 보였다 — 로딩 동안 이름 줄을 스켈레톤으로 예약한다.
  if (isLoading || isNameResolving) {
    return (
      <div className="w-full">
        <span
          aria-hidden
          className={cn(
            'skeleton-pulse block h-7 w-44 rounded bg-gray-100'
          )}
        />
        <span
          aria-hidden
          className="skeleton-pulse mt-1.5 block h-4 w-56 rounded bg-gray-100"
        />
      </div>
    );
  }
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
