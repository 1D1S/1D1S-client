'use client';

import { Text } from '@1d1s/design-system';
import { useMyDiaries } from '@feature/diary/board/hooks/useDiaryQueries';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/useDiaryMutations';
import { DiaryCard } from '@feature/diary/shared/components/DiaryCard';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { cn } from '@module/utils/cn';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { buildDiaryCardViewModels } from '../utils/mypageUtils';

interface MyPageDiarySectionProps {
  nickname: string;
  profileUrl: string;
}

export function MyPageDiarySection({
  nickname,
  profileUrl,
}: MyPageDiarySectionProps): React.ReactElement {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const { data: myDiariesData } = useMyDiaries(10);
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();

  const myDiaries = myDiariesData?.items ?? [];
  const hasMoreDiaries = myDiariesData?.pageInfo.hasNextPage ?? false;
  const diaryCards = buildDiaryCardViewModels(myDiaries, nickname, profileUrl);

  const handleLikeToggle = (id: number, isLiked: boolean): void => {
    if (!isLoggedIn || likeDiary.isPending || unlikeDiary.isPending) {
      return;
    }
    if (isLiked) {
      unlikeDiary.mutate(id);
    } else {
      likeDiary.mutate(id);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <Text size="display2" weight="bold" className="text-gray-900">
          내 일지
        </Text>
        {hasMoreDiaries && (
          <Link
            href="/mypage/diary"
            className="text-main-800 text-sm font-semibold hover:underline"
          >
            전체 보기
          </Link>
        )}
      </div>

      {diaryCards.length === 0 ? (
        <div
          className={cn(
            'rounded-3 mt-4 border border-gray-200 p-6 text-center',
          )}
        >
          <Text size="body1" weight="medium" className="text-gray-500">
            작성한 일지가 없습니다.
          </Text>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <div className="flex w-max gap-3 py-2">
            {diaryCards.map((diary) => (
              <div key={diary.id} className="w-[240px] shrink-0">
                <DiaryCard
                  imageUrl={diary.imageUrl}
                  percent={diary.percent}
                  isLiked={diary.isLiked}
                  likes={diary.likes}
                  title={diary.title}
                  user={diary.user}
                  userImage={diary.userImage}
                  challengeLabel={diary.challengeLabel}
                  onChallengeClick={() =>
                    router.push(
                      diary.challengeId
                        ? `/challenge/${diary.challengeId}`
                        : '/challenge'
                    )
                  }
                  date={diary.date}
                  emotion={diary.emotion}
                  commentCount={diary.commentCount}
                  onLikeToggle={() =>
                    handleLikeToggle(diary.id, diary.isLiked)
                  }
                  onClick={() => router.push(`/diary/${diary.id}`)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
