'use client';

import { Button } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Check, RotateCcw, Vote, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { useSubmitVote } from '../hooks/useVoteMutations';
import {
  useTodayVotes,
  useVoteDetail,
} from '../hooks/useVoteQueries';
import type {
  VoteDetail,
  VoteOption,
  VoteSelectionType,
} from '../type/vote';

interface VoteFloatingWidgetProps {
  enabled: boolean;
  hasBottomNav: boolean;
  /** 데스크탑 우측 레일(280px)이 있는 라우트인지 — 데스크탑 위치 계산용 */
  hasRightRail: boolean;
}

interface VotePanelProps {
  vote?: VoteDetail;
  isLoading: boolean;
  isError: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  selectedOptionIds: number[];
  onOptionClick(optionId: number): void;
  onSubmit(): void;
  onRetry(): void;
  onClose(): void;
}

interface VoteOptionButtonProps {
  option: VoteOption;
  selectionType: VoteSelectionType;
  isSelected: boolean;
  isSubmitted: boolean;
  onClick(): void;
}

function VoteOptionButton({
  option,
  selectionType,
  isSelected,
  isSubmitted,
  onClick,
}: VoteOptionButtonProps): React.ReactElement {
  const percentage =
    typeof option.percentage === 'number'
      ? Math.min(100, Math.max(0, option.percentage))
      : undefined;

  return (
    <button
      type="button"
      role={selectionType === 'SINGLE' ? 'radio' : 'checkbox'}
      aria-checked={isSelected}
      disabled={isSubmitted}
      onClick={onClick}
      className={cn(
        'relative flex min-h-12 w-full items-center gap-3 overflow-hidden',
        'rounded-3 border px-3.5 py-3 text-left transition',
        isSelected
          ? 'border-main-700 bg-main-200'
          : 'border-gray-200 bg-white',
        // 응답이 끝난 뒤에는 hover 반응을 없애 "아직 고를 수 있다" 는
        // 인상을 주지 않는다. disabled 여도 :hover 는 그대로 매칭된다.
        !isSubmitted && !isSelected && 'hover:border-main-500',
        isSubmitted && 'cursor-default'
      )}
    >
      {isSubmitted && percentage !== undefined ? (
        <span
          aria-hidden
          className="bg-main-200 absolute inset-y-0 left-0"
          style={{ width: `${percentage}%` }}
        />
      ) : null}
      <span
        aria-hidden
        className={cn(
          'relative flex h-5 w-5 shrink-0 items-center justify-center',
          'border-2 transition',
          // rounded-1.5 는 정의된 radius 토큰이 아니라 각진 사각형이 됐다.
          selectionType === 'SINGLE' ? 'rounded-full' : 'rounded-1',
          isSelected
            ? 'border-main-800 bg-main-800 text-white'
            : 'border-gray-400 bg-white'
        )}
      >
        {isSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
      <span className="relative min-w-0 flex-1 text-sm font-semibold">
        {option.text}
      </span>
      {isSubmitted && percentage !== undefined ? (
        <span className="relative text-xs font-bold text-gray-700">
          {Math.round(percentage)}%
        </span>
      ) : null}
    </button>
  );
}

function VotePanel({
  vote,
  isLoading,
  isError,
  isSubmitting,
  isSubmitted,
  selectedOptionIds,
  onOptionClick,
  onSubmit,
  onRetry,
  onClose,
}: VotePanelProps): React.ReactElement {
  const hasSelection = selectedOptionIds.length > 0;
  const selectionGuide =
    vote?.selectionType === 'MULTIPLE'
      ? '원하는 항목을 모두 선택해 주세요.'
      : '하나의 항목을 선택해 주세요.';

  return (
    <section
      aria-label="오늘의 투표"
      className={cn(
        'animate-in fade-in zoom-in-95 w-[min(360px,calc(100vw-40px))]',
        'max-h-[min(580px,calc(100vh-120px))] overflow-y-auto',
        // radius 스케일은 --radius-0~4 까지만 정의돼 있다. rounded-5 는
        // 유틸이 생성되지 않아 각진 카드로 보였다.
        'rounded-4 border border-gray-200 bg-white p-5 shadow-2xl',
        'duration-200'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={cn(
              'text-main-800 mb-2 flex items-center gap-1.5',
              'text-xs font-extrabold'
            )}
          >
            <Vote className="h-4 w-4" aria-hidden />
            오늘의 투표
          </div>
          <h2 className="text-lg leading-snug font-extrabold text-gray-900">
            {isLoading ? '투표를 불러오고 있어요' : vote?.title}
          </h2>
        </div>
        <button
          type="button"
          aria-label="투표 팝업 접기"
          onClick={onClose}
          className={cn(
            '-mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center',
            'rounded-full text-gray-500 transition hover:bg-gray-100'
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="mt-5 flex flex-col gap-2.5" aria-busy="true">
          <div className="rounded-3 h-12 animate-pulse bg-gray-100" />
          <div className="rounded-3 h-12 animate-pulse bg-gray-100" />
          <div className="rounded-3 h-12 animate-pulse bg-gray-100" />
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-3 mt-5 bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">
            투표 내용을 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              'text-main-800 mt-2 inline-flex items-center gap-1',
              'text-xs font-bold'
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            다시 시도
          </button>
        </div>
      ) : null}

      {vote && !isError ? (
        <>
          <p className="mt-2 text-xs text-gray-500">
            {isSubmitted
              ? '소중한 의견을 남겨주셔서 감사해요.'
              : selectionGuide}
          </p>
          <div
            role={vote.selectionType === 'SINGLE' ? 'radiogroup' : 'group'}
            aria-label={vote.title}
            className="mt-4 flex flex-col gap-2.5"
          >
            {vote.options.map((option) => (
              <VoteOptionButton
                key={option.optionId}
                option={option}
                selectionType={vote.selectionType}
                isSelected={selectedOptionIds.includes(option.optionId)}
                isSubmitted={isSubmitted}
                onClick={() => onOptionClick(option.optionId)}
              />
            ))}
          </div>
          <Button
            type="button"
            size="lg"
            fullWidth
            disabled={!isSubmitted && (!hasSelection || isSubmitting)}
            onClick={isSubmitted ? onClose : onSubmit}
            className="mt-5"
          >
            {isSubmitted
              ? '확인'
              : isSubmitting
                ? '투표 중...'
                : '투표하기'}
          </Button>
        </>
      ) : null}
    </section>
  );
}

function VoteFab({
  onClick,
}: {
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
      <span
        aria-hidden
        className={cn(
          'absolute top-0.5 right-0.5 h-3 w-3 rounded-full',
          'border-2 border-white bg-red-500'
        )}
      />
    </button>
  );
}

export default function VoteFloatingWidget({
  enabled,
  hasBottomNav,
  hasRightRail,
}: VoteFloatingWidgetProps): React.ReactElement | null {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [submittedVote, setSubmittedVote] = useState<VoteDetail | null>(null);
  const [renderedVoteId, setRenderedVoteId] = useState<number | null>(null);

  const { data: todayVotes = [] } = useTodayVotes(enabled);
  const activeVote = todayVotes.find((vote) => !vote.voted);
  const voteId = submittedVote?.id ?? activeVote?.id ?? null;
  const {
    data: queriedVote,
    isPending: isDetailLoading,
    isError: isDetailError,
    refetch,
  } = useVoteDetail(voteId, enabled);
  const submitVote = useSubmitVote();
  const vote = submittedVote ?? queriedVote;

  // 이번 세션의 제출 여부(submittedVote)만 보면, 다른 기기·탭에서 이미
  // 응답했거나 today 목록 캐시(staleTime 5분 + localStorage 영속)가 낡아
  // voted:false 로 남아 있을 때 선택지가 계속 클릭 가능해 보인다.
  // 상세 응답의 voted 플래그를 함께 보고 확정 상태를 판정한다.
  const isAnswered = submittedVote !== null || vote?.voted === true;

  // 표시 중인 투표가 바뀌면 이전 투표의 선택을 반드시 버린다 — 안 그러면
  // 오늘 투표가 2건 이상일 때 앞 투표의 optionId 가 다음 투표로 넘어간다.
  // effect 가 아니라 렌더 중 조정으로 처리한다(추가 렌더 1회 없이 즉시 반영).
  if (voteId !== renderedVoteId) {
    setRenderedVoteId(voteId);
    setSelectedOptionIds([]);
  }

  const handleOptionClick = useCallback(
    (optionId: number): void => {
      if (!vote || isAnswered) {
        return;
      }
      setSelectedOptionIds((current) => {
        if (vote.selectionType === 'SINGLE') {
          return [optionId];
        }
        return current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
      });
    },
    [isAnswered, vote]
  );

  const handleSubmit = useCallback((): void => {
    if (!vote || isAnswered || selectedOptionIds.length === 0) {
      return;
    }
    submitVote.mutate(
      {
        voteId: vote.id,
        data: { optionIds: selectedOptionIds },
      },
      {
        onSuccess: (detail) => setSubmittedVote(detail),
      }
    );
  }, [isAnswered, selectedOptionIds, submitVote, vote]);

  const resetCompletedVote = useCallback((): void => {
    if (!submittedVote) {
      return;
    }
    setSubmittedVote(null);
    setSelectedOptionIds([]);
  }, [submittedVote]);

  const handleDesktopClose = useCallback((): void => {
    setIsDesktopOpen(false);
    resetCompletedVote();
  }, [resetCompletedVote]);

  const handleMobileClose = useCallback((): void => {
    setIsMobileOpen(false);
    resetCompletedVote();
  }, [resetCompletedVote]);

  if (!enabled || voteId === null) {
    return null;
  }

  const panelProps: VotePanelProps = {
    vote,
    isLoading: isDetailLoading,
    isError: isDetailError,
    isSubmitting: submitVote.isPending,
    isSubmitted: isAnswered,
    selectedOptionIds,
    onOptionClick: handleOptionClick,
    onSubmit: handleSubmit,
    onRetry: () => {
      void refetch();
    },
    onClose: handleDesktopClose,
  };

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
          <VotePanel {...panelProps} />
        ) : (
          <VoteFab onClick={() => setIsDesktopOpen(true)} />
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
          <VotePanel {...panelProps} onClose={handleMobileClose} />
        ) : (
          <VoteFab onClick={() => setIsMobileOpen(true)} />
        )}
      </div>
    </>
  );
}
