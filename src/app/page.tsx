'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  BannerCarousel,
  type BannerCarouselItem,
  Text,
  PageWatermark,
  DiaryCard,
  ChallengeCard,
  InfoButton,
} from '@1d1s/design-system';

interface MainBannerItem extends BannerCarouselItem {
  href: string;
}

const RANDOM_DIARY_ITEMS = Array.from({ length: 12 }).map((_, index) => ({
  id: index + 1,
  imageUrl: '/images/default-card.png',
  percent: [60, 100, 30, 85, 42, 70, 90, 55, 76, 64, 33, 88][index],
  likes: [10, 24, 5, 18, 11, 9, 17, 8, 21, 6, 4, 14][index],
  title: [
    '고라니 밥주기 3일차 성공!',
    '오늘의 목표 전부 달성!',
    '아직 갈 길이 멀다',
    '매일 매일 조금씩 성장',
    '오늘도 인증 성공, 내일도 이어간다',
    '한 챕터 정리 완료, 조금씩 쌓이는 중',
    '아침 러닝 5km 인증 완료',
    '오늘도 물 2L 달성!',
    'UI 시안 2개 완성',
    '독서 메모 10줄 작성',
    '프로틴 식단 지키기 성공',
    '알고리즘 난이도 업 도전',
  ][index],
  user: ['고라니', '개발자킴', '디자이너리', '성실맨', '러닝조아', '북러버'][index % 6],
  userImage: '/images/default-profile.png',
  challengeLabel: [
    '고라니 챌린지',
    '알고리즘 챌린지',
    'UI 디자인 챌린지',
    '독서 챌린지',
    '아침 운동 챌린지',
    '독서 루틴 챌린지',
  ][index % 6],
  challengeUrl: '/diary',
  date: '2025.03.05',
  emotion: (['happy', 'happy', 'soso', 'happy', 'happy', 'soso'] as const)[index % 6],
}));

const MAIN_BANNERS: MainBannerItem[] = [
  {
    id: 'popular-challenge',
    type: '이번 주 추천',
    title: '지금 인기 챌린지 보러가기',
    subtitle: '가장 많이 참여 중인 챌린지를 확인해보세요.',
    href: '/challenge',
  },
  {
    id: 'community-diary',
    type: '커뮤니티 인기',
    title: '오늘의 커뮤니티 일지 보기',
    subtitle: '다른 챌린저들의 기록에서 동기를 받아보세요.',
    href: '/diary',
  },
  {
    id: 'challenge-create',
    type: '빠른 시작',
    title: '새 챌린지 만들기',
    subtitle: '지금 바로 목표를 정하고 챌린지를 시작해보세요.',
    href: '/challenge/create',
  },
];

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

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      {/* 메인 콘텐츠 */}
      <div className="flex w-full flex-col pt-6">
        <div className="h-6" />

        {/* 메인 배너 영역 */}
        <div className="w-full px-4">
          <BannerCarousel
            items={MAIN_BANNERS}
            autoSlideIntervalMs={5000}
            enableLoop
            showIndicators
            aspectRatioClassName="aspect-[4/1]"
            onItemClick={(_, index) => {
              const route = MAIN_BANNERS[index]?.href;

              if (route) {
                router.push(route);
              }
            }}
          />
        </div>

        <div className="h-3" />

        {/* 버튼 영역 */}
        <div className="w-full px-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-[200px] min-h-[200px] max-h-[200px]">
              <InfoButton
                mainText={'1D1S가 처음이신가요?'}
                subText={'온보딩'}
                imageSrc={'/images/logo-white.png'}
                gradientFrom={'#1D9C6D'}
                gradientTo={'#5EC69D'}
                className="!sm:h-full !sm:w-full !h-full !w-full cursor-pointer"
                onClick={() => router.push('/onboarding')}
              />
            </div>

            <div className="h-[200px] min-h-[200px] max-h-[200px]">
              <InfoButton
                mainText={'불편한 점이 있으신가요?'}
                subText={'문의'}
                imageSrc={'/images/message.png'}
                gradientFrom={'#1666BA'}
                gradientTo={'#7AB3EF'}
                className="!sm:h-full !sm:w-full !h-full !w-full cursor-pointer"
                onClick={() => router.push('/inquiry')}
              />
            </div>

            <div className="h-[200px] min-h-[200px] max-h-[200px]">
              <InfoButton
                mainText={'새로운 목표를 시작해보세요'}
                subText={'챌린지 생성'}
                imageSrc={'/images/add-white.png'}
                gradientFrom={'#FF6D2D'}
                gradientTo={'#FF9A3E'}
                className="!sm:h-full !sm:w-full !h-full !w-full cursor-pointer"
                onClick={() => router.push('/challenge/create')}
              />
            </div>
          </div>
        </div>

        <div className="h-10" />

        {/* 랜덤 챌린지 */}
        <SectionHeader title="랜덤 챌린지" subtitle="챌린지에 참여하고 목표를 달성해봐요." />
        <div className="h-4" />
        <div className="grid grid-cols-1 gap-3 px-4 pb-4 lg:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-0">
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

        <div className="h-12" />

        {/* 랜덤 일지 */}
        <SectionHeader title="랜덤 일지" subtitle="챌린저들의 일지를 보며 의욕을 충전해봐요." />
        <div className="h-4" />
        <div className="diary-grid-container px-4 pb-4">
          <div className="diary-card-grid grid grid-cols-2 gap-3">
            {RANDOM_DIARY_ITEMS.map((item) => (
              <div key={item.id} className="min-w-0 self-start">
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
        </div>

        <div className="h-12" />
        <div className="flex w-full justify-center">
          <PageWatermark />
        </div>
        <div className="h-8" />
      </div>
    </div>
  );
}
