'use client';

import {
  BannerCarousel,
  ChallengeCard,
  DiaryCard,
  InfoButton,
  PageWatermark,
  Text,
} from '@1d1s/design-system';
import {
  HOME_MAIN_BANNERS,
  HOME_RANDOM_CHALLENGE_ITEMS,
  HOME_RANDOM_DIARY_ITEMS,
} from '@constants/consts/home-data';
import { useRouter } from 'next/navigation';
import React from 'react';

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
            items={HOME_MAIN_BANNERS}
            autoSlideIntervalMs={5000}
            enableLoop
            showIndicators
            aspectRatioClassName="aspect-[4/1]"
            onItemClick={(_, index) => {
              const route = HOME_MAIN_BANNERS[index]?.href;

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
            <div className="h-[200px] max-h-[200px] min-h-[200px]">
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

            <div className="h-[200px] max-h-[200px] min-h-[200px]">
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

            <div className="h-[200px] max-h-[200px] min-h-[200px]">
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
        <SectionHeader
          title="랜덤 챌린지"
          subtitle="챌린지에 참여하고 목표를 달성해봐요."
        />
        <div className="h-4" />
        <div className="grid grid-cols-1 gap-3 px-4 pb-4 lg:grid-cols-2 xl:grid-cols-4">
          {HOME_RANDOM_CHALLENGE_ITEMS.map((challenge) => (
            <div key={challenge.id} className="min-w-0">
              <ChallengeCard
                challengeTitle={challenge.challengeTitle}
                challengeType={challenge.challengeType}
                currentUserCount={challenge.currentUserCount}
                maxUserCount={challenge.maxUserCount}
                startDate={challenge.startDate}
                endDate={challenge.endDate}
                isOngoing={challenge.isOngoing}
              />
            </div>
          ))}
        </div>

        <div className="h-12" />

        {/* 랜덤 일지 */}
        <SectionHeader
          title="랜덤 일지"
          subtitle="챌린저들의 일지를 보며 의욕을 충전해봐요."
        />
        <div className="h-4" />
        <div className="diary-grid-container px-4 pb-4">
          <div className="diary-card-grid grid grid-cols-2 gap-3">
            {HOME_RANDOM_DIARY_ITEMS.map((item) => (
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
