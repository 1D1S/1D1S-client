'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import {
  PageTitle,
  Text,
  Spacing,
  PageWatermark,
  DiaryCard,
  ChallengeCard,
  InfoButton,
} from '@1d1s/design-system';

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}): React.ReactElement {
  return (
    <div className="flex w-full flex-col gap-2 px-4">
      <div className="flex flex-row items-center gap-2">
        <Text size="heading1" weight="bold" className="text-black">
          {title}
        </Text>
        <Text size="body2" weight="medium" className="text-gray-500">
          더보기 +
        </Text>
      </div>
      <Text size="caption3" weight="medium" className="text-gray-600">
        {subtitle}
      </Text>
    </div>
  );
}

export default function MainPage(): React.ReactElement {
  const router = useRouter();
  const CARD_COUNT = 8;

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      {/* 메인 콘텐츠 */}
      <div className="flex w-full flex-col pt-16">
        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageTitle title="1D1S" variant="noSubtitle" />
        </div>
        <Spacing className="h-8" />

        {/* 인포 버튼 */}
        <div className="flex w-full md:w-1/2 flex-row gap-3 px-4">
          <InfoButton
            mainText={'1D1S가 처음이신가요?'}
            subText={'온보딩'}
            imageSrc={'/images/logo-white.png'}
            gradientFrom={'#1D9C6D'}
            gradientTo={'#5EC69D'}
            className="flex-1 h-32 cursor-pointer"
            onClick={() => router.push('/onboarding')}
          />
          <InfoButton
            mainText={'불편한 점이 있으신가요?'}
            subText={'문의'}
            imageSrc={'/images/message.png'}
            gradientFrom={'#1666BA'}
            gradientTo={'#7AB3EF'}
            className="flex-1 h-32 cursor-pointer"
            onClick={() => router.push('/inquiry')}
          />
        </div>

        <Spacing className="h-12" />

        {/* 랜덤 챌린지 */}
        <SectionHeader title="랜덤 챌린지" subtitle="챌린지에 참여하고 목표를 달성해봐요." />
        <Spacing className="h-4" />
        <ScrollArea className="w-full">
          <div className="flex gap-3 px-4 pb-4">
            {Array.from({ length: CARD_COUNT }).map((_, i) => (
              <div key={i} className="shrink-0 w-[280px]">
                <ChallengeCard
                  challengeTitle="챌린지 제목"
                  challengeType="고정목표형"
                  currentUserCount={12}
                  maxUserCount={20}
                  startDate="2023-10-01"
                  endDate="2023-10-31"
                  isOngoing={i === 0}
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <Spacing className="h-12" />

        {/* 랜덤 일지 */}
        <SectionHeader title="랜덤 일지" subtitle="챌린저들의 일지를 보며 의욕을 충전해봐요." />
        <Spacing className="h-4" />
        <ScrollArea className="w-full">
          <div className="flex gap-3 px-4 pb-4">
            {Array.from({ length: CARD_COUNT }).map((_, i) => (
              <div key={i} className="shrink-0 w-[240px]">
                <DiaryCard
                  percent={0}
                  likes={0}
                  title="테스트"
                  user="고라니"
                  challengeLabel="테스트"
                  challengeUrl=""
                  date="2025.06.10"
                  emotion="happy"
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <Spacing className="h-12" />
        <div className="flex w-full justify-center">
          <PageWatermark />
        </div>
        <Spacing className="h-8" />
      </div>
    </div>
  );
}
