'use client';

import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  GoalAddList,
  Tag,
  Text,
  TextField,
} from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { getCategoryLabel } from '@constants/categories';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/useDiaryMutations';
import { DiaryCreateUnavailableDialog } from '@feature/diary/write/components/DiaryCreateUnavailableDialog';
import { normalizeApiError, notifyApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import { Check, CircleAlert, Trash2, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useIsLoggedIn } from '../../../member/hooks/useIsLoggedIn';
import {
  useChallengeCheckWriteDates,
  useChallengeDetail,
} from '../../board/hooks/useChallengeQueries';
import {
  ChallengeGoal,
  Participant,
  ParticipantStatus,
} from '../../board/type/challenge';
import { isChallengeOngoing } from '../../board/utils/challengePeriod';
import { ChallengeDetailHero } from '../components/ChallengeDetailHero';
import { ChallengeDiaryGrid } from '../components/ChallengeDiaryGrid';
import { ChallengeLeaderboardCard } from '../components/ChallengeLeaderboardCard';
import { ChallengeProgressCard } from '../components/ChallengeProgressCard';
import { ChallengeRulesCard } from '../components/ChallengeRulesCard';
import { ExpandableText } from '../components/ExpandableText';
import { useChallengeDiaryList } from '../hooks/useChallengeDiaryQueries';
import {
  useAcceptParticipant,
  useJoinChallenge,
  useLeaveChallenge,
  useLikeChallenge,
  useRejectParticipant,
  useUnlikeChallenge,
  useUpdateChallenge,
  useUpdateParticipantGoal,
} from '../hooks/useChallengeMutations';
import { ChallengeDiaryItem } from '../type/challengeDiary';
import {
  buildHeroGradient,
  getCategoryAccent,
} from '../utils/challengeAccent';

interface ChallengeDetailScreenProps {
  id: string;
}

const PARTICIPATING_STATUS: ParticipantStatus[] = [
  'HOST',
  'PARTICIPANT',
  'ACCEPTED',
];
const EMPTY_GOALS: ChallengeGoal[] = [];
const EMPTY_PARTICIPANTS: Participant[] = [];
const ENDLESS_MIN_YEAR = 2090;
const ENDLESS_LABEL = '무한!';

function getChallengeTypeLabel(goalType: string): string {
  return formatChallengeTypeLabel(goalType);
}

function isEndlessChallengeEndDate(endDate: string): boolean {
  if (!endDate) {
    return false;
  }

  const parsedEndDate = new Date(endDate);
  if (Number.isNaN(parsedEndDate.getTime())) {
    return false;
  }

  return parsedEndDate.getUTCFullYear() >= ENDLESS_MIN_YEAR;
}

function formatDateRange(startDate: string, endDate: string): string {
  const format = (date: string): string => date.replaceAll('-', '.');
  if (isEndlessChallengeEndDate(endDate)) {
    return `${format(startDate)} ~ ${ENDLESS_LABEL}`;
  }

  return `${format(startDate)} ~ ${format(endDate)}`;
}

function getDdayLabel(endDate: string): string {
  if (isEndlessChallengeEndDate(endDate)) {
    return ENDLESS_LABEL;
  }

  const today = new Date();
  const end = new Date(endDate);
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const dayDiff = Math.ceil((end.getTime() - today.getTime()) / 86400000);

  if (dayDiff > 0) {
    return `D-${dayDiff}`;
  }
  if (dayDiff === 0) {
    return 'D-DAY';
  }
  return `D+${Math.abs(dayDiff)}`;
}

function getRemainingLabel(endDate: string): string {
  const ddayLabel = getDdayLabel(endDate);
  if (ddayLabel === ENDLESS_LABEL) {
    return '마감 없음';
  }
  if (ddayLabel === 'D-DAY') {
    return '오늘 마감';
  }
  if (ddayLabel.startsWith('D-')) {
    return `${ddayLabel.slice(2)}일 남음`;
  }
  return '챌린지 종료';
}

function formatDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

function hasSelectableDiaryDate(disabledDateKeys: string[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset <= 2; dayOffset += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() - dayOffset);

    if (!disabledDateKeys.includes(formatDateKey(candidate))) {
      return true;
    }
  }

  return false;
}

function formatRelativeJoinedText(status: ParticipantStatus): string {
  switch (status) {
    case 'PENDING':
      return '참여 승인 대기 중';
    case 'REJECTED':
      return '신청 거절됨';
    default:
      return '참여 중';
  }
}

function PendingMemberItem({
  name,
  joinedAt,
  onAccept,
  onReject,
  isLoading,
}: {
  name: string;
  joinedAt: string;
  onAccept(): void;
  onReject(): void;
  isLoading: boolean;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-2 flex items-center justify-between',
        'border border-gray-200 bg-gray-100 px-3 py-2.5'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center',
            'rounded-full bg-gray-200 text-gray-500'
          )}
        >
          <UserRound className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <Text size="body2" weight="bold" className="text-gray-900">
            {name}
          </Text>
          <Text size="caption2" weight="regular" className="text-gray-500">
            {joinedAt}
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            'bg-main-200 text-main-800 flex h-8 w-8',
            'cursor-pointer items-center justify-center rounded-xl'
          )}
          aria-label="참여 승인"
          onClick={onAccept}
          disabled={isLoading}
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={cn(
            'flex h-8 w-8 cursor-pointer items-center justify-center',
            'rounded-xl bg-gray-200 text-gray-500'
          )}
          aria-label="참여 거절"
          onClick={onReject}
          disabled={isLoading}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ChallengeDetailScreen({
  id,
}: ChallengeDetailScreenProps): React.ReactElement {
  const challengeId = Number(id);
  const router = useRouter();

  const { data, isLoading, isError, error } = useChallengeDetail(challengeId);

  const joinChallenge = useJoinChallenge();
  const leaveChallenge = useLeaveChallenge();
  const likeChallenge = useLikeChallenge();
  const unlikeChallenge = useUnlikeChallenge();
  const acceptParticipant = useAcceptParticipant();
  const rejectParticipant = useRejectParticipant();
  const updateChallenge = useUpdateChallenge();
  const updateParticipantGoal = useUpdateParticipantGoal();
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();

  const isLoggedIn = useIsLoggedIn();
  const [dismissed, setDismissed] = useState(false);
  const showAuthDialog = !isLoggedIn && !dismissed;
  const [showDiaryLikeDialog, setShowDiaryLikeDialog] = useState(false);
  const [showCreateUnavailableDialog, setShowCreateUnavailableDialog] =
    useState(false);
  const [showFreeGoalModal, setShowFreeGoalModal] = useState(false);
  const [freeGoalInputs, setFreeGoalInputs] = useState<string[]>(['']);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [editGoalInputs, setEditGoalInputs] = useState<string[]>(['']);
  const [showEditChallengeGoalsModal, setShowEditChallengeGoalsModal] =
    useState(false);
  interface ChallengeGoalEntry {
    id: string;
    value: string;
  }
  const createGoalEntry = (value = ''): ChallengeGoalEntry => ({
    id: crypto.randomUUID(),
    value,
  });
  const [challengeGoalInputs, setChallengeGoalInputs] = useState<
    ChallengeGoalEntry[]
  >(() => [createGoalEntry()]);

  const { data: challengeDiariesData, isLoading: isDiariesLoading } =
    useChallengeDiaryList(challengeId, 8);

  const summary = data?.challengeSummary;
  const detail = data?.challengeDetail;
  const goals = data?.challengeGoals ?? EMPTY_GOALS;
  const participants = data?.participants ?? EMPTY_PARTICIPANTS;

  const participationRate =
    Math.round(
      Math.min(100, Math.max(0, detail?.participationRate ?? 0)) * 10
    ) / 10;

  const pendingParticipants = useMemo(
    () =>
      participants.filter((participant) => participant.status === 'PENDING'),
    [participants]
  );

  const activeParticipants = useMemo(
    () =>
      participants.filter((participant) =>
        PARTICIPATING_STATUS.includes(participant.status)
      ),
    [participants]
  );

  const myStatus = detail?.myStatus ?? 'NONE';
  const isHost = myStatus === 'HOST';
  const isPending = myStatus === 'PENDING';
  const isParticipating = PARTICIPATING_STATUS.includes(myStatus);
  const canJoinByStatus = myStatus === 'NONE' || myStatus === 'REJECTED';
  const isFreeChallenge = summary?.goalType === 'FLEXIBLE';

  const summaryStartDate = summary?.startDate ?? '';
  const summaryEndDate = summary?.endDate ?? '';
  const summaryMaxParticipantCnt = summary?.maxParticipantCnt ?? 0;
  const summaryParticipantCnt = summary?.participantCnt ?? 0;
  const isChallengeCurrentlyOngoing = isChallengeOngoing(
    summaryStartDate,
    summaryEndDate
  );
  const isEndless = isEndlessChallengeEndDate(summaryEndDate);
  // 챌린지 시작 여부 (시작일이 오늘 이전이면 시작된 것으로 간주)
  const isChallengeStarted =
    isChallengeCurrentlyOngoing ||
    (summaryStartDate ? new Date() >= new Date(summaryStartDate) : false);
  const {
    data: challengeCheckWriteDateKeys = [],
    isLoading: isCheckWriteDatesLoading,
  } = useChallengeCheckWriteDates(
    challengeId,
    isParticipating && isChallengeCurrentlyOngoing
  );
  const hasWritableRecentDiaryDate = useMemo(
    () => hasSelectableDiaryDate(challengeCheckWriteDateKeys),
    [challengeCheckWriteDateKeys]
  );
  const canJoin = canJoinByStatus && summaryMaxParticipantCnt > 1;
  const previewDiaries = challengeDiariesData?.items ?? [];
  const hasMoreDiaries =
    challengeDiariesData?.pageInfo.hasNextPage ?? false;

  const isActionLoading =
    joinChallenge.isPending ||
    leaveChallenge.isPending ||
    likeChallenge.isPending ||
    unlikeChallenge.isPending;

  const handleJoinChallenge = (): void => {
    if (summaryMaxParticipantCnt <= 1) {
      toast.error('최대 참여 인원이 2명 이상인 챌린지만 신청할 수 있습니다.');
      return;
    }

    if (isFreeChallenge) {
      setFreeGoalInputs([]);
      setShowFreeGoalModal(true);
      return;
    }

    const goalContents = goals.map((goal) => goal.content);
    joinChallenge.mutate(
      { challengeId, data: goalContents },
      {
        onSuccess: () => {
          toast.success('챌린지 참여 신청이 완료되었습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      }
    );
  };

  const handleFreeGoalSubmit = (): void => {
    const validGoals = freeGoalInputs
      .map((goal) => goal.trim())
      .filter(Boolean);
    if (validGoals.length === 0) {
      toast.error('목표를 최소 1개 이상 입력해 주세요.');
      return;
    }
    joinChallenge.mutate(
      { challengeId, data: validGoals },
      {
        onSuccess: () => {
          setShowFreeGoalModal(false);
          toast.success('챌린지 참여 신청이 완료되었습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      }
    );
  };

  const handleLeaveChallenge = (): void => {
    leaveChallenge.mutate(challengeId, {
      onSuccess: () => {
        toast.success('챌린지에서 나갔습니다.');
      },
      onError: (mutationError) => {
        notifyApiError(mutationError);
      },
    });
  };

  const handleToggleLike = (): void => {
    if (!summary) {
      return;
    }

    if (summary.likeInfo.likedByMe) {
      unlikeChallenge.mutate(challengeId, {
        onSuccess: () => {
          toast.success('챌린지 좋아요 취소 성공했습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      });
      return;
    }

    likeChallenge.mutate(challengeId, {
      onSuccess: () => {
        toast.success('챌린지 좋아요 성공했습니다.');
      },
      onError: (mutationError) => {
        notifyApiError(mutationError);
      },
    });
  };

  const handleDiaryCreateClick = (): void => {
    if (!isChallengeCurrentlyOngoing || isCheckWriteDatesLoading) {
      return;
    }

    if (!hasWritableRecentDiaryDate) {
      setShowCreateUnavailableDialog(true);
      return;
    }

    router.push(`/diary/create?challengeId=${id}`);
  };

  const handleAcceptParticipant = (participantId: number): void => {
    acceptParticipant.mutate(participantId, {
      onSuccess: () => {
        toast.success('참여 신청을 수락했습니다.');
      },
      onError: (mutationError) => {
        notifyApiError(mutationError);
      },
    });
  };

  const handleRejectParticipant = (participantId: number): void => {
    rejectParticipant.mutate(participantId, {
      onSuccess: () => {
        toast.success('참여 신청을 거절했습니다.');
      },
      onError: (mutationError) => {
        notifyApiError(mutationError);
      },
    });
  };

  const handleOpenEditGoalModal = (): void => {
    setEditGoalInputs(['']);
    setShowEditGoalModal(true);
  };

  const handleEditGoalSubmit = (): void => {
    const validGoals = editGoalInputs
      .map((goalInput) => goalInput.trim())
      .filter(Boolean);
    if (validGoals.length === 0) {
      toast.error('목표를 최소 1개 이상 입력해 주세요.');
      return;
    }
    updateParticipantGoal.mutate(
      { challengeId, goals: validGoals },
      {
        onSuccess: () => {
          setShowEditGoalModal(false);
          toast.success('목표가 수정되었습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      }
    );
  };

  const handleOpenEditChallengeGoalsModal = (): void => {
    const currentGoals = goals.map((goal) => createGoalEntry(goal.content));
    setChallengeGoalInputs(
      currentGoals.length > 0 ? currentGoals : [createGoalEntry()]
    );
    setShowEditChallengeGoalsModal(true);
  };

  const handleEditChallengeGoalsSubmit = (): void => {
    const validGoals = challengeGoalInputs
      .map((goalInput) => goalInput.value.trim())
      .filter(Boolean);
    if (validGoals.length === 0) {
      toast.error('목표를 최소 1개 이상 입력해 주세요.');
      return;
    }
    updateChallenge.mutate(
      { challengeId, data: { goals: validGoals } },
      {
        onSuccess: () => {
          setShowEditChallengeGoalsModal(false);
          toast.success('챌린지 목표가 수정되었습니다.');
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      }
    );
  };

  const handleDiaryLikeToggle = (diary: ChallengeDiaryItem): void => {
    if (!isLoggedIn) {
      setShowDiaryLikeDialog(true);
      return;
    }
    if (likeDiary.isPending || unlikeDiary.isPending) {
      return;
    }
    if (diary.likeInfo.likedByMe) {
      unlikeDiary.mutate(diary.id);
    } else {
      likeDiary.mutate(diary.id);
    }
  };

  const authDialog = (
    <LoginRequiredDialog
      open={showAuthDialog}
      onOpenChange={(open) => {
        if (!open) {
          setDismissed(true);
        }
      }}
      title="간편 가입 후에 둘러보세요!"
      description="챌린지 상세는 로그인 후 이용할 수 있습니다."
    />
  );

  if (isLoading) {
    return (
      <>
        {authDialog}
        <div
          className={cn(
            'flex min-h-[60vh] w-full items-center justify-center'
          )}
        >
          <Text size="body1" weight="medium" className="text-gray-500">
            상세 정보를 불러오는 중입니다...
          </Text>
        </div>
      </>
    );
  }

  if (isError || !summary || !detail) {
    return (
      <>
        {authDialog}
        <div
          className={cn(
            'flex min-h-[60vh] w-full items-center justify-center px-4'
          )}
        >
          <Text size="body1" weight="medium" className="text-red-600">
            {error
              ? normalizeApiError(error).message
              : '챌린지 상세 정보를 불러오지 못했습니다.'}
          </Text>
        </div>
      </>
    );
  }

  const accentColor = getCategoryAccent(summary.category);
  const heroGradient = buildHeroGradient(accentColor);
  const dateRangeText = formatDateRange(
    summary.startDate,
    summary.endDate
  );
  const remainingLabel = getRemainingLabel(summary.endDate);
  const participantsLabel =
    summaryMaxParticipantCnt > 1
      ? `${summaryParticipantCnt}/${summaryMaxParticipantCnt}명 참여`
      : '개인 챌린지';
  const heroMetaLabel = `${participantsLabel} · ${remainingLabel}`;

  // CTA 결정 로직: 호스트 / 참여 중 / 대기 / 신청 가능 / 신청 불가
  const ctaConfig = ((): {
    label: string;
    onClick(): void;
    disabled: boolean;
    variant: 'default' | 'outlined';
    show: boolean;
  } => {
    if (isHost) {
      return {
        label: '챌린지 수정',
        onClick: () => router.push(`/challenge/${id}/edit`),
        disabled: false,
        variant: 'outlined',
        show: true,
      };
    }
    if (isParticipating) {
      return {
        label: isChallengeCurrentlyOngoing
          ? '일지 작성하기'
          : '진행 중이 아닙니다',
        onClick: handleDiaryCreateClick,
        disabled: !isChallengeCurrentlyOngoing || isCheckWriteDatesLoading,
        variant: 'default',
        show: true,
      };
    }
    if (isPending) {
      return {
        label: '참여 승인 대기중',
        onClick: () => undefined,
        disabled: true,
        variant: 'outlined',
        show: true,
      };
    }
    if (canJoin) {
      return {
        label: '챌린지 참여하기',
        onClick: handleJoinChallenge,
        disabled: joinChallenge.isPending,
        variant: 'default',
        show: true,
      };
    }
    return {
      label: '참여 불가',
      onClick: () => undefined,
      disabled: true,
      variant: 'outlined',
      show: false,
    };
  })();

  const freeGoalModal = (
    <Dialog open={showFreeGoalModal} onOpenChange={setShowFreeGoalModal}>
      <DialogContent className="gap-5 px-6 py-6 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>내 목표 입력</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Text size="body2" weight="regular" className="text-gray-500">
            챌린지에서 달성할 목표를 입력하고 Enter를 눌러 추가해 주세요.
          </Text>
          <GoalAddList
            goals={freeGoalInputs}
            onGoalsChange={setFreeGoalInputs}
            placeholder="목표를 입력하고 Enter를 눌러 추가하세요"
            inputAriaLabel="목표 입력"
            maxGoals={5}
          />
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button
            size="medium"
            variant="ghost"
            className="flex-1"
            onClick={() => setShowFreeGoalModal(false)}
          >
            취소
          </Button>
          <Button
            size="medium"
            className="flex-1"
            disabled={joinChallenge.isPending}
            onClick={handleFreeGoalSubmit}
          >
            {joinChallenge.isPending ? '처리 중...' : '참여 신청'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const editGoalModal = (
    <Dialog open={showEditGoalModal} onOpenChange={setShowEditGoalModal}>
      <DialogContent className="gap-5 px-6 py-6 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>내 목표 수정</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Text size="body2" weight="regular" className="text-gray-500">
            새 목표를 입력하고 Enter를 눌러 추가해 주세요.
          </Text>
          <GoalAddList
            goals={editGoalInputs}
            onGoalsChange={setEditGoalInputs}
            placeholder="목표를 입력하고 Enter를 눌러 추가하세요"
            inputAriaLabel="목표 입력"
            maxGoals={5}
          />
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button
            size="medium"
            variant="ghost"
            className="flex-1"
            onClick={() => setShowEditGoalModal(false)}
          >
            취소
          </Button>
          <Button
            size="medium"
            className="flex-1"
            disabled={updateParticipantGoal.isPending}
            onClick={handleEditGoalSubmit}
          >
            {updateParticipantGoal.isPending ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const editChallengeGoalsModal = (
    <Dialog
      open={showEditChallengeGoalsModal}
      onOpenChange={setShowEditChallengeGoalsModal}
    >
      <DialogContent className="gap-5 px-6 py-6 sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>챌린지 목표 수정</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Text size="body2" weight="regular" className="text-gray-500">
            챌린지 시작 전에만 목표를 수정할 수 있습니다.
          </Text>
          <div className="flex flex-col gap-2">
            {challengeGoalInputs.map((goal) => (
              <div key={goal.id} className="flex items-center gap-2">
                <TextField
                  value={goal.value}
                  onChange={(event) => {
                    setChallengeGoalInputs((prev) =>
                      prev.map((entry) =>
                        entry.id === goal.id
                          ? { ...entry, value: event.target.value }
                          : entry
                      )
                    );
                  }}
                  placeholder="목표를 입력하세요"
                  className="flex-1"
                  maxLength={100}
                />
                <button
                  type="button"
                  aria-label="목표 삭제"
                  className={cn(
                    'flex h-10 w-10 shrink-0 cursor-pointer',
                    'items-center justify-center rounded-lg text-gray-500',
                    'transition-colors hover:bg-gray-100 hover:text-red-600'
                  )}
                  onClick={() => {
                    setChallengeGoalInputs((prev) =>
                      prev.filter((entry) => entry.id !== goal.id)
                    );
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="outlined"
            size="small"
            type="button"
            disabled={challengeGoalInputs.length >= 10}
            onClick={() =>
              setChallengeGoalInputs((prev) => [...prev, createGoalEntry()])
            }
          >
            + 목표 추가
          </Button>
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button
            size="medium"
            variant="ghost"
            className="flex-1"
            onClick={() => setShowEditChallengeGoalsModal(false)}
          >
            취소
          </Button>
          <Button
            size="medium"
            className="flex-1"
            disabled={updateChallenge.isPending}
            onClick={handleEditChallengeGoalsSubmit}
          >
            {updateChallenge.isPending ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen w-full pb-12">
      {authDialog}
      {freeGoalModal}
      {editGoalModal}
      {editChallengeGoalsModal}
      <DiaryCreateUnavailableDialog
        open={showCreateUnavailableDialog}
        onOpenChange={setShowCreateUnavailableDialog}
      />
      <LoginRequiredDialog
        open={showDiaryLikeDialog}
        onOpenChange={setShowDiaryLikeDialog}
      />

      {/* 히어로는 main 영역을 가득 채우는 edge-to-edge */}
      <ChallengeDetailHero
        title={summary.title}
        categoryLabel={getCategoryLabel(summary.category)}
        typeLabel={`${getChallengeTypeLabel(summary.goalType)} 챌린지`}
        metaLabel={heroMetaLabel}
        imageUrl={summary.thumbnailImage ?? undefined}
        accent={accentColor}
        gradient={heroGradient}
        bleed
      />

      <div
        className={cn(
          'flex w-full flex-col gap-6 px-4 pt-7 md:px-6 lg:px-8 lg:pt-8'
        )}
      >
        {isHost && pendingParticipants.length > 0 ? (
          <Card radius="lg" className="border-main-300 p-5 md:p-6">
            <div className="flex items-center gap-2">
              <CircleAlert className="text-main-800 h-5 w-5" />
              <Text size="heading2" weight="bold" className="text-gray-900">
                참여 인원 대기
              </Text>
              <span
                className={cn(
                  'bg-main-200 text-main-800',
                  'text-caption1 rounded-full px-2 py-0.5 font-bold'
                )}
              >
                {pendingParticipants.length}명
              </span>
            </div>
            <div
              className={cn(
                'mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3'
              )}
            >
              {pendingParticipants.map((participant) => (
                <PendingMemberItem
                  key={participant.participantId}
                  name={participant.nickname}
                  joinedAt={formatRelativeJoinedText(participant.status)}
                  onAccept={() =>
                    handleAcceptParticipant(participant.participantId)
                  }
                  onReject={() =>
                    handleRejectParticipant(participant.participantId)
                  }
                  isLoading={
                    acceptParticipant.isPending ||
                    rejectParticipant.isPending
                  }
                />
              ))}
            </div>
          </Card>
        ) : null}

        <div
          className={cn(
            'grid grid-cols-1 gap-7',
            'lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8'
          )}
        >
          {/* 메인 콘텐츠: 소개 → 인증 규칙 → 참여자 일지 */}
          <div className="flex min-w-0 flex-col gap-7">
            <section>
              <Text
                as="h2"
                size="heading2"
                weight="extrabold"
                className="mb-2.5 block tracking-[-0.3px] text-gray-900"
              >
                챌린지 소개
              </Text>
              <ExpandableText>{detail.description}</ExpandableText>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Tag tone="brand" size="sm">
                  {getCategoryLabel(summary.category)}
                </Tag>
                <Tag tone="gray" size="sm">
                  {getChallengeTypeLabel(summary.goalType)}
                </Tag>
              </div>
            </section>

            <ChallengeRulesCard
              goals={goals.map((goal) => goal.content)}
              isFreeChallenge={isFreeChallenge}
              editLabel={
                isHost && !isChallengeStarted && !isFreeChallenge
                  ? '수정'
                  : !isHost &&
                      isFreeChallenge &&
                      isParticipating &&
                      !isChallengeStarted
                    ? '내 목표 수정'
                    : undefined
              }
              onEdit={
                isHost && !isChallengeStarted && !isFreeChallenge
                  ? handleOpenEditChallengeGoalsModal
                  : !isHost &&
                      isFreeChallenge &&
                      isParticipating &&
                      !isChallengeStarted
                    ? handleOpenEditGoalModal
                    : undefined
              }
            />

            <section>
              <div className="mb-2.5 flex items-baseline justify-between gap-2">
                <Text
                  as="h2"
                  size="heading2"
                  weight="extrabold"
                  className="tracking-[-0.3px] text-gray-900"
                >
                  참여자 일지{' '}
                  <Text
                    size="caption1"
                    weight="regular"
                    className="ml-1 text-gray-500"
                  >
                    · 최근 {Math.min(previewDiaries.length, 4)}개
                  </Text>
                </Text>
                {hasMoreDiaries ? (
                  <Link
                    href={`/challenge/${id}/diary`}
                    className={cn(
                      'text-main-800 text-[12px] font-semibold',
                      'hover:underline'
                    )}
                  >
                    전체 보기 →
                  </Link>
                ) : null}
              </div>
              <ChallengeDiaryGrid
                diaries={previewDiaries.slice(0, 4)}
                isLoading={isDiariesLoading}
                onDiaryClick={(diaryId) => router.push(`/diary/${diaryId}`)}
                onLikeToggle={handleDiaryLikeToggle}
                gridClassName="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
              />
            </section>
          </div>

          {/* 우측 sticky rail: 진행률 + 리더보드 */}
          <aside
            className={cn(
              'flex min-w-0 flex-col gap-3.5',
              'lg:sticky lg:top-6 lg:self-start'
            )}
          >
            <ChallengeProgressCard
              progressPercent={participationRate}
              participantsLabel={participantsLabel}
              remainingLabel={dateRangeText}
              ctaLabel={ctaConfig.label}
              onCtaClick={ctaConfig.onClick}
              ctaDisabled={ctaConfig.disabled}
              ctaVariant={ctaConfig.variant}
              showCta={ctaConfig.show}
              isInfinite={isEndless}
              likeCount={summary.likeInfo.likeCnt}
              likedByMe={summary.likeInfo.likedByMe}
              onToggleLike={handleToggleLike}
              isLikePending={isActionLoading}
            />

            <ChallengeLeaderboardCard
              entries={activeParticipants.map((participant) => ({
                participantId: participant.participantId,
                memberId: participant.memberId,
                nickname: participant.nickname,
                profileImg: participant.profileImg,
                isHost: participant.status === 'HOST',
              }))}
              onMemberClick={(memberId) =>
                router.push(`/member/${memberId}`)
              }
            />

            {!isHost && isParticipating ? (
              <button
                type="button"
                onClick={handleLeaveChallenge}
                disabled={leaveChallenge.isPending}
                className={cn(
                  'mt-1 self-center text-[12px] text-gray-500',
                  'underline-offset-2 hover:text-gray-700 hover:underline',
                  'disabled:opacity-50'
                )}
              >
                챌린지 나가기
              </button>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
