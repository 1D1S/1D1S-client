'use client';

import React from 'react';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import {
  PageTitle,
  Spacing,
  PageWatermark,
  Text,
  Tag,
  UserListItem,
  Button,
  CircularProgress,
  DiaryCard,
} from '@1d1s/design-system';
import { ChallengeGoalToggle } from '@/features/diary/presentation/components/challenge-goal-toggle';

interface ChallengeDetailContentProps {
  id: string;
}

export function ChallengeDetailContent({ id }: ChallengeDetailContentProps) {
  const isAuthor = false;

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="flex w-full flex-col px-4">
        <Spacing className="h-8" />
        <div className="flex w-full justify-center">
          <PageTitle title="챌린지 상세" />
        </div>
        <Spacing className="h-8" />

        <div className="flex w-full flex-col">
          {/* 제목 및 취소 버튼 */}
          <div className="flex w-full flex-col gap-2">
            <Text size={'heading1'} weight={'bold'}>
              [챌린지 제목]{id}
            </Text>
            {isAuthor && <Button variant={'warning'}>챌린지 주최 취소</Button>}
          </div>

          <Spacing className="h-4" />

          {/* 설명 */}
          <div className="bg-main-300 rounded-odos-2 flex min-h-16 w-full items-center p-4">
            챌린지 설명챌린지 설명챌린지 설명
          </div>

          <Spacing className="h-3" />

          {/* 태그 */}
          <div className="flex flex-wrap gap-2">
            <Tag size="body1" weight="medium" className="rounded-odos-2 h-10 px-3">
              개발
            </Tag>
            <Tag
              size="body1"
              weight="medium"
              className="rounded-odos-2 bg-mint-800 h-10 px-3"
            >
              모집중 - 챌린지 시작일 2025.06.10
            </Tag>
          </div>

          <Spacing className="h-8" />

          {/* 챌린지 목표 */}
          <div className="flex flex-col">
            <div className="flex gap-2">
              <Text size={'heading2'} weight={'bold'}>
                챌린지 목표
              </Text>
              <Tag>고정목표</Tag>
            </div>
            <ChallengeGoalToggle
              disabled={true}
              checked={true}
              label={'챌린지 목표 1'}
              className="mt-4"
            />
            <ChallengeGoalToggle
              disabled={true}
              checked={true}
              label={'챌린지 목표 2'}
              className="mt-3"
            />
          </div>

          <Spacing className="h-8" />

          {/* 통계 */}
          <div className="flex flex-col">
            <Text size={'heading2'} weight={'bold'}>
              통계
            </Text>
            <Spacing className="h-4" />
            <div className="bg-mint-100 rounded-odos-2 flex w-full justify-around p-6">
              <div className="flex flex-col items-center justify-center">
                <Text size={'body2'} weight={'bold'}>
                  참여율
                </Text>
                <Spacing className="h-3" />
                <CircularProgress
                  size={'xl'}
                  value={60}
                  color="green"
                  showPercentage={true}
                />
              </div>
              <div className="flex flex-col items-center justify-center">
                <Text size={'body2'} weight={'bold'}>
                  목표 수행률
                </Text>
                <Spacing className="h-3" />
                <CircularProgress
                  size={'xl'}
                  value={60}
                  color="green"
                  showPercentage={true}
                />
              </div>
            </div>
          </div>

          <Spacing className="h-8" />

          {/* 일지 */}
          <div className="flex items-center gap-2">
            <Text size={'heading2'} weight={'bold'}>
              일지
            </Text>
            <Text size={'body2'} weight={'regular'} className="text-gray-500">
              더보기+
            </Text>
          </div>
          <Spacing className="h-4" />
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="shrink-0 w-[240px]">
                  <DiaryCard
                    percent={0}
                    likes={0}
                    title={'테스트'}
                    user={'고라니'}
                    challengeLabel={'테스트'}
                    challengeUrl={''}
                    date={'2025.06.10'}
                    emotion={'happy'}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <Spacing className="h-8" />

          {/* 참여자 목록 */}
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center gap-2">
              <Text size={'heading2'} weight={'bold'}>
                참여자 목록
              </Text>
              <Text size={'body2'} weight={'regular'} className="text-gray-500">
                더보기+
              </Text>
            </div>
            <Tag weight="medium" className="font-pretendard w-fit bg-black">
              <div className="flex">
                <Image
                  src={'/images/user-white.png'}
                  width={12}
                  height={12}
                  alt="icon-user"
                  className="mr-2"
                />
                10 /12
              </div>
            </Tag>
          </div>

          <Spacing className="h-4" />
          <div className="grid w-full grid-cols-2 gap-3">
            {[...Array(9)].map((_, i) => (
              <UserListItem key={i} userName={'고라니'} isAuthor={isAuthor} />
            ))}
          </div>

          <Spacing className="h-8" />

          {/* 참여 신청 버튼 */}
          {!isAuthor && (
            <div className="sticky bottom-0 z-10 bg-white py-4">
              <Button className="w-full">챌린지 참여 신청</Button>
            </div>
          )}

          <div className="flex w-full justify-center">
            <PageWatermark />
          </div>
          <Spacing className="h-8" />
        </div>
      </div>
    </div>
  );
}
