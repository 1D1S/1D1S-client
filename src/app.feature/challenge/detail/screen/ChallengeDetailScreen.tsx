'use client';

import {
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  GoalAddList,
  Stripe,
  Tag,
  Text,
  TextField,
} from '@1d1s/design-system';
import { AlertDialog } from '@component/AlertDialog';
import { MobileBottomActionBar } from '@component/layout/MobileBottomActionBar';
import LikeBurst from '@component/LikeBurst';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { ChallengeDetailSkeleton } from '@component/skeletons/ChallengeDetailSkeleton';
import { getCategoryLabel } from '@constants/categories';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/useDiaryMutations';
import { resolveSidebarMemberId } from '@feature/diary/detail/utils/diaryViewData';
import { getApiErrorCode, normalizeApiError } from '@module/api/error';
import { notifyApiError } from '@module/api/errorNotify';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { toast } from '@module/providers/toast';
import { cn } from '@module/utils/cn';
import { formatDateISO } from '@module/utils/date';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { ArrowLeft, CircleAlert, Heart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { useIsLoggedIn } from '../../../member/hooks/useIsLoggedIn';
import { useSidebar } from '../../../member/hooks/useMemberQueries';
import {
  useChallengeCheckWriteDates,
  useChallengeDetail,
} from '../../board/hooks/useChallengeQueries';
import {
  isChallengeEndedOrArchived,
  isChallengeOngoing,
  isInfiniteChallengeEndDate,
} from '../../board/utils/challengePeriod';
import { ChallengeDetailHero } from '../components/ChallengeDetailHero';
import { ChallengeDiaryGrid } from '../components/ChallengeDiaryGrid';
import { ChallengeLeaderboardCard } from '../components/ChallengeLeaderboardCard';
import { ChallengePasswordDialog } from '../components/ChallengePasswordDialog';
import { ChallengeProgressCard } from '../components/ChallengeProgressCard';
import { ChallengeRulesCard } from '../components/ChallengeRulesCard';
import { ExpandableText } from '../components/ExpandableText';
import { PendingMemberItem } from '../components/PendingMemberItem';
import { useChallengeDiaryList } from '../hooks/useChallengeDiaryQueries';
import {
  useAcceptParticipant,
  useJoinChallenge,
  useLeaveChallenge,
  useLikeChallenge,
  usePokeChallengeMembers,
  useRejectParticipant,
  useUnlikeChallenge,
  useUpdateChallenge,
  useUpdateParticipantGoal,
  useVerifyChallengePassword,
} from '../hooks/useChallengeMutations';
import { useChallengePendingParticipants } from '../hooks/useChallengeParticipantQueries';
import { ChallengeDiaryItem } from '../type/challengeDiary';
import { buildHeroGradient, getCategoryAccent } from '../utils/challengeAccent';
import {
  EMPTY_GOALS,
  EMPTY_PARTICIPANTS,
  formatDateRange,
  formatRelativeJoinedText,
  getRemainingLabel,
  hasSelectableDiaryDate,
  PARTICIPATING_STATUS,
} from '../utils/challengeLabels';

interface ChallengeDetailScreenProps {
  id: string;
}

// 자유 목표 비공개 챌린지에 목표 없이 참여 시도할 때 백엔드가 내려주는 코드.
// 이 신호를 받으면 비밀번호 다이얼로그를 목표 입력 단계로 전환한다.
const FREE_GOAL_REQUIRED_CODE = 'CHALLENGE_022';

interface GoalAddListModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  description: string;
  goals: string[];
  onGoalsChange(goals: string[]): void;
  submitLabel: string;
  submitDisabled: boolean;
  submitMinWidthClass: string;
  onSubmit(): void;
}

// 목표 입력/수정 모달의 공통 chrome. 본문은 GoalAddList 로 동일하고
// 제목·설명·제출 버튼(라벨/너비/핸들러)만 다르다.
function GoalAddListModal({
  open,
  onOpenChange,
  title,
  description,
  goals,
  onGoalsChange,
  submitLabel,
  submitDisabled,
  submitMinWidthClass,
  onSubmit,
}: GoalAddListModalProps): React.ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[460px]">
        <DialogHeader className="flex-col items-start gap-1.5 pb-2">
          <DialogTitle className="text-[17px] font-extrabold tracking-[-0.3px] text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-gray-500">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <GoalAddList
            goals={goals}
            onGoalsChange={onGoalsChange}
            placeholder="목표를 입력하고 Enter를 눌러 추가하세요"
            inputAriaLabel="목표 입력"
            maxGoals={5}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            size="md"
            variant="secondary"
            className="min-w-[80px]"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            size="md"
            className={submitMinWidthClass}
            disabled={submitDisabled}
            onClick={onSubmit}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ChallengeDetailScreen({
  id,
}: ChallengeDetailScreenProps): React.ReactElement {
  const challengeId = Number(id);
  const router = useRouter();
  // 알림 딥링크/콜드 스타트로 진입해 history 가 없을 때 챌린지 목록으로 보낸다.
  const handleBack = useSafeBack('/challenge');

  const { data, isLoading, isError, error } = useChallengeDetail(challengeId);
  const showSkeleton = useMinimumLoading(isLoading);

  const joinChallenge = useJoinChallenge();
  const leaveChallenge = useLeaveChallenge();
  const likeChallenge = useLikeChallenge();
  const unlikeChallenge = useUnlikeChallenge();
  const acceptParticipant = useAcceptParticipant();
  const rejectParticipant = useRejectParticipant();
  const updateChallenge = useUpdateChallenge();
  const updateParticipantGoal = useUpdateParticipantGoal();
  const pokeChallengeMembers = usePokeChallengeMembers();
  const verifyChallengePassword = useVerifyChallengePassword();
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();

  const isLoggedIn = useIsLoggedIn();
  const { data: sidebarData } = useSidebar();
  const currentMemberId = useMemo(
    () => resolveSidebarMemberId(sidebarData),
    [sidebarData]
  );
  // memberId 해석 실패 시 닉네임(유일값)으로 내 행을 판별하기 위한 폴백
  const currentNickname = sidebarData?.nickname ?? null;
  // 이번 세션에서 이미 찌른 챌린지원과 현재 요청 중인 대상 추적
  const [pokedMemberIds, setPokedMemberIds] = useState<number[]>([]);
  const [pokingMemberId, setPokingMemberId] = useState<number | null>(null);
  // 히어로 위 floating 뒤로가기(top-3.5)가 스크롤로 가려지기 시작하는
  // 시점에 맞춰 sticky 헤더가 즉시 등장하도록 임계값을 8px로 둔다.
  const [isCompactHeaderVisible, setIsCompactHeaderVisible] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setIsCompactHeaderVisible(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [showCreateUnavailableDialog, setShowCreateUnavailableDialog] =
    useState(false);
  const [showFreeGoalModal, setShowFreeGoalModal] = useState(false);
  const [freeGoalInputs, setFreeGoalInputs] = useState<string[]>(['']);
  // 비공개 챌린지가 자유 목표로 확인돼 목표 입력이 필요한지.
  const [passwordNeedsGoals, setPasswordNeedsGoals] = useState(false);
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
    useChallengeDiaryList(challengeId, 5);

  const summary = data?.challengeSummary;
  const detail = data?.challengeDetail;
  const goals = data?.challengeGoals ?? EMPTY_GOALS;
  const participants = data?.participants ?? EMPTY_PARTICIPANTS;

  const participationRate =
    Math.round(
      Math.min(100, Math.max(0, detail?.participationRate ?? 0)) * 10
    ) / 10;

  const activeParticipants = useMemo(
    () =>
      participants.filter((participant) =>
        PARTICIPATING_STATUS.includes(participant.status)
      ),
    [participants]
  );

  const myStatus = detail?.myStatus ?? 'NONE';
  const isHost = myStatus === 'HOST';
  // 상세 응답 participants 는 등수순 상위 5명이라 PENDING 이 빠진다.
  // 대기 승인 카드는 status=PENDING 목록을 호스트일 때만 별도 조회한다.
  const { data: pendingParticipants = EMPTY_PARTICIPANTS } =
    useChallengePendingParticipants(challengeId, isHost);
  const isPending = myStatus === 'PENDING';
  const isParticipating = PARTICIPATING_STATUS.includes(myStatus);
  const canJoinByStatus = myStatus === 'NONE' || myStatus === 'REJECTED';
  const isFreeChallenge = summary?.goalType === 'FLEXIBLE';

  const summaryStartDate = summary?.startDate ?? '';
  const summaryEndDate = summary?.endDate ?? '';
  const summaryMaxParticipantCnt = summary?.maxParticipantCnt ?? 0;
  const summaryParticipantCnt = summary?.participantCnt ?? 0;
  // 단체 챌린지 여부는 participationType 으로 직접 판정한다.
  // maxParticipantCnt 로 추론하면 "제한없음"(null/0) GROUP 챌린지가 개인으로
  // 잘못 잡혀 참여하기 버튼이 사라지는 버그가 있었다.
  const isGroupChallenge = summary?.participationType === 'GROUP';
  const isChallengeCurrentlyOngoing = isChallengeOngoing(
    summaryStartDate,
    summaryEndDate
  );
  const isChallengeAlreadyEnded = isChallengeEndedOrArchived(
    summaryEndDate,
    summaryParticipantCnt
  );
  const isEndless = isInfiniteChallengeEndDate(summaryEndDate);
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
  // 내가 오늘 이 챌린지에 일지를 작성했는지 (작성 날짜 목록에 오늘이 포함)
  const hasWrittenDiaryToday = useMemo(
    () => challengeCheckWriteDateKeys.includes(formatDateISO(new Date())),
    [challengeCheckWriteDateKeys]
  );
  // 찌르기 노출 조건: 내가 참여 중 + 진행 중 + 오늘 일지 작성 완료
  const canPokeMembers =
    isParticipating && isChallengeCurrentlyOngoing && hasWrittenDiaryToday;
  // 중도 참여 차단: allowMidJoin=false 인 챌린지는 시작일 당일부터(=진행 중)
  // 신규 참여 신청을 받지 않는다.
  const allowMidJoin = detail?.allowMidJoin ?? false;
  const isMidJoinBlocked = !allowMidJoin && isChallengeCurrentlyOngoing;
  const canJoin =
    canJoinByStatus &&
    isGroupChallenge &&
    !isChallengeAlreadyEnded &&
    !isMidJoinBlocked;
  const previewDiaries = challengeDiariesData?.items ?? [];
  const hasMoreDiaries = challengeDiariesData?.pageInfo.hasNextPage ?? false;

  const isActionLoading =
    joinChallenge.isPending ||
    leaveChallenge.isPending ||
    likeChallenge.isPending ||
    unlikeChallenge.isPending;

  const handleJoinChallenge = (): void => {
    if (isChallengeAlreadyEnded) {
      toast.error('종료된 챌린지는 참여 신청을 보낼 수 없습니다.');
      return;
    }

    if (!isGroupChallenge) {
      toast.error('단체 챌린지에만 참여 신청을 보낼 수 있습니다.');
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
    if (isChallengeAlreadyEnded) {
      toast.error('종료된 챌린지는 참여 신청을 보낼 수 없습니다.');
      setShowFreeGoalModal(false);
      return;
    }
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
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
      });
      return;
    }

    likeChallenge.mutate(challengeId, {
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

  const handlePokeMember = (memberId: number): void => {
    if (pokeChallengeMembers.isPending) {
      return;
    }
    setPokingMemberId(memberId);
    pokeChallengeMembers.mutate(
      { challengeId, receiverMemberIds: [memberId] },
      {
        onSuccess: (result) => {
          const pokedIds = result?.pokedMemberIds ?? [];
          if (pokedIds.includes(memberId)) {
            setPokedMemberIds((prev) =>
              Array.from(new Set([...prev, ...pokedIds]))
            );
            toast.success('콕 찔렀어요!');
          } else {
            // 오늘 이미 일지를 썼거나 오늘 이미 찔러 대상에서 제외된 경우
            toast('오늘은 찌를 수 없는 챌린지원이에요.');
          }
        },
        onError: (mutationError) => {
          notifyApiError(mutationError);
        },
        onSettled: () => {
          setPokingMemberId(null);
        },
      }
    );
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
    if (likeDiary.isPending || unlikeDiary.isPending) {
      return;
    }
    if (diary.likeInfo.likedByMe) {
      unlikeDiary.mutate(diary.id);
    } else {
      likeDiary.mutate(diary.id);
    }
  };

  const handleVerifyPassword = (password: string, goals: string[]): void => {
    const data = goals.length > 0 ? { password, goals } : { password };
    verifyChallengePassword.mutate(
      { challengeId, data },
      {
        onSuccess: () => {
          // 검증 성공 시 상세 쿼리가 무효화되어 자동으로 다시 불러온다.
          toast.success('비공개 챌린지에 참여했어요.');
        },
        onError: (mutationError) => {
          // 자유 목표 챌린지는 비밀번호만으로 참여할 수 없다. 백엔드가 목표
          // 필요 신호를 주면 목표 입력 단계로 전환한 뒤 재시도하도록 한다.
          if (getApiErrorCode(mutationError) === FREE_GOAL_REQUIRED_CODE) {
            setPasswordNeedsGoals(true);
            return;
          }
          notifyApiError(mutationError);
        },
      }
    );
  };

  // 비공개 챌린지(403)는 비밀번호 검증 모달로 유도한다.
  const isPrivateChallengeLocked =
    isError && normalizeApiError(error).status === 403;

  if (!isLoggedIn) {
    return (
      <LoginRequiredDialog
        open
        onOpenChange={() => {}}
        title="간편 가입 후에 둘러보세요!"
        description="챌린지 상세는 로그인 후 이용할 수 있습니다."
        required
        onClose={() => router.push('/challenge')}
      />
    );
  }

  if (showSkeleton) {
    return <ChallengeDetailSkeleton />;
  }

  if (isPrivateChallengeLocked) {
    return (
      <ChallengePasswordDialog
        open
        isPending={verifyChallengePassword.isPending}
        requireGoals={passwordNeedsGoals}
        onClose={() => router.push('/challenge')}
        onSubmit={handleVerifyPassword}
      />
    );
  }

  if (isError || !summary || !detail) {
    return (
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
    );
  }

  const accentColor = getCategoryAccent(summary.category);
  const heroGradient = buildHeroGradient(accentColor);
  const dateRangeText = formatDateRange(summary.startDate, summary.endDate);
  const remainingLabel = getRemainingLabel(summary.endDate);
  // 표시 규칙:
  //   - 개인 챌린지: "개인 챌린지"
  //   - 단체 + 최대 인원 지정: "X/Y명 참여"
  //   - 단체 + 제한없음: "X명 참여 · 제한없음"
  const participantsLabel = !isGroupChallenge
    ? '개인 챌린지'
    : summaryMaxParticipantCnt > 0
      ? `${summaryParticipantCnt}/${summaryMaxParticipantCnt}명 참여`
      : `${summaryParticipantCnt}명 참여 · 제한없음`;
  const heroMetaLabel = `${participantsLabel} · ${remainingLabel}`;

  // CTA 결정 로직: 호스트 / 참여 중 / 대기 / 신청 가능 / 신청 불가
  interface ChallengeCtaConfig {
    label: string;
    onClick(): void;
    disabled: boolean;
    variant: 'primary' | 'secondary';
    show: boolean;
    hint?: string;
    secondary?: {
      label: string;
      onClick(): void;
      variant: 'primary' | 'secondary';
    };
  }
  // 클릭 불가 안내 버튼(대기/종료/중도참여불가)의 공통 형태.
  const disabledCta = (label: string, hint?: string): ChallengeCtaConfig => ({
    label,
    onClick: () => undefined,
    disabled: true,
    variant: 'secondary',
    show: true,
    hint,
  });

  const ctaConfig = ((): ChallengeCtaConfig => {
    if (isHost) {
      const editChallenge = {
        label: '챌린지 수정',
        onClick: () => router.push(`/challenge/${id}/edit`),
        variant: 'secondary' as const,
      };
      // 호스트도 참여자이므로 진행 중에는 일지 작성을 우선 CTA 로 노출하고
      // 챌린지 수정은 보조 버튼으로 함께 제공한다.
      if (isChallengeCurrentlyOngoing) {
        return {
          label: '일지 작성하기',
          onClick: handleDiaryCreateClick,
          disabled: isCheckWriteDatesLoading,
          variant: 'primary',
          show: true,
          secondary: editChallenge,
        };
      }
      return {
        ...editChallenge,
        disabled: false,
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
        variant: 'primary',
        show: true,
      };
    }
    if (isPending) {
      return disabledCta('참여 승인 대기중');
    }
    if (canJoinByStatus && isChallengeAlreadyEnded) {
      return disabledCta('종료된 챌린지');
    }
    if (canJoinByStatus && isMidJoinBlocked) {
      return disabledCta(
        '중도 참여 불가',
        '이미 시작된 챌린지는 중도 참여가 불가능합니다'
      );
    }
    if (canJoin) {
      return {
        label: '챌린지 참여하기',
        onClick: handleJoinChallenge,
        disabled: joinChallenge.isPending,
        variant: 'primary',
        show: true,
      };
    }
    return {
      label: '참여 불가',
      onClick: () => undefined,
      disabled: true,
      variant: 'secondary',
      show: false,
    };
  })();

  const freeGoalModal = (
    <GoalAddListModal
      open={showFreeGoalModal}
      onOpenChange={setShowFreeGoalModal}
      title="내 목표 입력"
      description="챌린지에서 달성할 목표를 입력하고 Enter 를 눌러 추가해 주세요. (최대 5개)"
      goals={freeGoalInputs}
      onGoalsChange={setFreeGoalInputs}
      submitLabel={joinChallenge.isPending ? '처리 중...' : '참여 신청'}
      submitDisabled={joinChallenge.isPending}
      submitMinWidthClass="min-w-[112px]"
      onSubmit={handleFreeGoalSubmit}
    />
  );

  const editGoalModal = (
    <GoalAddListModal
      open={showEditGoalModal}
      onOpenChange={setShowEditGoalModal}
      title="내 목표 수정"
      description="새 목표를 입력하고 Enter 를 눌러 추가해 주세요. (최대 5개)"
      goals={editGoalInputs}
      onGoalsChange={setEditGoalInputs}
      submitLabel={updateParticipantGoal.isPending ? '저장 중...' : '저장'}
      submitDisabled={updateParticipantGoal.isPending}
      submitMinWidthClass="min-w-[96px]"
      onSubmit={handleEditGoalSubmit}
    />
  );

  const editChallengeGoalsModal = (
    <Dialog
      open={showEditChallengeGoalsModal}
      onOpenChange={setShowEditChallengeGoalsModal}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[460px]">
        <DialogHeader className="flex-col items-start gap-1.5 pb-2">
          <DialogTitle className="text-[17px] font-extrabold tracking-[-0.3px] text-gray-900">
            챌린지 목표 수정
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-gray-500">
            챌린지 시작 전에만 목표를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
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
            variant="secondary"
            size="sm"
            type="button"
            disabled={challengeGoalInputs.length >= 10}
            onClick={() =>
              setChallengeGoalInputs((prev) => [...prev, createGoalEntry()])
            }
          >
            + 목표 추가
          </Button>
        </DialogBody>
        <DialogFooter>
          <Button
            size="md"
            variant="secondary"
            className="min-w-[80px]"
            onClick={() => setShowEditChallengeGoalsModal(false)}
          >
            취소
          </Button>
          <Button
            size="md"
            className="min-w-[96px]"
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
    <>
      {/* 모바일 sliver-style sticky 헤더 — 스크롤 시 페이드인.
          data-fade-in 래퍼 밖에 둔다: 래퍼의 transform 이 containing block 을
          만들어 position: fixed 가 뷰포트 대신 래퍼 기준이 되는 문제를 피한다.
          네이티브 쉘에선 AppBackBar 가 같은 역할을 하므로 data-native-hide
          로 가린다. globals.css 의 sticky 일괄 룰은 fixed 는 안 잡는다. */}
      <div
        data-native-hide
        className={cn(
          'fixed top-0 right-0 left-0 z-30 flex h-14 items-center',
          'gap-3 border-b border-gray-100 bg-white/95 px-4',
          'backdrop-blur transition-all duration-200 lg:hidden',
          isCompactHeaderVisible
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-full opacity-0'
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={handleBack}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center',
            'rounded-lg text-gray-700 transition-colors hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="body1"
          weight="extrabold"
          className={cn(
            'line-clamp-1 min-w-0 flex-1 tracking-[-0.3px] text-gray-900'
          )}
        >
          {summary.title}
        </Text>
      </div>

      <div
        className={cn(
          'allow-user-select',
          'data-fade-in min-h-screen w-full bg-white',
          ctaConfig.show ? 'pb-mobile-action-bar lg:pb-12' : 'pb-12'
        )}
      >
        {freeGoalModal}
        {editGoalModal}
        {editChallengeGoalsModal}
        <AlertDialog
          open={showCreateUnavailableDialog}
          onOpenChange={setShowCreateUnavailableDialog}
          title="새 일지를 작성할 수 없습니다."
          description="최근 3일 동안 작성 가능한 날짜를 모두 사용했습니다."
        />

        {/* 히어로 + 모바일 floating 뒤로가기 */}
        <div className="relative">
          <ChallengeDetailHero
            title={summary.title}
            categoryLabel={getCategoryLabel(summary.category)}
            category={summary.category}
            typeLabel={`${formatChallengeTypeLabel(summary.goalType)} 챌린지`}
            metaLabel={heroMetaLabel}
            imageUrl={summary.thumbnailImage ?? undefined}
            accent={accentColor}
            gradient={heroGradient}
            bleed
            hideTextOnMobile
          />
          {/* 히어로 위 모바일 floating 백버튼. 네이티브에선 AppBackBar 가
              상단에 있으므로 data-native-hide 로 가려 중복을 막는다. */}
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={handleBack}
            data-native-hide
            className={cn(
              'absolute left-3.5 z-10 flex h-9 w-9',
              'top-[calc(0.875rem+env(safe-area-inset-top))]',
              'items-center justify-center rounded-full bg-white/90',
              'text-gray-700 shadow-sm backdrop-blur',
              'transition hover:bg-white lg:hidden'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        {/* 모바일 컨텐츠 헤더 — 히어로 위로 오버레이 */}
        <div
          className={cn(
            'relative z-10 -mt-5 rounded-t-[20px] bg-white px-5 pt-5 pb-1',
            'lg:hidden'
          )}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag tone="brand" size="sm">
              {getCategoryLabel(summary.category)}
            </Tag>
            <Tag tone="gray" size="sm">
              {formatChallengeTypeLabel(summary.goalType)}
            </Tag>
          </div>
          <Text
            as="h1"
            size="heading1"
            weight="extrabold"
            className="mt-2.5 block tracking-[-0.5px] break-keep text-gray-900"
          >
            {summary.title}
          </Text>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <Text
              size="caption1"
              weight="regular"
              className="min-w-0 flex-1 text-gray-500"
            >
              {heroMetaLabel}
            </Text>
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={isActionLoading}
              aria-label={summary.likeInfo.likedByMe ? '좋아요 취소' : '좋아요'}
              className={cn(
                'relative flex shrink-0 cursor-pointer items-center gap-1',
                'rounded-full border px-2.5 py-1 text-[12px] font-bold',
                'transition-colors disabled:cursor-default disabled:opacity-50',
                summary.likeInfo.likedByMe
                  ? 'border-main-800 bg-main-100 text-main-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <LikeBurst liked={summary.likeInfo.likedByMe} />
              <Heart
                className={cn(
                  'h-3.5 w-3.5',
                  summary.likeInfo.likedByMe && 'fill-current'
                )}
              />
              {summary.likeInfo.likeCnt}
            </button>
          </div>

          {activeParticipants.length > 0 ? (
            <div
              className={cn(
                'mt-4 flex items-center gap-2.5 rounded-[12px]',
                'bg-main-100 px-3.5 py-3'
              )}
            >
              <div className="flex">
                {activeParticipants.slice(0, 4).map((participant, idx) => (
                  <div
                    key={participant.participantId}
                    className={cn(
                      'relative h-7 w-7 overflow-hidden rounded-full',
                      'bg-main-200 border-2 border-white',
                      idx > 0 && '-ml-2.5'
                    )}
                  >
                    {participant.profileImg ? (
                      <Image
                        src={participant.profileImg}
                        alt=""
                        width={28}
                        height={28}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Stripe tone="var(--main-300)" />
                    )}
                  </div>
                ))}
              </div>
              <Text size="caption1" weight="regular" className="text-gray-700">
                <span className="font-extrabold">
                  {activeParticipants.length}명
                </span>
                이 함께 도전 중이에요
              </Text>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            'relative z-10 flex w-full flex-col gap-3 px-5 pt-3',
            'sm:pt-6 md:px-6 lg:gap-4 lg:px-8 lg:pt-8'
          )}
        >
          {isHost && pendingParticipants.length > 0 ? (
            <Card radius="lg" className="border-main-300 p-5 md:p-6">
              <div className="flex items-center gap-2">
                <CircleAlert className="text-main-800 h-5 w-5" />
                <Text size="heading2" weight="bold" className="text-gray-900">
                  참여 인원 대기
                </Text>
                <Tag tone="brand" size="sm">
                  {pendingParticipants.length}명
                </Tag>
              </div>
              <div
                className={cn('mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3')}
              >
                {pendingParticipants.map((participant) => (
                  <PendingMemberItem
                    key={participant.participantId}
                    name={participant.nickname}
                    joinedAt={formatRelativeJoinedText(participant.status)}
                    profileImg={participant.profileImg}
                    goals={isFreeChallenge ? participant.goals : undefined}
                    onProfileClick={() =>
                      router.push(`/member/${participant.memberId}`)
                    }
                    onAccept={() =>
                      handleAcceptParticipant(participant.participantId)
                    }
                    onReject={() =>
                      handleRejectParticipant(participant.participantId)
                    }
                    isLoading={
                      acceptParticipant.isPending || rejectParticipant.isPending
                    }
                  />
                ))}
              </div>
            </Card>
          ) : null}

          <div
            className={cn(
              'grid grid-cols-1 gap-4',
              'lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-7'
            )}
          >
            {/* 메인 콘텐츠: 소개 → 목표 → 참여자 일지 */}
            <div className="flex min-w-0 flex-col gap-3.5 lg:gap-4">
              {detail.description?.trim() ? (
                <section
                  className={cn(
                    'rounded-[14px] border border-gray-200 bg-white',
                    'p-4 sm:p-5 lg:p-6'
                  )}
                >
                  <Text
                    as="h2"
                    size="heading2"
                    weight="extrabold"
                    className="mb-3 block tracking-[-0.3px] text-gray-900"
                  >
                    챌린지 소개
                  </Text>
                  <ExpandableText>{detail.description}</ExpandableText>
                  <div className="mt-3 hidden flex-wrap items-center gap-1.5 lg:flex">
                    <Tag tone="brand" size="sm">
                      {getCategoryLabel(summary.category)}
                    </Tag>
                    <Tag tone="gray" size="sm">
                      {formatChallengeTypeLabel(summary.goalType)}
                    </Tag>
                  </div>
                </section>
              ) : null}

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

              <section
                className={cn(
                  'rounded-[14px] border border-gray-200 bg-white',
                  'p-4 sm:p-5 lg:p-6'
                )}
              >
                <div className="mb-3 flex items-baseline justify-between gap-2">
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
                  onLikeToggle={handleDiaryLikeToggle}
                  gridClassName={cn(
                    'scrollbar-hide flex gap-3 overflow-x-auto',
                    'py-2 sm:gap-2.5'
                  )}
                  itemClassName="w-[240px] shrink-0 sm:w-[260px]"
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
              <div className="hidden lg:block">
                <ChallengeProgressCard
                  progressPercent={participationRate}
                  participantsLabel={participantsLabel}
                  remainingLabel={dateRangeText}
                  ctaLabel={ctaConfig.label}
                  onCtaClick={ctaConfig.onClick}
                  ctaDisabled={ctaConfig.disabled}
                  ctaVariant={ctaConfig.variant}
                  showCta={ctaConfig.show}
                  ctaHint={ctaConfig.hint}
                  secondaryCtaLabel={ctaConfig.secondary?.label}
                  onSecondaryCtaClick={ctaConfig.secondary?.onClick}
                  secondaryCtaVariant={ctaConfig.secondary?.variant}
                  isInfinite={isEndless}
                  likeCount={summary.likeInfo.likeCnt}
                  likedByMe={summary.likeInfo.likedByMe}
                  onToggleLike={handleToggleLike}
                  isLikePending={isActionLoading}
                />
              </div>

              <ChallengeLeaderboardCard
                entries={activeParticipants.map((participant) => ({
                  participantId: participant.participantId,
                  memberId: participant.memberId,
                  nickname: participant.nickname,
                  profileImg: participant.profileImg,
                  isHost: participant.status === 'HOST',
                  // 고정 목표는 전원 공통이라 참여자별로 볼 의미가 없다.
                  goals: isFreeChallenge ? participant.goals : undefined,
                  rank: participant.rank,
                  streak: participant.streak,
                  completedGoalCount: participant.completedGoalCount,
                }))}
                totalCount={summaryParticipantCnt}
                onShowAll={() =>
                  router.push(`/challenge/${id}/participants`)
                }
                onMemberClick={(memberId) => router.push(`/member/${memberId}`)}
                canPoke={canPokeMembers}
                currentMemberId={currentMemberId}
                currentNickname={currentNickname}
                onPoke={handlePokeMember}
                pokingMemberId={pokingMemberId}
                pokedMemberIds={pokedMemberIds}
              />

              {isParticipating ? (
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

      {/* 모바일 sticky bottom CTA — data-fade-in 래퍼 밖에 둔다:
          래퍼의 transform 이 containing block 을 만들어 position: fixed 가
          뷰포트 대신 래퍼 기준이 되는 문제를 피한다. */}
      {ctaConfig.show ? (
        <MobileBottomActionBar>
          <Button
            size="md"
            variant={ctaConfig.variant}
            fullWidth
            onClick={ctaConfig.onClick}
            disabled={ctaConfig.disabled}
          >
            {ctaConfig.label}
          </Button>
          {ctaConfig.secondary ? (
            <Button
              size="md"
              variant={ctaConfig.secondary.variant}
              fullWidth
              onClick={ctaConfig.secondary.onClick}
              className="mt-2"
            >
              {ctaConfig.secondary.label}
            </Button>
          ) : null}
          {ctaConfig.hint ? (
            <Text
              size="caption1"
              weight="regular"
              className="mt-2 block text-center text-gray-500"
            >
              {ctaConfig.hint}
            </Text>
          ) : null}
        </MobileBottomActionBar>
      ) : null}
    </>
  );
}
