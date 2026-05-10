'use client';

import { Icon, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Link from 'next/link';
import React from 'react';

import { BrandPanel } from '../components/BrandPanel';
import { getLastOAuthProvider, LoginButton } from '../components/LoginButtons';
import { OAuthProvider } from '../type/auth';

const PROVIDER_ORDER: OAuthProvider[] = ['kakao', 'naver', 'google'];

const PROVIDER_META: Record<
  OAuthProvider,
  { img: string; text: string; className: string }
> = {
  kakao: {
    img: '/images/kakao-logo.png',
    text: '카카오로 시작하기',
    className: cn(
      'border-0 bg-[#FEE500] font-extrabold text-[#191600]',
      'shadow-[0_6px_18px_rgba(254,229,0,0.35)]',
      'hover:bg-[#FEE500]/90 hover:brightness-100'
    ),
  },
  naver: {
    img: '/images/naver-logo.png',
    text: '네이버로 시작하기',
    className: cn(
      'border-0 bg-[#03C75A] font-extrabold text-white',
      'shadow-[0_6px_18px_rgba(3,199,90,0.25)]',
      'hover:bg-[#03C75A]/90 hover:brightness-100'
    ),
  },
  google: {
    img: '/images/google-logo.svg',
    text: 'Google로 계속하기',
    className: cn(
      'border border-gray-200 bg-white font-extrabold text-gray-800',
      'shadow-sm hover:bg-gray-50 hover:brightness-100'
    ),
  },
};

function getOrderedProviders(
  recommended: OAuthProvider | null
): OAuthProvider[] {
  if (!recommended) {return PROVIDER_ORDER;}
  return [
    recommended,
    ...PROVIDER_ORDER.filter((provider) => provider !== recommended),
  ];
}

export function LoginScreen(): React.ReactElement {
  const [recommended, setRecommended] = React.useState<OAuthProvider | null>(
    null
  );

  React.useEffect(() => {
    setRecommended(getLastOAuthProvider());
  }, []);

  const providers = getOrderedProviders(recommended);

  return (
    <div
      className={cn(
        'grid min-h-screen w-full grid-cols-1 bg-white',
        'lg:grid-cols-[1.05fr_1fr]'
      )}
    >
      <BrandPanel
        heading={'매일 한 걸음,\n오늘도 함께해요'}
        subtitle={'챌린저 12,847명이 지금\n각자의 작은 목표를 지키는 중이에요.'}
      />

      <section
        className={cn(
          'relative flex items-center justify-center px-6 py-10',
          'lg:px-16'
        )}
      >
        <Link
          href="/"
          className="text-main-800 absolute top-6 left-6 flex items-center gap-2 lg:hidden"
        >
          <div className="bg-main-200 flex h-8 w-8 items-center justify-center rounded-[8px]">
            <Icon name="Logo" size={18} className="text-main-800" />
          </div>
          <Text size="heading2" weight="extrabold" className="text-main-800">
            1D1S
          </Text>
        </Link>

        <div className="hidden text-[13px] text-gray-600 lg:absolute lg:top-7 lg:right-8 lg:block">
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
            27일 스트릭이 기다리고 있어요 🔥
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
                  size={index === 0 ? 'large' : 'medium'}
                  recentBadge={index === 0 && recommended === provider}
                  className={meta.className}
                />
              );
            })}
          </div>

          <div
            className={cn(
              'mt-5 flex items-start gap-2.5 rounded-[10px] bg-gray-50',
              'px-3.5 py-3'
            )}
          >
            <Icon name="Bell" size={16} className="mt-0.5 text-gray-600" />
            <Text size="caption2" weight="regular" className="text-gray-600">
              어떤 SNS로 가입했는지 기억나지 않으시나요?{' '}
              <Link
                href="/help"
                className="text-main-800 font-bold hover:underline"
              >
                계정 찾기
              </Link>
            </Text>
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
  );
}
