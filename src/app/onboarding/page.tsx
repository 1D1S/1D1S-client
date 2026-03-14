'use client';

import { Button, Text } from '@1d1s/design-system';
import { BookOpen, Flag, Search, UserRound, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

const STEPS = [
  {
    icon: Flag,
    title: '매일 하나의 챌린지',
    description:
      '지루한 일상에 활력을 불어넣어보세요. 매일 새로운 목표에 도전하며 작은 성취를 쌓아가세요.',
  },
  {
    icon: BookOpen,
    title: '일지로 기록하기',
    description:
      '오늘의 도전과 감정을 일지로 남겨보세요. 나만의 소중한 성장 기록이 쌓여갑니다.',
  },
  {
    icon: Users,
    title: '함께 성장하기',
    description:
      '다른 챌린저들과 일지를 공유하며 서로 동기부여 하세요. 함께하면 더 오래 지속할 수 있습니다.',
  },
];

export default function OnboardingPage(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden px-6 py-12">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Text size="display1" weight="bold" className="text-gray-900">
                1Day 1Streak
              </Text>
              <span className="bg-main-800 rounded-full px-2 py-0.5 text-xs font-bold text-white">
                BETA
              </span>
            </div>
            <Text size="body1" weight="regular" className="text-gray-600">
              하루 하나의 습관으로
              <br />
              삶을 바꿔보세요.
            </Text>
          </div>
          <div className="shrink-0">
            <Image
              src="/images/logo.svg"
              alt="1D1S"
              width={120}
              height={120}
              className="opacity-90"
            />
          </div>
        </div>
      </section>

      {/* 3단계 소개 */}
      <section className="px-6 py-10">
        <Text
          size="heading1"
          weight="bold"
          className="mb-6 block text-center text-gray-900"
        >
          1D1S 3단계 여정
        </Text>

        <div className="mx-auto flex max-w-lg flex-col gap-4">
          {STEPS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-3 flex items-start gap-4 border border-gray-200 bg-white p-4"
            >
              <div className="bg-main-200 mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                <Icon className="text-main-800 h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <Text size="body1" weight="bold" className="text-gray-900">
                  {title}
                </Text>
                <Text size="body2" weight="regular" className="text-gray-500">
                  {description}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 앱 미리보기 */}
      <section className="bg-main-100 px-6 py-10">
        <Text
          size="heading1"
          weight="bold"
          className="mb-6 block text-center text-gray-900"
        >
          지금 바로 시작해보세요
        </Text>
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          {[
            {
              icon: Search,
              title: '챌린지 탐색',
              description: '다양한 챌린지를 탐색하고 참여하세요',
            },
            {
              icon: BookOpen,
              title: '일지 작성',
              description: '오늘의 챌린지를 기록하고 감정을 남기세요',
            },
            {
              icon: UserRound,
              title: '마이페이지',
              description: '나의 챌린지 현황과 성장을 확인하세요',
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-3 flex items-center gap-4 border border-gray-200 bg-white p-4"
            >
              <div className="bg-main-200 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Icon className="text-main-800 h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <Text size="body1" weight="bold" className="block text-gray-900">
                  {title}
                </Text>
                <Text size="body2" weight="regular" className="block text-gray-500">
                  {description}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-8">
        <div className="mx-auto max-w-lg">
          <Button
            variant="default"
            className="h-14 w-full text-base"
            onClick={() => router.push('/challenge')}
          >
            지금 시작하기
          </Button>
        </div>
      </section>
    </div>
  );
}
