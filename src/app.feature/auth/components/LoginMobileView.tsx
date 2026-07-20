'use client';

import { Icon, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { PROVIDER_META } from '../consts/providerMeta';
import type { OAuthProvider } from '../type/auth';
import { AppleLoginButton } from './AppleLoginButton';
import { LoginButton } from './LoginButtons';

interface LoginMobileViewProps {
  providers: OAuthProvider[];
  recommended: OAuthProvider | null;
  streakDay: number;
}

export function LoginMobileView({
  providers,
  recommended,
  streakDay,
}: LoginMobileViewProps): React.ReactElement {
  const router = useRouter();

  const handleBack = (): void => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.replace('/');
  };

  return (
    <div
      className={cn(
        'relative flex min-h-screen w-full flex-col overflow-hidden bg-white'
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-[90px] -right-[60px] h-[220px]',
          'w-[220px] rounded-full opacity-65',
          'bg-[radial-gradient(circle,var(--main-300)_0%,transparent_70%)]'
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-[60px] -left-[50px] h-[160px]',
          'w-[160px] rounded-full opacity-45',
          'bg-[radial-gradient(circle,var(--mint-300)_0%,transparent_75%)]'
        )}
      />

      <div className="relative flex items-center justify-between px-6 pt-6 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로 가기"
            className={cn(
              '-ml-2 flex h-9 w-9 items-center justify-center rounded-full',
              'text-gray-700 transition hover:bg-gray-100'
            )}
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className={cn(
                'bg-main-800 flex h-[26px] w-[26px] items-center',
                'justify-center rounded-[8px]',
                'shadow-[0_6px_18px_rgba(255,87,34,0.35)]'
              )}
            >
              <Icon name="Logo" size={14} className="text-white" />
            </div>
            <Text size="body2" weight="extrabold" className="text-gray-900">
              1Day 1Streak
            </Text>
          </Link>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          한국어 / KR
        </span>
      </div>

      <div className="relative flex flex-1 flex-col px-6 pt-7">
        <div className="mb-8 text-center">
          <div
            className={cn(
              'relative mx-auto mb-5 flex h-[110px] w-[110px] items-center',
              'border-main-200 justify-center rounded-full border',
              'bg-[linear-gradient(135deg,#fff8f5_0%,#ffe9e0_100%)]'
            )}
          >
            <span aria-hidden className="text-[56px] leading-none">
              🔥
            </span>
            <span
              className={cn(
                'bg-main-800 absolute right-1 -bottom-1.5 rounded-full',
                'px-2.5 py-1 text-[11px] font-extrabold text-white',
                'shadow-[0_4px_12px_rgba(255,87,34,0.4)]'
              )}
            >
              {`${streakDay}일째`}
            </span>
          </div>
          <Text
            size="heading2"
            weight="extrabold"
            as="h1"
            className="block leading-tight tracking-tight text-gray-900"
          >
            매일 한 걸음,
            <br />
            오늘도 함께해요
          </Text>
          <Text
            size="caption1"
            weight="regular"
            as="p"
            className="mt-2 block text-gray-500"
          >
            SNS로 3초만에 시작할 수 있어요
          </Text>
        </div>

        <div className="flex flex-col gap-2.5">
          {providers.map((provider, index) => {
            const meta = PROVIDER_META[provider];
            return (
              <LoginButton
                key={provider}
                provider={provider}
                img={meta.img}
                text={meta.text}
                size="lg"
                recentBadge={index === 0 && recommended === provider}
                className={cn('h-14 text-[15px]', meta.className)}
              />
            );
          })}
          {/* env 설정 시에만 렌더(미설정이면 null) */}
          <AppleLoginButton size="lg" className="h-14 text-[15px]" />
        </div>

        <Text
          size="caption2"
          weight="regular"
          as="p"
          className="mt-auto block pt-6 pb-8 text-center leading-7 text-gray-500"
        >
          가입 시{' '}
          <Link
            href="/terms"
            className="text-gray-700 underline hover:text-gray-900"
          >
            이용약관
          </Link>
          과{' '}
          <Link
            href="/privacy"
            className="text-gray-700 underline hover:text-gray-900"
          >
            개인정보처리방침
          </Link>
          에<br />
          동의한 것으로 간주됩니다.
        </Text>
      </div>
    </div>
  );
}
