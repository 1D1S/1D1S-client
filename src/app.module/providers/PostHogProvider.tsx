'use client';

import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import React, { Suspense, useEffect } from 'react';

import { useSidebar } from '@/app.feature/member/hooks/useMemberQueries';

const DEFAULT_HOST = 'https://us.i.posthog.com';

// 초기화 여부를 자체 플래그로 추적한다(posthog 내부 필드 의존 회피).
let initialized = false;

/**
 * PostHog 클라이언트 1회 초기화. 키가 없으면(로컬/프리뷰) 스킵해 에러를 막는다.
 * 모듈 로드 시점(클라이언트)에 호출되어 이후 pageview/identify 이펙트가
 * 초기화 완료 상태를 볼 수 있게 한다.
 */
function initPostHog(): void {
  if (initialized || typeof window === 'undefined') {
    return;
  }
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    return;
  }
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? DEFAULT_HOST,
    // App Router 는 자동 pageview 가 오동작하므로 수동 캡처한다.
    capture_pageview: false,
    // 개인정보 보호: 세션 리코딩 비활성, 로그인 사용자만 person 프로필 생성.
    disable_session_recording: true,
    person_profiles: 'identified_only',
  });
  initialized = true;
}

if (typeof window !== 'undefined') {
  initPostHog();
}

/**
 * pathname/searchParams 변경마다 `$pageview` 수동 캡처(App Router 공식 권장).
 * useSearchParams 는 Suspense 경계 안에서만 사용해야 한다.
 */
function PostHogPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!initialized || !pathname) {
      return;
    }
    posthog.capture('$pageview', { $current_url: window.location.href });
  }, [pathname, searchParams]);

  return null;
}

/**
 * 로그인 확정 시 nickname 으로 식별, 로그아웃 시 reset.
 * 서버가 memberId 를 클라이언트에 노출하지 않으므로 안정 식별자로 nickname 을
 * 쓴다. 민감정보(이메일·전화번호·생년월일)는 전송하지 않는다.
 */
function PostHogIdentify(): null {
  const status = useAuthStatus();
  const { data: sidebar } = useSidebar();
  const nickname = sidebar?.nickname;

  useEffect(() => {
    if (!initialized) {
      return;
    }
    if (status === 'authenticated' && nickname) {
      posthog.identify(nickname, { nickname });
    } else if (status === 'guest') {
      posthog.reset();
    }
  }, [status, nickname]);

  return null;
}

export function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      <PostHogIdentify />
      {children}
    </>
  );
}
