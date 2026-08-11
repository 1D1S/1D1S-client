'use client';

import { useNativeVoteFab } from '@module/hooks/useNativeVoteFab';
import { cn } from '@module/utils/cn';
import { onNativeVoteSheetClosed } from '@module/utils/nativeBridge';
import { useQueryClient } from '@tanstack/react-query';
import { Vote } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { VOTE_QUERY_KEYS } from '../consts/queryKeys';
import { useTodayVotes } from '../hooks/useVoteQueries';
import { VoteContent } from './VoteContent';

interface VoteFloatingWidgetProps {
  enabled: boolean;
  hasBottomNav: boolean;
  /** 데스크탑 우측 레일(280px)이 있는 라우트인지 — 데스크탑 위치 계산용 */
  hasRightRail: boolean;
  /** 네이티브가 시트를 그리는 환경(vote_sheet) — 웹 FAB·패널을 모두 숨긴다. */
  nativeSheet?: boolean;
}

function VoteFab({
  remaining,
  onClick,
}: {
  /** 아직 참여하지 않은 투표 수 — 2건 이상이면 점 대신 숫자를 보여준다. */
  remaining: number;
  onClick(): void;
}): React.ReactElement {
  return (
    <button
      type="button"
      aria-label="오늘의 투표 열기"
      onClick={onClick}
      className={cn(
        'bg-main-800 relative flex h-14 w-14 items-center justify-center',
        'animate-in fade-in zoom-in-95 rounded-full text-white shadow-xl',
        'transition hover:-translate-y-0.5 hover:brightness-105'
      )}
    >
      <Vote className="h-6 w-6" aria-hidden />
      {/* 배지는 미참여가 남아 있을 때만. 다 응답해도 버튼은 유지되는데
          빨간 점까지 남으면 "안 본 게 있다"는 오신호가 된다. */}
      {remaining > 0 ? (
        <span
          aria-hidden
          className={cn(
            'absolute -top-0.5 -right-0.5 flex items-center justify-center',
            'rounded-full border-2 border-white bg-red-500',
            remaining > 1
              ? 'h-5 min-w-5 px-1 text-[11px] leading-none font-bold'
              : 'h-3 w-3'
          )}
        >
          {remaining > 1 ? remaining : null}
        </span>
      ) : null}
    </button>
  );
}

/**
 * 투표 플로팅 위젯 — 컨테이너(위치·카드 chrome·FAB)만 담당한다.
 * 목록/상세/투표/재투표 콘텐츠는 VoteContent 가 소유하며, 네이티브 시트
 * 라우트(/vote?sheet=1)도 같은 콘텐츠를 chrome 없이 재사용한다.
 */
export default function VoteFloatingWidget({
  enabled,
  hasBottomNav,
  hasRightRail,
  nativeSheet = false,
}: VoteFloatingWidgetProps): React.ReactElement | null {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const queryClient = useQueryClient();

  // VoteContent 와 같은 쿼리 키라 요청은 한 번만 나간다(캐시 공유).
  // vote_sheet 쉘에서도 계속 조회한다 — 앱이 FAB·뱃지를 그리려면 웹이
  // 보내는 visible/count 가 있어야 한다(웹은 렌더만 하지 않는다).
  const { data: votes = [] } = useTodayVotes(enabled);
  const remaining = votes.filter((vote) => !vote.voted).length;

  // 네이티브 쉘이 vote_fab 을 announce 했으면 앱이 고정 버튼을 그리고 웹
  // FAB 는 숨긴다(패널은 그대로 웹이 소유). 구버전 쉘·브라우저는 false 라
  // 기존 웹 FAB 가 유지된다. 훅이므로 early return 위에서 호출한다.
  const isNativeFab = useNativeVoteFab({
    visible: enabled && votes.length > 0,
    count: remaining,
    onTap: () => setIsMobileOpen(true),
  });

  // 네이티브 시트가 닫히면 그 안에서 응답했을 수 있다. 배경에 남아 있던
  // 이 화면이 미참여 수를 다시 계산해 FAB 뱃지를 동기화한다.
  useEffect(
    () =>
      onNativeVoteSheetClosed(() => {
        void queryClient.invalidateQueries({
          queryKey: VOTE_QUERY_KEYS.today(),
        });
      }),
    [queryClient]
  );

  // vote_sheet 를 지원하는 쉘은 FAB·패널을 앱이 통째로 그린다(웹은 /vote
  // 라우트만 제공). 진행 중인 투표가 하나도 없으면 띄울 것이 없다.
  if (!enabled || nativeSheet || votes.length === 0) {
    return null;
  }

  return (
    <>
      {/* 데스크탑: 우측 레일(280px) 위에 겹치면 레일 하단의 "일지 쓰기"
          CTA 를 가린다. 레일이 있는 라우트에서는 레일 폭만큼 밀어 컨텐츠
          영역 안쪽 우하단에 붙인다. (모바일 배치는 건드리지 않는다) */}
      <div
        className={cn(
          'fixed bottom-6 z-40 hidden lg:block',
          hasRightRail ? 'lg:right-[304px]' : 'lg:right-6'
        )}
      >
        {isDesktopOpen ? (
          <VoteContent
            enabled={enabled}
            onClose={() => setIsDesktopOpen(false)}
          />
        ) : isNativeFab ? null : (
          <VoteFab
            remaining={remaining}
            onClick={() => setIsDesktopOpen(true)}
          />
        )}
      </div>
      <div
        className={cn(
          'fixed right-5 z-40 lg:hidden',
          hasBottomNav
            ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))]'
            : 'bottom-[calc(1.25rem+env(safe-area-inset-bottom))]'
        )}
      >
        {isMobileOpen ? (
          <VoteContent
            enabled={enabled}
            onClose={() => setIsMobileOpen(false)}
          />
        ) : isNativeFab ? null : (
          <VoteFab
            remaining={remaining}
            onClick={() => setIsMobileOpen(true)}
          />
        )}
      </div>
    </>
  );
}
