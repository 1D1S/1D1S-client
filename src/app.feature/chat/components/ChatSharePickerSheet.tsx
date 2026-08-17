'use client';

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetTitle,
  Text,
} from '@1d1s/design-system';
import { useMyDiariesInfinite } from '@feature/diary/board/hooks/useDiaryQueries';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { cn } from '@module/utils/cn';
import React from 'react';

import { ChatShareResolution } from '../type/chat';
import { ChatRoomThumbnail } from './ChatRoomThumbnail';

/**
 * 공유할 대상 고르기.
 *
 * ponytail: 챌린지는 **내가 참여 중인 것**만 고른다 — 사이드바 응답이 이미
 * 그 목록을 싣고 있어 추가 요청이 없다. 앱에는 전체 챌린지 검색 탭도 있지만,
 * 웹에서는 챌린지 링크를 그대로 붙여넣으면 서버 판정(/chat/shares/resolve)이
 * 같은 카드를 만들어 주므로 임의 챌린지도 보낼 수 있다. 검색 탭이 실제로
 * 아쉬워지면 그때 붙인다.
 */
function PickerRow({
  title,
  subtitle,
  thumbnailUrl,
  category,
  kind,
  onSelect,
}: {
  title: string;
  subtitle?: string;
  thumbnailUrl?: string | null;
  category?: string | null;
  kind: 'challenge' | 'diary';
  onSelect(): void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-1 py-2.5 text-left',
        'transition-colors hover:bg-gray-50'
      )}
    >
      <ChatRoomThumbnail
        url={thumbnailUrl}
        category={category}
        fallback={kind === 'diary' ? 'diary' : 'challenge'}
        className="h-10 w-[60px]"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Text size="caption1" weight="bold" className="truncate text-gray-900">
          {title}
        </Text>
        {subtitle ? (
          <Text size="caption3" className="truncate text-gray-500">
            {subtitle}
          </Text>
        ) : null}
      </div>
    </button>
  );
}

interface ChatSharePickerSheetProps {
  kind: 'challenge' | 'diary' | null;
  onOpenChange(open: boolean): void;
  onSelect(share: ChatShareResolution): void;
}

export function ChatSharePickerSheet({
  kind,
  onOpenChange,
  onSelect,
}: ChatSharePickerSheetProps): React.ReactElement {
  const { data: sidebar } = useSidebar();
  const { data: diaryPages, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useMyDiariesInfinite(20);

  const challenges = sidebar?.challengeList ?? [];
  const diaries = diaryPages?.pages.flatMap((page) => page.items) ?? [];
  const isChallenge = kind === 'challenge';
  const empty = isChallenge ? challenges.length === 0 : diaries.length === 0;

  const choose = (
    type: 'CHALLENGE_SHARE' | 'DIARY_SHARE',
    targetId: number,
    title: string,
    thumbnailUrl?: string | null,
    category?: string | null
  ): void => {
    onOpenChange(false);
    onSelect({
      shareable: true,
      type,
      targetId,
      share: {
        targetId,
        title,
        subtitle: null,
        thumbnailUrl: thumbnailUrl ?? null,
        category: category ?? null,
        available: true,
      },
    });
  };

  return (
    <BottomSheet open={Boolean(kind)} onOpenChange={onOpenChange}>
      <BottomSheetContent className="px-5 pb-3">
        <BottomSheetTitle>
          <Text size="body1" weight="bold" className="text-gray-900">
            {isChallenge ? '챌린지 공유' : '일지 공유'}
          </Text>
        </BottomSheetTitle>
        <div className="max-h-[55vh] overflow-y-auto pt-2">
          {empty ? (
            <div className="py-12 text-center">
              <Text size="body2" className="text-gray-500">
                {isChallenge
                  ? '참여 중인 챌린지가 없어요.'
                  : '작성한 일지가 없어요.'}
              </Text>
            </div>
          ) : isChallenge ? (
            challenges.map((challenge) => (
              <PickerRow
                key={challenge.challengeId}
                kind="challenge"
                title={challenge.title}
                thumbnailUrl={challenge.thumbnailImage}
                category={challenge.category}
                onSelect={() =>
                  choose(
                    'CHALLENGE_SHARE',
                    challenge.challengeId,
                    challenge.title,
                    challenge.thumbnailImage,
                    challenge.category
                  )
                }
              />
            ))
          ) : (
            <>
              {diaries.map((diary) => (
                <PickerRow
                  key={diary.id}
                  kind="diary"
                  title={diary.title}
                  subtitle={diary.challenge?.title}
                  thumbnailUrl={diary.thumbnailUrl}
                  onSelect={() =>
                    choose(
                      'DIARY_SHARE',
                      diary.id,
                      diary.title,
                      diary.thumbnailUrl
                    )
                  }
                />
              ))}
              {hasNextPage ? (
                <button
                  type="button"
                  disabled={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                  className="w-full py-3 text-gray-500"
                >
                  <Text size="caption2" className="text-inherit">
                    {isFetchingNextPage ? '불러오는 중…' : '더 보기'}
                  </Text>
                </button>
              ) : null}
            </>
          )}
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
