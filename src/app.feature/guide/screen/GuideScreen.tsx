import { Text } from '@1d1s/design-system';
import { GuideMobileHeader } from '@feature/guide/components/GuideMobileHeader';
import { GuidePhoneMock } from '@feature/guide/components/GuidePhoneMock';
import {
  GUIDE_STEPS,
  GUIDE_SUMMARY,
  GUIDE_TIPS,
  type GuideStep,
} from '@feature/guide/consts/guideData';
import { cn } from '@module/utils/cn';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

function GuideStepBlock({
  step,
  index,
}: {
  step: GuideStep;
  index: number;
}): React.ReactElement {
  const StepIcon = step.icon;
  const flip = index % 2 === 1;
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-8',
        'lg:flex-row lg:gap-12',
        flip ? 'lg:flex-row-reverse' : ''
      )}
    >
      <div className="w-full max-w-[420px] min-w-0 lg:flex-1">
        <div className="mb-4 flex items-center gap-3">
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center',
              'bg-main-800 rounded-[13px] shadow-[0_6px_16px_rgba(255,89,0,0.28)]'
            )}
          >
            <StepIcon className="h-5 w-5 text-white" strokeWidth={2} />
          </span>
          <div>
            <Text
              size="caption1"
              weight="extrabold"
              className="text-main-800 block"
            >
              STEP {step.n}
            </Text>
            <Text
              size="caption1"
              weight="semibold"
              className="block text-gray-400"
            >
              {step.kicker}
            </Text>
          </div>
        </div>
        <Text
          as="h3"
          size="heading2"
          weight="extrabold"
          className="mb-3 block break-keep text-gray-900"
        >
          {step.title}
        </Text>
        <Text
          as="p"
          size="body2"
          weight="regular"
          className="block leading-relaxed break-keep text-gray-600"
        >
          {step.body}
        </Text>
      </div>
      <div className="shrink-0">
        <GuidePhoneMock mock={step.mock} />
      </div>
    </div>
  );
}

export default function GuideScreen(): React.ReactElement {
  return (
    <div className="min-h-screen w-full">
      {/* 모바일 헤더 — 설정에서 진입하는 서브페이지이므로 다른 서브페이지와
          동일하게 DS MobileHeader(뒤로가기)를 사용한다. */}
      <GuideMobileHeader />

      <div className="mx-auto w-full max-w-[960px] px-5 lg:px-6">
        {/* 히어로 */}
        <header
          className={cn(
            'animate-pop-in rounded-3 lg:rounded-4 mb-4 px-6 pt-14 pb-16',
            'text-center lg:px-10 lg:pt-20 lg:pb-20',
            'bg-[linear-gradient(180deg,var(--main-100),var(--gray-50))]'
          )}
        >
          <span
            className={cn(
              'bg-main-800 mb-5 inline-block rounded-full px-3.5 py-1.5',
              'text-[12.5px] font-extrabold tracking-wide text-white'
            )}
          >
            1 Day 1 Streak
          </span>
          <Text
            as="h1"
            size="display1"
            weight="extrabold"
            className="mx-auto mb-4 block break-keep text-gray-900"
          >
            작은 기록이 쌓여
            <br />
            <span className="text-main-800">꾸준함</span>이 됩니다
          </Text>
          <Text
            as="p"
            size="body1"
            weight="regular"
            className="mx-auto block max-w-[520px] leading-relaxed break-keep text-gray-600"
          >
            1D1S는 챌린지에 참여하고 매일 일지를 남기며 나의 도전을 기록하는
            서비스예요. 아래로 스크롤하며 사용법을 익혀보세요.
          </Text>
        </header>

        {/* 3줄 요약 */}
        <section className="animate-pop-in">
          <div className="grid gap-3.5 sm:grid-cols-3">
            {GUIDE_SUMMARY.map((c) => {
              const CardIcon = c.icon;
              return (
                <div
                  key={c.title}
                  className={cn(
                    'rounded-2 border border-gray-200 bg-white p-5',
                    'shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                  )}
                >
                  <span
                    className={cn(
                      'mb-3 flex h-9 w-9 items-center justify-center',
                      'bg-main-100 rounded-[11px]'
                    )}
                  >
                    <CardIcon className="text-main-800 h-[19px] w-[19px]" />
                  </span>
                  <Text
                    size="body1"
                    weight="extrabold"
                    className="mb-1 block text-gray-900"
                  >
                    {c.title}
                  </Text>
                  <Text
                    size="caption2"
                    weight="regular"
                    className="block leading-relaxed break-keep text-gray-500"
                  >
                    {c.desc}
                  </Text>
                </div>
              );
            })}
          </div>
        </section>

        {/* 스텝 */}
        <section className="pt-14 pb-6">
          <div className="animate-pop-in mb-14 text-center">
            <Text
              size="caption1"
              weight="extrabold"
              className="text-main-800 mb-2 block tracking-wide"
            >
              HOW IT WORKS
            </Text>
            <Text
              as="h2"
              size="heading1"
              weight="extrabold"
              className="block tracking-tight text-gray-900"
            >
              5단계로 시작하기
            </Text>
          </div>
          <div className="flex flex-col gap-16 lg:gap-20">
            {GUIDE_STEPS.map((step, i) => (
              <div key={step.n} className="animate-pop-in">
                <GuideStepBlock step={step} index={i} />
              </div>
            ))}
          </div>
        </section>

        {/* 팁 */}
        <section
          className={cn(
            'animate-pop-in -mx-5 mt-16 border-y border-gray-200 bg-white',
            'px-5 py-16 lg:-mx-6 lg:px-6'
          )}
        >
          <Text
            as="h2"
            size="heading1"
            weight="extrabold"
            className="mb-9 block text-center tracking-tight text-gray-900"
          >
            더 잘 활용하는 팁
          </Text>
          <div className="grid gap-4.5 sm:grid-cols-3">
            {GUIDE_TIPS.map((t) => {
              const TipIcon = t.icon;
              return (
                <div
                  key={t.title}
                  className={cn(
                    'rounded-2 flex h-full gap-3.5 border border-gray-100',
                    'bg-gray-50 p-5'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center',
                      'rounded-[11px] border border-gray-200 bg-white'
                    )}
                  >
                    <TipIcon className="text-main-800 h-[19px] w-[19px]" />
                  </span>
                  <div>
                    <Text
                      size="body1"
                      weight="extrabold"
                      className="mb-1.5 block text-gray-900"
                    >
                      {t.title}
                    </Text>
                    <Text
                      size="caption2"
                      weight="regular"
                      className="block leading-relaxed break-keep text-gray-500"
                    >
                      {t.desc}
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 클로징 CTA */}
        <section className="animate-pop-in pt-20 pb-24 text-center">
          <div
            className={cn(
              'rounded-4 px-8 py-14 text-white',
              'shadow-[0_20px_48px_rgba(255,89,0,0.24)]',
              'bg-[linear-gradient(135deg,var(--main-600)_0%,var(--main-800)_100%)]'
            )}
          >
            <Text
              as="h2"
              size="heading1"
              weight="extrabold"
              className="mb-3.5 block break-keep text-white"
            >
              오늘의 첫 기록,
              <br />
              지금 시작해볼까요?
            </Text>
            <Text
              as="p"
              size="body2"
              weight="regular"
              className="mx-auto mb-7 block max-w-[420px] leading-relaxed break-keep text-white/90"
            >
              마음에 드는 챌린지를 찾고, 오늘 하루를 기록하는 것부터. 꾸준함은
              그렇게 시작돼요.
            </Text>
            <Link
              href="/challenge"
              className={cn(
                'inline-flex items-center gap-2 rounded-full bg-white',
                'text-main-800 px-7 py-3.5 text-[15.5px] font-extrabold',
                'shadow-[0_6px_18px_rgba(0,0,0,0.12)]',
                'transition hover:brightness-95'
              )}
            >
              챌린지 둘러보기
              <ArrowRight className="h-[17px] w-[17px]" strokeWidth={2.4} />
            </Link>
          </div>
          <Text
            size="caption2"
            weight="regular"
            className="mt-10 block text-gray-400"
          >
            1 Day 1 Streak — 매일의 기록이 만드는 변화
          </Text>
        </section>
      </div>
    </div>
  );
}
