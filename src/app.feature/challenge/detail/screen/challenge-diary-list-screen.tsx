'use client';

import { DiaryCard, Text } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/login-required-dialog';
import { getCategoryLabel } from '@constants/categories';
import { Feeling } from '@feature/diary/board/type/diary';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/use-diary-mutations';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diary-image-url';
import { normalizeApiError } from '@module/api/error';
import { authStorage } from '@module/utils/auth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { useChallengeDiaryList } from '../hooks/use-challenge-diary-queries';
import { ChallengeDiaryItem } from '../type/challenge-diary';

type DiaryEmotion = 'happy' | 'soso' | 'sad';

interface ChallengeDiaryListScreenProps {
  id: string;
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat('ko', {
  numeric: 'auto',
});

function mapFeelingToEmotion(feeling: Feeling): DiaryEmotion {
  switch (feeling) {
    case 'HAPPY':
      return 'happy';
    case 'SAD':
      return 'sad';
    case 'NORMAL':
    case 'NONE':
    default:
      return 'soso';
  }
}

function toRelativeDateLabel(createdAt: string): string {
  if (!createdAt) {
    return '방금 전';
  }

  const targetDate = new Date(createdAt);
  if (Number.isNaN(targetDate.getTime())) {
    return '방금 전';
  }

  const diffMinutes = Math.round((targetDate.getTime() - Date.now()) / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 60) {
    return relativeTimeFormatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return relativeTimeFormatter.format(diffDays, 'day');
}

export function ChallengeDiaryListScreen({
  id,
}: ChallengeDiaryListScreenProps): React.ReactElement {
  const challengeId = Number(id);
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();
  const {
    data: diaries,
    isLoading,
    isError,
    error,
  } = useChallengeDiaryList(challengeId);

  const hasDiaries = Boolean(diaries && diaries.length > 0);
  const isLikePending = likeDiary.isPending || unlikeDiary.isPending;

  const handleLikeToggle = (diary: ChallengeDiaryItem): void => {
    if (!authStorage.hasTokens()) {
      setShowLoginDialog(true);
      return;
    }

    if (isLikePending) {
      return;
    }
    if (diary.likeInfo.likedByMe) {
      unlikeDiary.mutate(diary.id);
    } else {
      likeDiary.mutate(diary.id);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
      <section className="rounded-3 w-full bg-white p-2">
        <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <Link
              href={`/challenge/${id}`}
              className="inline-flex w-fit items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              챌린지 상세로
            </Link>
            <Text size="display1" weight="bold" className="text-gray-900">
              챌린지 일지
            </Text>
            <Text size="body1" weight="regular" className="text-gray-600">
              챌린지 참여자가 작성한 일지 목록입니다.
            </Text>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              일지를 불러오는 중입니다.
            </Text>
          </div>
        ) : null}

        {isError ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-red-600">
              {error
                ? normalizeApiError(error).message
                : '일지를 불러오지 못했습니다.'}
            </Text>
          </div>
        ) : null}

        {!isLoading && !isError && hasDiaries ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {diaries!.map((diary) => (
              <DiaryCard
                key={diary.id}
                imageUrl={
                  resolveDiaryImageUrl(diary.imgUrl?.[0]) ||
                  '/images/default-card.png'
                }
                percent={Math.min(
                  100,
                  Math.max(0, diary.diaryInfo?.achievementRate ?? 0)
                )}
                isLiked={diary.likeInfo.likedByMe}
                likes={diary.likeInfo.likeCnt}
                title={diary.title}
                user={diary.author?.nickname ?? '익명'}
                userImage={
                  resolveDiaryImageUrl(diary.author?.profileImage) ||
                  '/images/default-profile.png'
                }
                challengeLabel={
                  diary.challenge?.title ||
                  getCategoryLabel(diary.challenge?.category) ||
                  '챌린지'
                }
                onChallengeClick={() => {
                  const targetChallengeId =
                    diary.challenge?.challengeId ?? challengeId;
                  if (targetChallengeId > 0) {
                    router.push(`/challenge/${targetChallengeId}`);
                  }
                }}
                date={toRelativeDateLabel(
                  diary.diaryInfo?.challengedDate ??
                    diary.diaryInfo?.createdAt ??
                    ''
                )}
                emotion={mapFeelingToEmotion(
                  diary.diaryInfo?.feeling ?? 'NONE'
                )}
                onLikeToggle={() => handleLikeToggle(diary)}
                onClick={() => router.push(`/diary/${diary.id}`)}
              />
            ))}
          </div>
        ) : null}

        {!isLoading && !isError && !hasDiaries ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              아직 등록된 일지가 없습니다.
            </Text>
          </div>
        ) : null}
      </section>
    </div>
  );
}
