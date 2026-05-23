'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { InstallStepCard } from '../components/InstallStepCard';

type GuideTab = 'ios' | 'android';

interface InstallStep {
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
}

const IOS_STEPS: InstallStep[] = [
  {
    title: 'Safari 하단의 공유 버튼을 누르세요',
    description:
      '화면 하단 중앙에 있는 공유 아이콘(위쪽 화살표가 있는 사각형)을 눌러 공유 메뉴를 엽니다.',
  },
  {
    title: '"홈 화면에 추가"를 선택하세요',
    description:
      '공유 메뉴를 위로 스크롤해 "홈 화면에 추가" 항목을 찾고 눌러주세요.',
  },
  {
    title: '우측 상단의 "추가"를 누르세요',
    description:
      '이름과 아이콘을 확인한 뒤 우측 상단의 "추가" 버튼을 누르면 홈 화면에 1D1S 아이콘이 생깁니다.',
  },
];

const ANDROID_STEPS: InstallStep[] = [
  {
    title: 'Chrome 우측 상단 메뉴를 누르세요',
    description: '주소창 옆에 있는 점 세 개(⋮) 아이콘을 눌러 메뉴를 엽니다.',
  },
  {
    title: '"홈 화면에 추가" 또는 "앱 설치"를 누르세요',
    description:
      '메뉴에서 "홈 화면에 추가" 또는 "앱 설치" 항목을 선택합니다. 기기 또는 Chrome 버전에 따라 명칭이 다를 수 있어요.',
  },
  {
    title: '"추가"를 눌러 마무리하세요',
    description:
      '아이콘 이름을 확인한 뒤 "추가"를 누르면 홈 화면에 1D1S 아이콘이 생성됩니다.',
  },
];

const TABS: Array<{ id: GuideTab; label: string }> = [
  { id: 'ios', label: 'iPhone · Safari' },
  { id: 'android', label: 'Android · Chrome' },
];

export default function InstallGuideScreen(): React.ReactElement {
  const router = useRouter();
  const [tab, setTab] = useState<GuideTab>('ios');

  const steps = tab === 'ios' ? IOS_STEPS : ANDROID_STEPS;

  return (
    <div className="min-h-screen w-full bg-white">
      <div
        className={cn(
          'sticky top-0 z-30 flex items-center gap-3',
          'h-14-safe pt-safe-top',
          'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
          'lg:hidden'
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="body1"
          weight="extrabold"
          className="flex-1 truncate tracking-[-0.3px] text-gray-900"
        >
          홈 화면에 추가하기
        </Text>
      </div>

      <section
        className={cn(
          'mx-auto w-full max-w-[820px]',
          'px-5 py-5 lg:px-8 lg:py-10'
        )}
      >
        <header
          className={cn(
            'hidden flex-col gap-2 border-b border-gray-100 pb-6',
            'lg:flex'
          )}
        >
          <Text
            size="pageTitle"
            weight="extrabold"
            className="tracking-tight text-gray-900"
          >
            홈 화면에 추가하기
          </Text>
          <Text size="body2" weight="regular" className="text-gray-500">
            1Day 1Streak 을 홈 화면에 추가하면 앱처럼 빠르게 열 수 있어요.
          </Text>
        </header>

        <div
          role="tablist"
          aria-label="OS 선택"
          className={cn(
            'mt-5 flex w-full gap-2 rounded-2xl bg-gray-100 p-1',
            'lg:mt-8'
          )}
        >
          {TABS.map((item) => {
            const isActive = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(item.id)}
                className={cn(
                  'flex-1 rounded-xl px-3 py-2 text-sm font-bold',
                  'transition-colors',
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:mt-8 lg:gap-5">
          {steps.map((step, index) => (
            <InstallStepCard
              key={`${tab}-${index}`}
              stepNumber={index + 1}
              title={step.title}
              description={step.description}
              imageSrc={step.imageSrc}
              imageAlt={step.imageAlt}
            />
          ))}
        </div>

        <Text
          size="caption1"
          weight="regular"
          className="mt-6 block leading-6 text-gray-500 lg:mt-8"
        >
          ※ 기기 OS 버전 또는 브라우저 버전에 따라 화면 구성과 메뉴 명칭이
          조금씩 다를 수 있습니다.
        </Text>
      </section>
    </div>
  );
}
