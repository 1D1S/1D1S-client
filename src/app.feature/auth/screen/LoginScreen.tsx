'use client';

import { Text } from '@1d1s/design-system';
import { authStorage } from '@module/utils/auth';
import { cn } from '@module/utils/cn';
import { RETURN_TO_PARAM, sanitizeReturnTo } from '@module/utils/returnTo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { BrandPanel } from '../components/BrandPanel';
import { getLastOAuthProvider, LoginButton } from '../components/LoginButtons';
import { LoginMobileView } from '../components/LoginMobileView';
import { getOrderedProviders, PROVIDER_META } from '../consts/providerMeta';
import { OAuthProvider } from '../type/auth';
import { getLaunchStreakDay } from '../utils/streakDay';

export function LoginScreen(): React.ReactElement {
  const router = useRouter();
  const [recommended, setRecommended] = React.useState<OAuthProvider | null>(
    null
  );
  const [streakDay, setStreakDay] = React.useState<number>(() =>
    getLaunchStreakDay()
  );

  React.useEffect(() => {
    setRecommended(getLastOAuthProvider());
    setStreakDay(getLaunchStreakDay());
  }, []);

  // 이미 로그인된 상태로 /login?returnTo=... 에 오면 바로 복귀시킨다.
  // (returnTo 가 없으면 기존처럼 로그인 화면을 그대로 보여준다)
  React.useEffect(() => {
    const returnTo = sanitizeReturnTo(
      new URLSearchParams(window.location.search).get(RETURN_TO_PARAM)
    );
    if (returnTo && authStorage.hasTokens()) {
      router.replace(returnTo);
    }
  }, [router]);

  const providers = getOrderedProviders(recommended);

  return (
    <>
      <div className="lg:hidden">
        <LoginMobileView
          providers={providers}
          recommended={recommended}
          streakDay={streakDay}
        />
      </div>

      <div
        className={cn(
          'hidden min-h-screen w-full bg-white',
          'lg:grid lg:grid-cols-[1.05fr_1fr]'
        )}
      >
        <BrandPanel
          heading={'매일 한 걸음,\n오늘도 함께해요'}
          subtitle={'각자의 작은 목표를 꾸준히\n지켜나가는 중이에요.'}
          streakDay={streakDay}
        />

        <section
          className={cn(
            'relative flex items-center justify-center px-6 py-10',
            'lg:px-16'
          )}
        >
          <div
            className={cn(
              'absolute top-7 right-8 hidden text-[13px] text-gray-600',
              'lg:block'
            )}
          >
            한국어 / KR
            <span className="mx-3 text-gray-300">|</span>
            <Link
              href="/help"
              className="font-semibold text-gray-700 hover:text-gray-900"
            >
              도움말
            </Link>
          </div>

          <div className="w-full max-w-[400px]">
            <Text
              size="caption2"
              weight="extrabold"
              className="text-main-800 mb-2 block tracking-[0.2em]"
            >
              WELCOME BACK
            </Text>
            <Text
              size="display2"
              weight="extrabold"
              as="h1"
              className="block tracking-tight text-gray-900"
            >
              다시 만나서 반가워요
            </Text>
            <Text
              size="body2"
              weight="regular"
              as="p"
              className="mt-3 block text-gray-500"
            >
              {`${streakDay}일 스트릭이 기다리고 있어요 🔥`}
              <br />
              가입할 때 사용한 SNS로 로그인해주세요.
            </Text>

            <div className="mt-8 flex flex-col gap-2.5">
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
                    className={cn('h-13 text-[15px]', meta.className)}
                  />
                );
              })}
            </div>

            <Text
              size="caption2"
              weight="regular"
              as="p"
              className="mt-6 block text-center text-gray-500"
            >
              로그인하면{' '}
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
              에 동의한 것으로 간주됩니다.
            </Text>
          </div>
        </section>
      </div>
    </>
  );
}
