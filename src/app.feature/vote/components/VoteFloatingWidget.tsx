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
          : 'hover:border-main-500 border-gray-200 bg-white',
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
          selectionType === 'SINGLE' ? 'rounded-full' : 'rounded-1.5',
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
        'rounded-5 border border-gray-200 bg-white p-5 shadow-2xl',
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
}: VoteFloatingWidgetProps): React.ReactElement | null {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [submittedVote, setSubmittedVote] = useState<VoteDetail | null>(null);

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

  const handleOptionClick = useCallback(
    (optionId: number): void => {
      if (!vote || submittedVote) {
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
    [submittedVote, vote]
  );

  const handleSubmit = useCallback((): void => {
    if (!vote || selectedOptionIds.length === 0) {
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
  }, [selectedOptionIds, submitVote, vote]);

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
    isSubmitted: submittedVote !== null,
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
      <div className="fixed right-6 bottom-6 z-40 hidden lg:block">
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
