'use client';

import React from 'react';
import {
  DiaryCard,
  PageBackground,
  PageTitle,
  Spacing,
  PageWatermark,
  Text,
  ChallengeListItem,
  ProfileCard,
} from '@1d1s/design-system';
import { useDiaryItems } from '@/features/diary/presentation/hooks/diary-items';

export default function MyPage(): React.ReactElement {
  const { items, loading } = useDiaryItems(12, 12);
  const countings = [
    { title: '작성한 일지', count: 10 },
    { title: '달성한 목표', count: 35 },
    { title: '', count: 0 }, // 빈 공간을 위한 더미 데이터
    { title: '5월의 일지', count: 10 },
    { title: '5월의 목표', count: 35 },
    { title: '최장 스트릭', count: 180 },
    { title: '현재 스트릭', count: 10 },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <PageBackground className="min-h-screen min-w-250 px-5">
          <Spacing className="h-15" />
          <PageTitle title="나의 1D1S" />
          <Spacing className="h-15" />

          <div className="flex flex-col items-start">
            {/* 프로필 */}
            <div className="flex w-full gap-5">
              <ProfileCard initialMode="expanded" />
              <div className="bg-main-200 rounded-odos-2 flex h-[225px] w-130 flex-1 flex-col items-center justify-center">
                <Text size="heading1" weight="medium" className="text-center text-gray-500">
                  포인트와 티켓, 등급은 <br /> 추후 개발될 예정입니다!
                </Text>
              </div>
            </div>

            <Spacing className="h-20" />

            {/* 카운팅 및 스트릭 */}
            <Text size="heading1" weight="bold">
              카운팅과 스트릭
            </Text>
            <Spacing className="h-6" />
            <div className="bg-main-200 grid h-60 w-235 grid-cols-5 gap-x-25 gap-y-12 px-22 py-12">
              {countings.map((item, index) =>
                item.title === '' ? (
                  <div className="flex h-15 w-20 justify-center" key={index}>
                    <div className="bg-main-400 h-15 w-[1px]" />
                  </div>
                ) : (
                  <div className="flex h-15 w-20 flex-col items-center gap-3" key={index}>
                    <Text size="heading1" weight="bold" className="text-main-900">
                      {item.count}
                    </Text>
                    <Text size="body2" weight="medium" className="text-black">
                      {item.title}
                    </Text>
                  </div>
                )
              )}
            </div>

            <Spacing className="h-8" />
            <div className="grid grid-flow-col grid-rows-7 gap-2.5">
              {Array.from({ length: 50 }).map((_, idx) => (
                <div className="rounded-odos-1 h-5 w-5 bg-gray-300" key={idx} />
              ))}
            </div>
            <Spacing className="h-20" />

            {/* 챌린지 목록 */}
            <Text size="heading1" weight="bold">
              진행 중인 챌린지
            </Text>
            <Spacing className="h-6" />
            <div className="flex w-full flex-col gap-2.5">
              {Array.from({ length: 4 }).map((_, idx) => (
                <ChallengeListItem
                  key={idx}
                  challengeName={`고라니 밥주기 챌린지 ${idx + 1}`}
                  startDate={'2025.04.05'}
                  endDate={'2025.04.10'}
                  maxParticipants={20}
                  currentParticipants={idx + 1}
                />
              ))}
            </div>

            <Spacing className="h-20" />

            {/* 일지 목록 */}
            <Text size="heading1" weight="bold">
              나의 일지
            </Text>
            <Spacing className="h-6" />
            <div className="grid w-full grid-cols-4 gap-5">
              {items.map((item) => (
                <DiaryCard
                  key={item.id}
                  imageUrl={item.imageUrl}
                  percent={item.percent}
                  likes={item.likes}
                  title={item.title}
                  user={item.user}
                  userImage={item.userImage}
                  challengeLabel={item.challengeLabel}
                  challengeUrl={item.challengeUrl}
                  date={item.date}
                  emotion={item.emotion}
                />
              ))}
            </div>

            {loading && (
              <div className="flex w-full flex-col items-center justify-center py-4">
                <Spacing className="h-20" />
                <Text size="body1" weight="regular">
                  로딩 중...
                </Text>
              </div>
            )}
          </div>

          <Spacing className="h-25" />
          <PageWatermark />
          <Spacing className="h-25" />
        </PageBackground>
      </div>
    </div>
  );
}
