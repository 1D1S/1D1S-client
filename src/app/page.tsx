'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import {
  PageTitle,
  Footer,
  Text,
  Spacing,
  PageWatermark,
  PageBackground,
  Menu,
  ProfileCard,
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
    <div className="ml-8 flex w-full flex-col gap-4">
      <div className="flex flex-row gap-2.5">
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
  const CARD_COUNT = 8;
  // 트랙 전체(복제된 카드 2세트)를 감싸는 ref
  const trackRef = useRef<HTMLDivElement>(null);
  // 단일 카드 세트의 픽셀 너비
  const [singleWidth, setSingleWidth] = useState(0);

  useEffect(() => {
    if (trackRef.current) {
      // 전체 너비의 절반이 단일 세트 너비
      const total = trackRef.current.getBoundingClientRect().width;
      setSingleWidth(total / 2);
    }
  }, []);

  // 속도: 100px 당 1초
  const speed = 50;
  // 애니메이션 시간(초)
  const duration = singleWidth / speed;

  // 카드 JSX 한 세트
  const cards = Array.from({ length: CARD_COUNT }).map((_, i) => (
    <div key={i} className="inline-block px-3">
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
  ));

  return (
    <div className="flex w-full flex-col">
      <div className="fixed top-4 left-4 z-50 h-full w-60">
        <Menu />
      </div>
        <div className="fixed top-4 right-4 z-50 h-full">
          <ProfileCard />
        </div>
        <div className="flex w-full flex-col justify-center">
          <PageBackground className="mx-auto w-250">
            <Spacing className="h-20" />
            <PageTitle title="1D1S" variant="noSubtitle" />
            <Spacing className="h-25" />

            <div className="flex items-start gap-2 self-start px-5">
              <InfoButton
                mainText={'1D1S가 처음이신가요?'}
                subText={'온보딩'}
                imageSrc={'/images/logo-white.png'}
                gradientFrom={'#1D9C6D'}
                gradientTo={'#5EC69D'}
              />
              <InfoButton
                mainText={'불편한 점이 있으신가요?'}
                subText={'문의'}
                imageSrc={'/images/message.png'}
                gradientFrom={'#1666BA'}
                gradientTo={'#7AB3EF'}
              />
            </div>
            <Spacing className="h-20" />
            <SectionHeader title="랜덤 챌린지" subtitle="챌린지에 참여하고 목표를 달성해봐요." />
            <Spacing className="h-2" />
            <ScrollArea className="h-68 w-full">
              <div className="flex h-65 flex-row items-center gap-4 pl-5">
                {Array.from({ length: CARD_COUNT }).map((_, i) => (
                  <ChallengeCard
                    key={i}
                    challengeTitle="챌린지 제목"
                    challengeType="고정목표형"
                    currentUserCount={12}
                    maxUserCount={20}
                    startDate="2023-10-01"
                    endDate="2023-10-31"
                    isOngoing={i === 0}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <Spacing className="h-20" />
            <SectionHeader title="랜덤 일지" subtitle="챌린저들의 일지를 보며 의욕을 충전해봐요." />

            <div className="space-y-4">
              {/* 순방향 */}
              <div className="relative mx-auto w-250 overflow-hidden py-4 whitespace-nowrap">
                <div
                  ref={trackRef}
                  className="inline-flex"
                  style={{
                    animation: singleWidth ? `scroll ${duration}s linear infinite` : undefined,
                  }}
                >
                  {cards}
                  {cards}
                </div>
              </div>
              {/* 역방향 */}
              <div className="relative mx-auto w-250 overflow-hidden py-4 whitespace-nowrap">
                <div
                  className="inline-flex"
                  style={{
                    animation: singleWidth
                      ? `scroll ${duration + 2}s linear infinite reverse`
                      : undefined,
                  }}
                >
                  {cards}
                  {cards}
                </div>
              </div>
            </div>

            <Spacing className="h-20" />
            <PageWatermark />
            <Spacing className="h-20" />
          </PageBackground>
          <div className="w-full">
            <Footer />
          </div>
        </div>

        {/* styled-jsx 로 keyframes 정의 */}
        {singleWidth > 0 && (
          <style jsx>{`
            @keyframes scroll {
              from {
                transform: translateX(0);
              }
              to {
                transform: translateX(-${singleWidth}px);
              }
            }
          `}</style>
        )}
      </div>
  );
}
