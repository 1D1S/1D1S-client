'use client';

import { Button } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Vote,
  X,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { useSubmitVote } from '../hooks/useVoteMutations';
import { useTodayVotes, useVoteDetail } from '../hooks/useVoteQueries';
import type {
  VoteDetail,
  VoteOption,
  VoteSelectionType,
  VoteSummary,
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
  /** 투표가 2건 이상일 때만 — 목록으로 돌아가는 핸들러 */
  onBack?(): void;
}

// 플로팅 카드 공통 골격. 목록/상세 두 단계가 같은 크기·모서리·스크롤 규칙을
// 공유해야 단계 전환에서 카드가 튀지 않는다.
const PANEL_CLASS = cn(
  'animate-in fade-in zoom-in-95 w-[min(360px,calc(100vw-40px))]',
  'max-h-[min(580px,calc(100vh-120px))] overflow-y-auto',
  // radius 스케일은 --radius-0~4 까지만 정의돼 있다. rounded-5 는
  // 유틸이 생성되지 않아 각진 카드로 보였다.
  'rounded-4 border border-gray-200 bg-white p-5 shadow-2xl',
  'duration-200'
);

function PanelCloseButton({
  onClick,
}: {
  onClick(): void;
}): React.ReactElement {
  return (
    <button
      type="button"
      aria-label="투표 팝업 접기"
      onClick={onClick}
      className={cn(
        '-mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center',
        'rounded-full text-gray-500 transition hover:bg-gray-100'
      )}
    >
      <X className="h-4 w-4" />
    </button>
  );
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
        isSelected ? 'border-main-700 bg-main-200' : 'border-gray-200 bg-white',
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
  onBack,
}: VotePanelProps): React.ReactElement {
  const hasSelection = selectedOptionIds.length > 0;
  const selectionGuide =
    vote?.selectionType === 'MULTIPLE'
      ? '원하는 항목을 모두 선택해 주세요.'
      : '하나의 항목을 선택해 주세요.';

  return (
    <section aria-label="오늘의 투표" className={PANEL_CLASS}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className={cn(
                'text-main-800 mb-2 -ml-1 flex items-center gap-1',
                'rounded px-1 py-0.5 text-xs font-extrabold',
                'transition hover:bg-gray-100'
              )}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              투표 목록
            </button>
          ) : (
            <div
              className={cn(
                'text-main-800 mb-2 flex items-center gap-1.5',
                'text-xs font-extrabold'
              )}
            >
              <Vote className="h-4 w-4" aria-hidden />
              오늘의 투표
            </div>
          )}
          <h2 className="text-lg leading-snug font-extrabold text-gray-900">
            {isLoading ? '투표를 불러오고 있어요' : vote?.title}
          </h2>
        </div>
        <PanelCloseButton onClick={onClose} />
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
            {isSubmitted ? '확인' : isSubmitting ? '투표 중...' : '투표하기'}
          </Button>
        </>
      ) : null}
    </section>
  );
}

interface VoteListPanelProps {
  votes: VoteSummary[];
  onSelect(voteId: number): void;
  onClose(): void;
}

/**
 * 투표가 2건 이상일 때의 첫 단계. 진행 중인 투표를 전부 한 줄씩 보여준다.
 *
 * 패널을 투표 수만큼 쌓거나 캐러셀로 돌리는 대신 목록을 고른 이유:
 * 스택은 3건만 돼도 화면을 덮고, 캐러셀은 몇 건이 남았는지 한눈에 안 보인다.
 * 목록은 카드 크기가 고정이고(넘치면 카드 안에서 스크롤) 미참여 건수를
 * 헤더에 그대로 드러낸다.
 */
function VoteListPanel({
  votes,
  onSelect,
  onClose,
}: VoteListPanelProps): React.ReactElement {
  const remaining = votes.filter((vote) => !vote.voted).length;

  return (
    <section aria-label="오늘의 투표 목록" className={PANEL_CLASS}>
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
            {remaining > 0
              ? `참여할 투표가 ${remaining}개 있어요`
              : '모든 투표에 참여했어요'}
          </h2>
        </div>
        <PanelCloseButton onClick={onClose} />
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {votes.map((vote) => (
          <li key={vote.id}>
            <button
              type="button"
              onClick={() => onSelect(vote.id)}
              className={cn(
                'flex min-h-12 w-full items-center gap-3 text-left',
                'rounded-3 border border-gray-200 bg-white px-3.5 py-3',
                'hover:border-main-500 transition'
              )}
            >
              <span className="min-w-0 flex-1 text-sm font-semibold">
                {vote.title}
              </span>
              {vote.voted ? (
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1 rounded-full',
                    'bg-gray-100 px-2 py-0.5 text-[11px] font-bold',
                    'text-gray-600'
                  )}
                >
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  참여 완료
                </span>
              ) : null}
              <ChevronRight
                className="h-4 w-4 shrink-0 text-gray-400"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
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
  // 2건 이상일 때 목록에서 고른 투표. null 이면 목록 단계.
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);

  // 서버가 노출 대상(audience) 필터를 로그인 회원 기준으로 이미 적용해
  // 내려주므로, 받은 배열을 그대로 전부 노출한다. 예전엔 여기서
  // `.find(!voted)` 로 1건만 남겨 나머지 투표가 아예 보이지 않았다.
  const { data: votes = [] } = useTodayVotes(enabled);
  const hasMultiple = votes.length > 1;

  // 1건이면 목록 단계를 건너뛰고 바로 상세를 연다(기존 UX 유지).
  // 2건 이상이면 목록에서 고르기 전까지 voteId 가 없다.
  const voteId = hasMultiple ? selectedVoteId : (votes[0]?.id ?? null);
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
    // 제출 결과도 함께 버린다 — 안 그러면 A 를 제출하고 목록으로 돌아가
    // B 를 열었을 때 A 의 결과(선택지·비율)가 B 자리에 그대로 남는다.
    setSubmittedVote(null);
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

  // 카드를 접을 때는 진행 상태를 초기화해, 다시 열었을 때 목록(2건 이상)
  // 또는 깨끗한 상세(1건)에서 시작하게 한다.
  const resetPanelState = useCallback((): void => {
    setSelectedVoteId(null);
    setSubmittedVote(null);
    setSelectedOptionIds([]);
  }, []);

  const handleDesktopClose = useCallback((): void => {
    setIsDesktopOpen(false);
    resetPanelState();
  }, [resetPanelState]);

  const handleMobileClose = useCallback((): void => {
    setIsMobileOpen(false);
    resetPanelState();
  }, [resetPanelState]);

  const remaining = votes.filter((vote) => !vote.voted).length;
  // 참여할 투표가 남아 있을 때만 띄운다. 방금 제출한 결과를 보고 있는
  // 동안(submittedVote)은 마지막 1건을 끝냈어도 카드를 닫지 않는다.
  if (!enabled || (remaining === 0 && submittedVote === null)) {
    return null;
  }

  // 2건 이상이고 아직 고르지 않았으면 목록 단계.
  const showList = hasMultiple && voteId === null;

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
    onBack: hasMultiple ? () => setSelectedVoteId(null) : undefined,
  };

  const renderPanel = (onClose: () => void): React.ReactElement =>
    showList ? (
      <VoteListPanel
        votes={votes}
        onSelect={setSelectedVoteId}
        onClose={onClose}
      />
    ) : (
      <VotePanel {...panelProps} onClose={onClose} />
    );

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
          renderPanel(handleDesktopClose)
        ) : (
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
          renderPanel(handleMobileClose)
        ) : (
          <VoteFab
            remaining={remaining}
            onClick={() => setIsMobileOpen(true)}
          />
        )}
      </div>
    </>
  );
}
