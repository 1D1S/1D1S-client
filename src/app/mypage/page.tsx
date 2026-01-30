'use client';

import React from 'react';
import { ScrollArea, ScrollBar } from '@component/ui/scroll-area';
import {
  DiaryCard,
  PageTitle,
  Spacing,
  PageWatermark,
  Text,
  ChallengeListItem,
  ProfileCard,
  Streak,
  Checkbox,
} from '@1d1s/design-system';
import { useDiaryItems } from '@feature/diary/presentation/hooks/diary-items';

export default function MyPage(): React.ReactElement {
  const { items, loading } = useDiaryItems(12, 12);
  const countings = [
    { title: '작성한 일지', count: 10 },
    { title: '달성한 목표', count: 35 },
    { title: '5월의 일지', count: 10 },
    { title: '5월의 목표', count: 35 },
    { title: '최장 스트릭', count: 180 },
    { title: '현재 스트릭', count: 10 },
  ];

  // 스트릭 데이터 생성 (최근 90일)
  const streakData = Array.from({ length: 90 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (89 - i));
    return {
      date: date.toISOString().split('T')[0],
      count: (i * 7 + 3) % 5, // 0-4 활동 레벨 (고정 패턴)
    };
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      {/* 메인 콘텐츠 */}
      <div className="flex w-full flex-col px-4 pt-16">
        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageTitle title="나의 1D1S" />
        </div>
        <Spacing className="h-8" />

        <div className="flex w-full flex-col">
          {/* 프로필 */}
          <ProfileCard initialMode="expanded" />

          <Spacing className="h-6" />

          {/* 포인트 안내 */}
          <div className="bg-main-200 rounded-odos-2 flex h-24 w-full flex-col items-center justify-center p-4">
            <Text size="body1" weight="medium" className="text-center text-gray-500">
              포인트와 티켓, 등급은 추후 개발될 예정입니다!
            </Text>
          </div>

          <Spacing className="h-8" />

          {/* 카운팅 및 스트릭 */}
          <Text size="heading1" weight="bold">
            카운팅과 스트릭
          </Text>
          <Spacing className="h-4" />
          <div className="bg-main-200 grid w-full grid-cols-2 gap-4 rounded-lg p-4">
            {countings.map((item, index) => (
              <div className="flex flex-col items-center gap-1" key={index}>
                <Text size="heading1" weight="bold" className="text-main-900">
                  {item.count}
                </Text>
                <Text size="caption1" weight="medium" className="text-black">
                  {item.title}
                </Text>
              </div>
            ))}
          </div>

          <Spacing className="h-4" />

          <Streak data={streakData} />

          {/* 챌린지 목록 */}
          <div className="flex items-center gap-2">
            <Text size="heading1" weight="bold">
              진행 중인 챌린지
            </Text>
            <Checkbox label="진행 중인 것만 보기" />
          </div>
          <Spacing className="h-4" />
          <div className="flex w-full flex-col gap-3">
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

          <Spacing className="h-8" />

          {/* 일지 목록 */}
          <Text size="heading1" weight="bold">
            나의 일지
          </Text>
          <Spacing className="h-4" />
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-4">
              {items.map((item) => (
                <div key={item.id} className="w-[240px] shrink-0">
                  <DiaryCard
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
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {loading && (
            <div className="flex w-full flex-col items-center justify-center py-4">
              <Text size="body1" weight="regular">
                로딩 중...
              </Text>
            </div>
          )}
        </div>

        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageWatermark />
        </div>
        <Spacing className="h-8" />
      </div>
    </div>
  );
}
