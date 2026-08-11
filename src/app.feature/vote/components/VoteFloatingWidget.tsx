'use client';

import { useNativeVoteFab } from '@module/hooks/useNativeVoteFab';
import { cn } from '@module/utils/cn';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Vote } from 'lucide-react';
import React, { useState } from 'react';

import { useTodayVotes } from '../hooks/useVoteQueries';
import { VoteContent } from './VoteContent';

interface VoteFloatingWidgetProps {
  enabled: boolean;
  hasBottomNav: boolean;
  /** 데스크탑 우측 레일(280px)이 있는 라우트인지 — 데스크탑 위치 계산용 */
  hasRightRail: boolean;
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
 * 투표 플로팅 위젯 — 우하단 카드와 그 트리거 FAB.
 *
 * 카드는 딤 배경 위에 뜨는 모달이다. 예전엔 FAB 자리에 카드를 그대로
 * 끼워 넣어 배경이 안 어두워지고 바깥을 눌러도 닫히지 않았다. Radix
 * Dialog 로 감싸 딤·바깥탭·ESC·포커스 트랩·열림/닫힘 애니메이션을 얻되,
 * **위치와 디자인은 기존 우하단 카드 그대로** 유지한다(바텀시트 아님).
 */
export default function VoteFloatingWidget({
  enabled,
  hasBottomNav,
  hasRightRail,
}: VoteFloatingWidgetProps): React.ReactElement | null {
  const [isOpen, setIsOpen] = useState(false);

  const { data: votes = [] } = useTodayVotes(enabled);
  const remaining = votes.filter((vote) => !vote.voted).length;

  // 네이티브 쉘이 vote_fab 을 announce 했으면 버튼은 앱이 그리고, 탭이 오면
  // 웹이 이 카드를 연다(카드는 계속 웹 소유). 구버전 쉘·브라우저는 false 라
  // 웹 FAB 가 그대로 유지된다. 훅이라 early return 위에서 호출한다.
  const isNativeFab = useNativeVoteFab({
    visible: enabled && votes.length > 0,
    count: remaining,
    onTap: () => setIsOpen(true),
  });

  // 진행 중인 투표가 하나라도 있으면 계속 노출한다. 예전엔 미참여가 0 이면
  // 버튼째 사라져서, 참여 기간인데도 결과를 다시 볼 방법이 없었다.
  if (!enabled || votes.length === 0) {
    return null;
  }

  // FAB 와 카드가 같은 자리를 쓴다. 데스크탑은 우측 레일(280px)을 피해
  // 컨텐츠 영역 안쪽에 붙인다 — 레일 하단 "일지 쓰기" CTA 를 가리지 않게.
  const anchorClass = cn(
    'right-5',
    hasBottomNav
      ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))]'
      : 'bottom-[calc(1.25rem+env(safe-area-inset-bottom))]',
    'lg:bottom-6',
    hasRightRail ? 'lg:right-[304px]' : 'lg:right-6'
  );

  return (
    <>
      {!isOpen && !isNativeFab ? (
        <div className={cn('fixed z-40', anchorClass)}>
          <VoteFab remaining={remaining} onClick={() => setIsOpen(true)} />
        </div>
      ) : null}

      <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className={cn(
              'fixed inset-0 z-40 bg-black/40',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
              'duration-200'
            )}
          />
          <DialogPrimitive.Content
            // 설명 문구는 카드 본문이 대신한다. 지정하지 않으면 Radix 가
            // 콘솔 경고를 남긴다.
            aria-describedby={undefined}
            className={cn(
              'fixed z-50',
              anchorClass,
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
              'data-[state=open]:slide-in-from-bottom-4',
              'data-[state=closed]:slide-out-to-bottom-4',
              'duration-200'
            )}
          >
            <DialogPrimitive.Title className="sr-only">
              오늘의 투표
            </DialogPrimitive.Title>
            <VoteContent enabled={enabled} onClose={() => setIsOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
