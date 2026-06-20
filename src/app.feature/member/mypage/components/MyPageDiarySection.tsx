'use client';

import { Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import EmptyState from '@component/EmptyState';
import type { DiaryItem } from '@feature/diary/board/type/diary';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/useDiaryMutations';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { cn } from '@module/utils/cn';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

import { buildDiaryCardViewModels } from '../utils/mypageUtils';

interface MyPageDiarySectionProps {
  title: string;
  diaries: DiaryItem[];
  nickname: string;
  hasMore: boolean;
  viewAllHref: string;
  emptyMessage?: string;
  action?: React.ReactNode;
}

export function MyPageDiarySection({
  title,
  diaries,
  nickname,
  hasMore,
  viewAllHref,
  emptyMessage = '작성한 일지가 없습니다.',
  action,
}: MyPageDiarySectionProps): React.ReactElement {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();

  const diaryCards = useMemo(
    () => buildDiaryCardViewModels(diaries, nickname),
    [diaries, nickname]
  );

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
          {title}
        </Text>
        {hasMore && (
          <Link
            href={viewAllHref}
            className="text-main-800 text-sm font-semibold hover:underline"
          >
            전체 보기
          </Link>
        )}
      </div>

      {diaryCards.length === 0 ? (
        <EmptyState
          variant="diary"
          bordered
          title={emptyMessage}
          className="mt-4"
          action={action}
        />
      ) : (
        <div
          className={cn(
            '-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 py-2',
            'scrollbar-hide'
          )}
        >
          {diaryCards.map((diary) => (
            <div key={diary.id} className="w-[240px] shrink-0">
              <DiaryCard
                imageUrl={diary.imageUrl}
                profileImageUrl={diary.profileImageUrl}
                percent={diary.percent}
                isLiked={diary.isLiked}
                likes={diary.likes}
                title={diary.title}
                user={diary.user}
                challengeLabel={diary.challengeLabel}
                emotion={diary.emotion}
                onLikeToggle={() => handleLikeToggle(diary.id, diary.isLiked)}
                onClick={() => router.push(`/diary/${diary.id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
