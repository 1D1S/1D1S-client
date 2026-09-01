'use client';

import { useAuthStatus } from '@module/hooks/useAuthStatus';
import {
  identifyPostHog,
  resetPostHog,
} from '@module/providers/PostHogProvider';
import { useEffect } from 'react';

import { useSidebar } from '../hooks/useMemberQueries';

/**
 * PostHog 식별자 연결.
 *
 * 예전엔 PostHogProvider(코어 레이어)가 직접 useSidebar 를 불러 nickname 을
 * 읽었다. 분석 모듈이 member 도메인에 의존하는 방향이라, "누가 로그인했는가"를
 * 아는 쪽(member)이 값을 넣도록 뒤집었다. 코어는 identify/reset 함수만
 * 내보낸다.
 *
 * 렌더링은 하지 않는다. AppProviders 안쪽(= PostHog 부트스트랩 이후 트리)에
 * 마운트되기만 하면 되고, init 전에 호출돼도 큐잉되므로 순서를 신경 쓰지
 * 않아도 된다.
 */
export function PostHogIdentity(): null {
  const status = useAuthStatus();
  const { data: sidebar } = useSidebar();
  const nickname = sidebar?.nickname;

  useEffect(() => {
    if (status === 'authenticated' && nickname) {
      identifyPostHog(nickname);
    } else if (status === 'guest') {
      resetPostHog();
    }
  }, [status, nickname]);

  return null;
}
