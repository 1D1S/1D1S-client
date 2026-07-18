'use client';

import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { usePathname, useSearchParams } from 'next/navigation';
import type { PostHog } from 'posthog-js';
import React, { Suspense, useEffect } from 'react';

import { useSidebar } from '@/app.feature/member/hooks/useMemberQueries';

const DEFAULT_HOST = 'https://us.i.posthog.com';

// 로드 상태: pending(동적 import 전) → ready(init 완료) | disabled(키 없음).
type LoadState = 'pending' | 'ready' | 'disabled';

let posthog: PostHog | null = null;
let loadState: LoadState = 'pending';
let bootstrapStarted = false;

// init 완료 전에 발생한 capture/identify 를 순서대로 큐잉했다가 flush 한다.
// 첫 페이지뷰가 lazy import 완료 이전에 발생해도 유실되지 않는다.
const pendingCalls: Array<(ph: PostHog) => void> = [];

/** posthog 준비 시 즉시 실행, 아직이면 큐잉(키 없음이면 조용히 무시). */
function withPostHog(fn: (ph: PostHog) => void): void {
  if (loadState === 'ready' && posthog) {
    fn(posthog);
    return;
  }
  if (loadState === 'pending') {
    pendingCalls.push(fn);
  }
}

/**
 * posthog-js 를 동적 import 해 초기 번들에서 제외한다. 마운트 직후 1회 실행.
 * 키가 없으면(로컬/프리뷰) import 자체를 건너뛰어 에러를 막는다.
 */
async function bootstrapPostHog(): Promise<void> {
  if (bootstrapStarted || typeof window === 'undefined') {
    return;
  }
  bootstrapStarted = true;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    loadState = 'disabled';
    pendingCalls.length = 0;
    return;
  }

  const { default: ph } = await import('posthog-js');
  ph.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? DEFAULT_HOST,
    // App Router 는 자동 pageview 가 오동작하므로 수동 캡처한다.
    capture_pageview: false,
    // 개인정보 보호: 세션 리코딩 비활성, 로그인 사용자만 person 프로필 생성.
    disable_session_recording: true,
    person_profiles: 'identified_only',
  });

  posthog = ph;
  loadState = 'ready';
  // init 전 큐잉된 호출을 발생 순서대로 flush.
  for (const call of pendingCalls) {
    call(ph);
  }
  pendingCalls.length = 0;
}

/**
 * pathname/searchParams 변경마다 `$pageview` 수동 캡처(App Router 공식 권장).
 * useSearchParams 는 Suspense 경계 안에서만 사용해야 한다.
 */
function PostHogPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) {
      return;
    }
    withPostHog((ph) =>
      ph.capture('$pageview', { $current_url: window.location.href })
    );
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
    if (status === 'authenticated' && nickname) {
      withPostHog((ph) => ph.identify(nickname, { nickname }));
    } else if (status === 'guest') {
      withPostHog((ph) => ph.reset());
    }
  }, [status, nickname]);

  return null;
}

export function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  // 마운트 직후 posthog-js 를 lazy load + init. 초기 번들엔 포함되지 않는다.
  useEffect(() => {
    void bootstrapPostHog();
  }, []);

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
