import React from 'react';
import Image from 'next/image';
import {
  PageBackground as OdosPageBackground,
  PageTitle as OdosPageTitle,
  Spacing as OdosSpacing,
  PageWatermark as OdosPageWatermark,
  Footer as OdosFooter,
  Text as OdosLabel,
  Tag as OdosTag,
  UserListItem,
  Button as OdosButton,
  CircularProgress,
  DiaryCard,
} from '@1d1s/design-system';
import { ChallengeGoalToggle } from '@/features/diary/presentation/components/challenge-goal-toggle';

interface ChallengeDetailProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDetail({
  params,
}: ChallengeDetailProps & {}): Promise<React.ReactElement> {
  const { id } = await params;
  const isAuthor = false; // 임시로 사용중인 작성자 여부 변수입니다.

  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <OdosPageBackground className="min-h-screen w-250 px-7.5">
            <OdosSpacing className="h-20" />
            <OdosPageTitle title="챌린지 상세" />
            <OdosSpacing className="h-20" />
            <div className="flex w-full flex-col self-start">
              <div className="flex w-full justify-between">
                <OdosLabel size={'heading1'} weight={'bold'}>
                  [챌린지 제목]{id}
                </OdosLabel>
                {isAuthor && <OdosButton variant={'warning'}>챌린지 주최 취소</OdosButton>}
              </div>
              <OdosSpacing className="h-7" />
              <div className="bg-main-300 rounded-odos-2 flex min-h-16 w-full items-center p-4">
                챌린지 설명챌린지 설명챌린지 설명
              </div>
              <OdosSpacing className="h-3" />
              <div className="flex gap-2">
                <OdosTag size="body1" weight="medium" className="rounded-odos-2 h-10 px-3">
                  개발
                </OdosTag>
                <OdosTag
                  size="body1"
                  weight="medium"
                  className="rounded-odos-2 bg-mint-800 h-10 px-3"
                >
                  모집중 - 챌린지 시작일 2025.06.10
                </OdosTag>
              </div>
              <OdosSpacing className="h-12" />
              <div className="flex w-full justify-between">
                <div className="flex flex-col">
                  <div className="flex gap-2">
                    <OdosLabel size={'heading2'} weight={'bold'}>
                      챌린지 목표
                    </OdosLabel>
                    <OdosTag>고정목표</OdosTag>
                  </div>
                  <ChallengeGoalToggle
                    disabled={true}
                    checked={true}
                    label={'챌린지 목표 1'}
                    className="mt-6"
                  />
                  <ChallengeGoalToggle
                    disabled={true}
                    checked={true}
                    label={'챌린지 목표 1'}
                    className="mt-3"
                  />
                </div>
                <div className="flex flex-col">
                  <OdosLabel size={'heading2'} weight={'bold'}>
                    통계
                  </OdosLabel>
                  <OdosSpacing className="h-6" />
                  <div className="bg-mint-100 rounded-odos-2 flex w-94 justify-between p-7.5">
                    <div className="flex flex-col items-center justify-center">
                      <OdosLabel size={'body2'} weight={'bold'}>
                        참여율
                      </OdosLabel>
                      <OdosSpacing className="h-3" />
                      <CircularProgress
                        size={'xl'}
                        value={60}
                        color="green"
                        showPercentage={true}
                      />
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <OdosLabel size={'body2'} weight={'bold'}>
                        목표 수행률
                      </OdosLabel>
                      <OdosSpacing className="h-3" />
                      <CircularProgress
                        size={'xl'}
                        value={60}
                        color="green"
                        showPercentage={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <OdosSpacing className="h-20" />
              <div className="flex items-center gap-2">
                <OdosLabel size={'heading2'} weight={'bold'}>
                  일지
                </OdosLabel>
                <OdosLabel size={'body2'} weight={'regular'} className="text-gray-500">
                  더보기+
                </OdosLabel>
              </div>
              <div className="overflow-x-auto">
                <div className="flex w-fit gap-4 py-4">
                  {[...Array(12)].map((_, i) => (
                    <DiaryCard
                      key={i}
                      percent={0}
                      likes={0}
                      title={'테스트'}
                      user={'고라니'}
                      challengeLabel={'테스트'}
                      challengeUrl={''}
                      date={'2025.06.10'}
                      emotion={'happy'}
                    />
                  ))}
                </div>
              </div>
              <OdosSpacing className="h-20" />
              <div className="flex w-full justify-between">
                <div className="flex items-center gap-2">
                  <OdosLabel size={'heading2'} weight={'bold'}>
                    [챌린지 제목] 참여자 목록
                  </OdosLabel>
                  <OdosLabel size={'body2'} weight={'regular'} className="text-gray-500">
                    더보기+
                  </OdosLabel>
                </div>
                <OdosTag weight="medium" className="font-pretendard bg-black">
                  <div className="flex">
                    {' '}
                    <Image
                      src={'/images/user-white.png'}
                      width={12}
                      height={12}
                      alt="icon-user"
                      className="mr-2"
                    />
                    10 /12
                  </div>
                </OdosTag>
              </div>
            </div>
            <OdosSpacing className="h-5" />
            <div className="grid w-full grid-cols-4 gap-5">
              <UserListItem userName={'고라니'} isAuthor={isAuthor}></UserListItem>
              <UserListItem userName={'고라니'} isAuthor={isAuthor}></UserListItem>
              <UserListItem userName={'고라니'} isAuthor={isAuthor}></UserListItem>
              <UserListItem userName={'고라니'} isAuthor={isAuthor}></UserListItem>
              <UserListItem userName={'고라니'} isAuthor={isAuthor}></UserListItem>
              <UserListItem userName={'고라니'} isAuthor={isAuthor}></UserListItem>
              <UserListItem userName={'고라니'} isAuthor={isAuthor}></UserListItem>
              <UserListItem userName={'고라니'} isAuthor={isAuthor}></UserListItem>
              <UserListItem userName={'고라니'} isAuthor={isAuthor}></UserListItem>
            </div>
            <OdosSpacing className="h-20" />
            {!isAuthor && (
              <div className="shadow-top rounded-odos-2 sticky bottom-0 z-10 bg-white">
                <OdosButton className="mb-8 w-[560px]">챌린지 참여 신청</OdosButton>
              </div>
            )}
            <OdosSpacing className="h-10" />
            <OdosPageWatermark />
            <OdosSpacing className="h-20" />
          </OdosPageBackground>
        </div>
        <OdosFooter />
      </div>
  );
}
