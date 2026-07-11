'use client';

import { Button, Card, Tabs, Tag, Text } from '@1d1s/design-system';
import { AlertDialog } from '@component/AlertDialog';
import { MobileBottomActionBar } from '@component/layout/MobileBottomActionBar';
import LikeBurst from '@component/LikeBurst';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { ChallengeDetailSkeleton } from '@component/skeletons/ChallengeDetailSkeleton';
import { getCategoryLabel } from '@constants/categories';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import { resolveSidebarMemberId } from '@feature/diary/detail/utils/diaryViewData';
import { getApiErrorCode, normalizeApiError } from '@module/api/error';
import { notifyApiError } from '@module/api/errorNotify';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { toast } from '@module/providers/toast';
import { cn } from '@module/utils/cn';
import { formatDateISO } from '@module/utils/date';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { ArrowLeft, CircleAlert, Heart } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { useIsLoggedIn } from '../../../member/hooks/useIsLoggedIn';
import { useSidebar } from '../../../member/hooks/useMemberQueries';
import {
  useChallengeCheckWriteDates,
  useChallengeDetail,
} from '../../board/hooks/useChallengeQueries';
import {
  canWriteDiaryForChallenge,
  isChallengeEndedOrArchived,
  isChallengeOngoing,
  isInfiniteChallengeEndDate,
} from '../../board/utils/challengePeriod';
import { ChallengeDetailCompactHeader } from '../components/ChallengeDetailCompactHeader';
import { ChallengeDetailHero } from '../components/ChallengeDetailHero';
import { ChallengeDiaryList } from '../components/ChallengeDiaryList';
import { ChallengeGoalModals } from '../components/ChallengeGoalModals';
import { ChallengeLeaderboardCard } from '../components/ChallengeLeaderboardCard';
import { ChallengePasswordDialog } from '../components/ChallengePasswordDialog';
import { ChallengeProgressCard } from '../components/ChallengeProgressCard';
import { ChallengeRulesCard } from '../components/ChallengeRulesCard';
import { ChallengeStatisticsSection } from '../components/ChallengeStatisticsSection';
import { ExpandableText } from '../components/ExpandableText';
import { PendingMemberItem } from '../components/PendingMemberItem';
import { useChallengeStatistics } from '../hooks/useChallengeDiaryQueries';
import { useChallengeGoalEditors } from '../hooks/useChallengeGoalEditors';
import {
  useAcceptParticipant,
  useJoinChallenge,
  useLeaveChallenge,
  useLikeChallenge,
  useRejectParticipant,
  useUnlikeChallenge,
  useVerifyChallengePassword,
} from '../hooks/useChallengeMutations';
import { useChallengePendingParticipants } from '../hooks/useChallengeParticipantQueries';
import { usePokeMembers } from '../hooks/usePokeMembers';
import { buildHeroGradient, getCategoryAccent } from '../utils/challengeAccent';
import { buildChallengeCta } from '../utils/challengeCta';
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

// 상세 탭 뷰 — URL ?tab= 으로 보존. 기본은 소개.
const CHALLENGE_TAB_IDS = ['overview', 'diary', 'participants'] as const;
type ChallengeTabId = (typeof CHALLENGE_TAB_IDS)[number];

function isChallengeTab(value: string | null): value is ChallengeTabId {
  const ids: readonly string[] = CHALLENGE_TAB_IDS;
  return value !== null && ids.includes(value);
}

// 탭 라벨 옆 카운트 배지 — 원형 배경. 활성 탭은 브랜드 톤.
function renderTabCountBadge(
  value: number,
  active: boolean
): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex min-w-[1.125rem] items-center justify-center',
        'rounded-full px-1 text-[11px] leading-none font-bold',
        active ? 'bg-main-100 text-main-800' : 'bg-gray-100 text-gray-500'
      )}
    >
      {value}
    </span>
  );
}

export function ChallengeDetailScreen({
  id,
}: ChallengeDetailScreenProps): React.ReactElement {
  const challengeId = Number(id);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // 알림 딥링크/콜드 스타트로 진입해 history 가 없을 때 챌린지 목록으로 보낸다.
  const handleBack = useSafeBack('/challenge');

  const tabParam = searchParams.get('tab');
  const activeTab: ChallengeTabId = isChallengeTab(tabParam)
    ? tabParam
    : 'overview';
  const diaryDate = searchParams.get('date') ?? undefined;

  const handleTabChange = (nextId: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', nextId);
    // 일지 탭을 떠나면 날짜 필터를 흘려보내지 않는다.
    if (nextId !== 'diary') {
      params.delete('date');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data, isLoading, isError, error } = useChallengeDetail(challengeId);
  const showSkeleton = useMinimumLoading(isLoading);

  // 일지 탭 배지용 총 일지 수. 통계 쿼리(소개 탭과 공유·캐시)의 일자별 합계다.
  const { data: statsData } = useChallengeStatistics(challengeId);
  const diaryCount = statsData
    ? statsData.diaryTrend.reduce((sum, point) => sum + point.count, 0)
    : undefined;

  const joinChallenge = useJoinChallenge();
  const leaveChallenge = useLeaveChallenge();
  const likeChallenge = useLikeChallenge();
  const unlikeChallenge = useUnlikeChallenge();
  const acceptParticipant = useAcceptParticipant();
  const rejectParticipant = useRejectParticipant();
  const verifyChallengePassword = useVerifyChallengePassword();

  const isLoggedIn = useIsLoggedIn();
  const { data: sidebarData } = useSidebar();
  const currentMemberId = useMemo(
    () => resolveSidebarMemberId(sidebarData),
    [sidebarData]
  );
  // memberId 해석 실패 시 닉네임(유일값)으로 내 행을 판별하기 위한 폴백
  const currentNickname = sidebarData?.nickname ?? null;
  const { pokedMemberIds, pokingMemberId, handlePokeMember } =
    usePokeMembers(challengeId);
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
  // 비공개 챌린지가 자유 목표로 확인돼 목표 입력이 필요한지.
  const [passwordNeedsGoals, setPasswordNeedsGoals] = useState(false);

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
  // 대기 승인 카드는 참여자 탭에 있으므로, 호스트가 그 탭을 볼 때만 조회한다.
  const { data: pendingParticipants = EMPTY_PARTICIPANTS } =
    useChallengePendingParticipants(
      challengeId,
      isHost && activeTab === 'participants'
    );
  const isJoinRequestPending = myStatus === 'PENDING';
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
  // 종료됐어도 종료 후 작성 허용 옵션 + 2일 유예 이내면 일지 작성을 살린다.
  const canWriteDiary = canWriteDiaryForChallenge(
    summaryStartDate,
    summaryEndDate,
    summary?.postEndWriteAllowed
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
    isParticipating && canWriteDiary
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

  const isActionLoading =
    joinChallenge.isPending ||
    leaveChallenge.isPending ||
    likeChallenge.isPending ||
    unlikeChallenge.isPending;

  const goalEditors = useChallengeGoalEditors({
    challengeId,
    goals,
    isChallengeAlreadyEnded,
    joinChallenge,
  });

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
      goalEditors.openFreeGoalModal();
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
    if (!canWriteDiary || isCheckWriteDatesLoading) {
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

  const ctaConfig = buildChallengeCta({
    isHost,
    isParticipating,
    isJoinRequestPending,
    canWriteDiary,
    isCheckWriteDatesLoading,
    canJoinByStatus,
    isChallengeAlreadyEnded,
    isMidJoinBlocked,
    canJoin,
    isJoinPending: joinChallenge.isPending,
    onEditChallenge: () => router.push(`/challenge/${id}/edit`),
    onDiaryCreate: handleDiaryCreateClick,
    onJoin: handleJoinChallenge,
  });

  const rulesEditLabel =
    isHost && !isChallengeStarted && !isFreeChallenge
      ? '수정'
      : !isHost && isFreeChallenge && isParticipating && !isChallengeStarted
        ? '내 목표 수정'
        : undefined;
  const rulesOnEdit =
    isHost && !isChallengeStarted && !isFreeChallenge
      ? goalEditors.openEditChallengeGoalsModal
      : !isHost && isFreeChallenge && isParticipating && !isChallengeStarted
        ? goalEditors.openEditGoalModal
        : undefined;

  const tabItems = [
    { id: 'overview', label: '소개' },
    {
      id: 'diary',
      label: '일지',
      badge:
        diaryCount !== undefined
          ? renderTabCountBadge(diaryCount, activeTab === 'diary')
          : undefined,
    },
    {
      id: 'participants',
      label: '참여자',
      badge:
        summaryParticipantCnt > 0
          ? renderTabCountBadge(
              summaryParticipantCnt,
              activeTab === 'participants'
            )
          : undefined,
    },
  ];

  // 소개 탭 하단 "챌린지 정보" — 히어로/진행률과 겹치지 않는 규칙·옵션 위주.
  const infoRows: Array<{ label: string; value: string }> = [
    { label: '기간', value: dateRangeText },
    { label: '인원', value: participantsLabel },
    {
      label: '방식',
      value: `${formatChallengeTypeLabel(summary.goalType)} 목표 · ${
        isGroupChallenge ? '단체' : '개인'
      }`,
    },
    { label: '인증샷', value: detail.photoRequired ? '필수' : '자유' },
    {
      label: '종료 후 작성',
      value: summary.postEndWriteAllowed ? '허용' : '미허용',
    },
  ];

  return (
    <>
      <ChallengeDetailCompactHeader
        visible={isCompactHeaderVisible}
        title={summary.title}
        onBack={handleBack}
      />

      <div
        className={cn(
          'allow-user-select',
          'data-fade-in min-h-screen w-full bg-white',
          ctaConfig.show ? 'pb-mobile-action-bar lg:pb-12' : 'pb-12'
        )}
      >
        <ChallengeGoalModals editors={goalEditors} />
        <AlertDialog
          open={showCreateUnavailableDialog}
          onOpenChange={setShowCreateUnavailableDialog}
          title="새 일지를 작성할 수 없습니다."
          description="최근 3일 동안 작성 가능한 날짜를 모두 사용했습니다."
        />

        {/* 히어로 + 모바일 floating 뒤로가기 — 탭 위에 항상 고정 노출 */}
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

        {/* 모바일 컨텐츠 헤더 — 히어로 위로 오버레이. 탭 위 고정 노출. */}
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

          {/* 모바일 진행률 요약 — 우측 rail 대신 컴팩트 바 */}
          <div
            className={cn(
              'mt-3.5 flex items-center gap-2.5 rounded-[12px]',
              'border-main-300 bg-main-100 border px-3.5 py-2.5'
            )}
          >
            <Text
              size="caption1"
              weight="bold"
              className="shrink-0 text-gray-600"
            >
              진행률
            </Text>
            <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-white">
              <div
                className="bg-main-800 h-full rounded-full"
                style={{ width: `${participationRate}%` }}
              />
            </div>
            <Text
              size="body2"
              weight="extrabold"
              className="text-main-800 shrink-0 tabular-nums"
            >
              {participationRate}%
            </Text>
          </div>
        </div>

        <div
          className={cn(
            'relative z-10 flex w-full flex-col gap-3 px-5 pt-3',
            'sm:pt-6 md:px-6 lg:gap-4 lg:px-8 lg:pt-8'
          )}
        >
          <div
            className={cn(
              'grid grid-cols-1 gap-4',
              'lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-7'
            )}
          >
            {/* 메인 콘텐츠: 탭(소개 / 일지 / 참여자) */}
            <div className="flex min-w-0 flex-col">
              {/* 모바일에선 compact 헤더(h-14) 아래에 sticky 로 붙인다. */}
              <div
                className={cn(
                  'sticky top-14 z-20 bg-white',
                  'lg:static lg:top-auto lg:z-auto'
                )}
              >
                <div className="scrollbar-hide -mx-1 overflow-x-auto px-1">
                  <Tabs
                    activeId={activeTab}
                    onChange={handleTabChange}
                    items={tabItems}
                  />
                </div>
              </div>

              <div className="mt-4 flex min-w-0 flex-col gap-3.5 lg:gap-4">
                {activeTab === 'overview' ? (
                  <>
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
                      editLabel={rulesEditLabel}
                      onEdit={rulesOnEdit}
                    />

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
                        챌린지 정보
                      </Text>
                      <div className="flex flex-col gap-1.5">
                        {infoRows.map((row) => (
                          <div
                            key={row.label}
                            className={cn(
                              'flex items-center gap-3 rounded-[10px]',
                              'bg-gray-50 px-3.5 py-2.5'
                            )}
                          >
                            <Text
                              size="caption1"
                              weight="regular"
                              className={cn(
                                'shrink-0 whitespace-nowrap text-gray-400'
                              )}
                            >
                              {row.label}
                            </Text>
                            <Text
                              size="caption1"
                              weight="medium"
                              className={cn(
                                'min-w-0 flex-1 truncate text-right',
                                'text-gray-700'
                              )}
                            >
                              {row.value}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </section>

                    <ChallengeStatisticsSection challengeId={challengeId} />
                  </>
                ) : null}

                {activeTab === 'diary' ? (
                  <ChallengeDiaryList
                    id={id}
                    date={diaryDate}
                    clearHref={`/challenge/${id}?tab=diary`}
                  />
                ) : null}

                {activeTab === 'participants' ? (
                  <>
                    {isHost && pendingParticipants.length > 0 ? (
                      <Card radius="lg" className="border-main-300 p-5 md:p-6">
                        <div className="flex items-center gap-2">
                          <CircleAlert className="text-main-800 h-5 w-5" />
                          <Text
                            size="heading2"
                            weight="bold"
                            className="text-gray-900"
                          >
                            참여 인원 대기
                          </Text>
                          <Tag tone="brand" size="sm">
                            {pendingParticipants.length}명
                          </Tag>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {pendingParticipants.map((participant) => (
                            <PendingMemberItem
                              key={participant.participantId}
                              name={participant.nickname}
                              joinedAt={formatRelativeJoinedText(
                                participant.status
                              )}
                              profileImg={participant.profileImg}
                              goals={
                                isFreeChallenge ? participant.goals : undefined
                              }
                              onProfileClick={() =>
                                router.push(`/member/${participant.memberId}`)
                              }
                              onAccept={() =>
                                handleAcceptParticipant(
                                  participant.participantId
                                )
                              }
                              onReject={() =>
                                handleRejectParticipant(
                                  participant.participantId
                                )
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
                    onMemberClick={(memberId) =>
                      router.push(`/member/${memberId}`)
                    }
                    canPoke={canPokeMembers}
                    currentMemberId={currentMemberId}
                    currentNickname={currentNickname}
                    onPoke={handlePokeMember}
                    pokingMemberId={pokingMemberId}
                    pokedMemberIds={pokedMemberIds}
                  />
                  </>
                ) : null}
              </div>
            </div>

            {/* 우측 sticky rail: 진행률 CTA + 나가기 (탭과 무관하게 유지) */}
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
