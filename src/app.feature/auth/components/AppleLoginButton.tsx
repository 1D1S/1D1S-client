'use client';

import { Button } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React, { useEffect } from 'react';

import { useAppleLogin } from '../hooks/useAuthMutations';
import { getAppleAuthConfig } from '../utils/appleAuth';

// Apple 로고 마크(공식 형태). 버튼 텍스트와 같은 흰색을 따르도록 currentColor.
function AppleLogo(): React.ReactElement {
  return (
    <svg
      width="16"
      height="19"
      viewBox="0 0 842 1000"
      fill="currentColor"
      aria-hidden
    >
      <path d="M824.7 779.9c-15.1 34.9-33 67-53.7 96.5-28.2 40.2-51.3 68-69.1 83.4-27.6 24.9-57.2 37.6-88.9 38.3-22.7 0-50.1-6.5-82-19.6-32-13.1-61.4-19.6-88.3-19.6-28.2 0-58.4 6.5-90.7 19.6-32.3 13.1-58.4 19.9-78.4 20.6-30.4 1.3-60.7-11.8-90.7-39.3-19.3-16.8-43.4-45.6-72.3-86.4-31-43.6-56.5-94.1-76.5-151.6-21.4-62.1-32.1-122.3-32.1-180.6 0-66.8 14.4-124.4 43.3-172.7 22.7-38.8 52.9-69.4 90.7-91.8 37.8-22.4 78.6-33.8 122.6-34.5 24.1 0 55.7 7.5 95 22.2 39.2 14.8 64.4 22.3 75.4 22.3 8.2 0 36.2-8.8 83.6-26.3 44.8-16.2 82.6-22.9 113.6-20.3 84 6.8 147.1 39.9 189.1 99.6-75.1 45.5-112.3 109.2-111.6 190.9.7 63.6 23.7 116.5 68.9 158.5 20.5 19.5 43.4 34.5 68.9 45.1-5.5 16-11.3 31.3-17.5 46zM630.8 20.3c0 49.8-18.2 96.3-54.5 139.3-43.8 51.2-96.8 80.8-154.3 76.1-1.1-6-1.7-12.3-1.7-18.9 0-47.8 20.8-99 57.7-140.8 18.4-21.2 41.8-38.8 70.2-52.8 28.3-13.8 55.1-21.4 80.3-22.8 1.1 6.9 1.6 13.8 1.6 20.6z" />
    </svg>
  );
}

interface AppleLoginButtonProps {
  className?: string;
  size?: 'md' | 'lg';
}

/**
 * Sign in with Apple (웹) 버튼. 다른 소셜 버튼과 동일한 DS Button/레이아웃을
 * 쓰되 애플 가이드(검정 배경, 흰 로고+텍스트)를 따른다.
 *
 * env(NEXT_PUBLIC_APPLE_CLIENT_ID / _REDIRECT_URI) 미설정 시 렌더하지 않아
 * 로그인 화면의 나머지 흐름은 그대로 동작한다(값만 채우면 버튼이 나타난다).
 */
export function AppleLoginButton({
  className,
  size = 'lg',
}: AppleLoginButtonProps): React.ReactElement | null {
  const configured = getAppleAuthConfig() !== null;
  const { mutate, isPending } = useAppleLogin();

  useEffect(() => {
    if (!configured && process.env.NODE_ENV !== 'production') {
      console.warn(
        '[Apple] NEXT_PUBLIC_APPLE_CLIENT_ID / _REDIRECT_URI 미설정 — ' +
          'Apple 로그인 버튼을 숨깁니다.'
      );
    }
  }, [configured]);

  if (!configured) {
    return null;
  }

  return (
    <Button
      size={size}
      fullWidth
      disabled={isPending}
      onClick={() => mutate()}
      className={cn(
        'relative border-0 bg-black font-extrabold text-white',
        'hover:bg-black/90 hover:brightness-100',
        className
      )}
    >
      <span className="absolute left-5 inline-flex">
        <AppleLogo />
      </span>
      Apple로 계속하기
    </Button>
  );
}
