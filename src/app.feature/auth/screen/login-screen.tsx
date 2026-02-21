'use client';

import { Icon, Text } from '@1d1s/design-system';
import Image from 'next/image';

export function LoginScreen(): React.ReactElement {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-white lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#FF6D2D] via-[#FF8F3F] to-[#FFBC63] px-12 py-10 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#FFC789]/40 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-2 flex h-8 w-8 items-center justify-center bg-white/20">
            <Icon name="Logo" size={18} className="text-white" />
          </div>
          <Text size="heading2" weight="bold" className="text-white">
            1D1S
          </Text>
        </div>

        <div className="relative z-10 flex flex-1 items-center">
          <div className="max-w-xl">
            <Text
              size="display1"
              weight="bold"
              className="leading-tight text-white"
            >
              &quot;The only way to achieve the impossible is to believe it is
              possible.&quot;
            </Text>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 lg:px-16">
        <div className="w-full max-w-[460px]">
          <div className="rounded-3 bg-main-100 text-main-600 mb-6 inline-flex h-10 w-10 items-center justify-center">
            <Icon name="Logo" size={20} className="text-main-600" />
          </div>

          <Text size="display2" weight="bold" className="block text-gray-900">
            1D1S와 함께 챌린지를 시작해봐요!
          </Text>

          <Text
            size="body1"
            weight="regular"
            className="mt-4 block text-gray-600"
          >
            챌린저들과 매일매일 목표 달성에 도전해봐요!
          </Text>

          <div className="mt-10 flex flex-col gap-4">
            <button
              type="button"
              className="rounded-4 relative flex h-14 w-full items-center justify-center bg-[#FEE500] px-5 font-semibold text-black transition hover:brightness-95"
            >
              <span className="absolute left-5">
                <Image
                  src="/images/kakao-logo.png"
                  alt="카카오"
                  width={22}
                  height={22}
                />
              </span>
              카카오 로그인
            </button>

            <button
              type="button"
              className="rounded-4 relative flex h-14 w-full items-center justify-center bg-[#03C75A] px-5 font-semibold text-white transition hover:brightness-95"
            >
              <span className="absolute left-5">
                <Image
                  src="/images/naver-logo.png"
                  alt="네이버"
                  width={22}
                  height={22}
                />
              </span>
              네이버 로그인
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
