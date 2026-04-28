'use client';

import { Text } from '@1d1s/design-system';
import { useMyPage } from '@feature/member/hooks/useMemberQueries';
import { cn } from '@module/utils/cn';
import {
  PencilLine,
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { MyPageChallengeSection } from '../components/MyPageChallengeSection';
import { MyPageDiarySection } from '../components/MyPageDiarySection';
import { MyPageProfileCard } from '../components/MyPageProfileCard';
import { MyPageStatSection } from '../components/MyPageStatSection';
import { MyPageStreakSection } from '../components/MyPageStreakSection';
import { QuickActionItem } from '../components/QuickActionItem';

export default function MyPageScreen(): React.ReactElement {
  const router = useRouter();
  const { data, isLoading } = useMyPage();

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Text size="body1" weight="medium" className="text-gray-500">
          불러오는 중...
        </Text>
      </div>
    );
  }

  const { nickname, profileUrl, streak, challengeList } = data;

  return (
    <div className="min-h-screen w-full bg-white p-4">
      <div
        className={cn(
          'mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4',
          'xl:grid-cols-[minmax(0,1fr)_320px]',
        )}
      >
        <aside className="space-y-4 xl:order-last">
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1"
          >
            <MyPageProfileCard
              nickname={nickname}
              profileUrl={profileUrl}
            />

            <section
              className="rounded-4 border border-gray-200 bg-white p-5"
            >
              <Text
                size="body1"
                weight="medium"
                className="text-gray-600"
              >
                빠른 실행
              </Text>
              <div className="mt-4 space-y-2">
                <QuickActionItem
                  icon={<PencilLine className="h-5 w-5" />}
                  title="일지 작성하기"
                  onClick={() => router.push('/diary/create')}
                />
                <QuickActionItem
                  icon={<Plus className="h-5 w-5" />}
                  title="챌린지 만들기"
                  onClick={() => router.push('/challenge/create')}
                  tone="blue"
                />
              </div>
            </section>
          </div>
        </aside>

        <main className="space-y-4 xl:order-first">
          <MyPageStatSection streak={streak} />
          <MyPageStreakSection calendar={streak.calendar} />
          <MyPageChallengeSection challengeList={challengeList} />
          <MyPageDiarySection
            nickname={nickname}
            profileUrl={profileUrl}
          />
        </main>
      </div>
    </div>
  );
}
