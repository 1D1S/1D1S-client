'use client';

import { Icon, StreakHero } from '@1d1s/design-system';
import { Skeleton } from '@component/Skeleton';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';

const CHALLENGE_DETAIL_PATH_REGEX = /^\/challenge\/(\d+)(?:\/|$)/;

interface ChallengeProgressItem {
  id: string;
  title: string;
  progress: number;
  hasDeadline: boolean;
}

interface AppRightRailProps {
  isLoggedIn: boolean;
  isAuthLoading?: boolean;
  nickname: string;
  handle?: string;
  profileImageUrl?: string;
  streakDays: number;
  todayGoalCount: number;
  challenges: ChallengeProgressItem[];
  onChallengeClick(id: string): void;
}

const ASIDE_CLASS = cn(
  'sticky top-[62px] grid h-[calc(100vh-62px)] w-[280px]',
  'shrink-0 overflow-y-auto border-l border-gray-200 bg-white'
);

const PANEL_CLASS = cn(
  'flex flex-col gap-4 p-5 [grid-area:1/1]',
  'transition-opacity duration-300 ease-out'
);

function RightRailSkeleton({
  visible,
}: {
  visible: boolean;
}): React.ReactElement {
  return (
    <div
      aria-busy="true"
      aria-hidden={!visible}
      className={cn(
        PANEL_CLASS,
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" className="h-12 w-12" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton shape="text" className="h-3.5 w-24" />
          <Skeleton shape="text" className="h-3 w-16" />
        </div>
      </div>
      <Skeleton shape="rounded" className="h-[88px] w-full" />
      <div>
        <Skeleton shape="text" className="mb-2 h-3 w-24" />
        <div className="flex flex-col gap-2">
          <Skeleton shape="rounded" className="h-12 w-full" />
          <Skeleton shape="rounded" className="h-12 w-full" />
          <Skeleton shape="rounded" className="h-12 w-full" />
        </div>
      </div>
      <Skeleton shape="rounded" className="mt-auto h-10 w-full" />
    </div>
  );
}

export default function AppRightRail({
  isLoggedIn,
  isAuthLoading = false,
  nickname,
  handle,
  profileImageUrl,
  streakDays,
  todayGoalCount,
  challenges,
  onChallengeClick,
}: AppRightRailProps): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  // 일지 작성 화면(/diary/create)에서는 우측 레일의 "일지 쓰기" CTA 를 아예
  // 렌더하지 않는다. 이미 작성 중이라 중복이고, 기존엔 작성 화면 하단 고정
  // 바에 "가려지기만" 해서 스크롤하면 다시 보이는 구조였다.
  const isDiaryWritePage = pathname?.startsWith('/diary/create') ?? false;
  const contentVisible = !isAuthLoading;
  const contentHidden = !contentVisible;

  // 사용자가 참여 중인 챌린지 id 집합. `challenges` 는 사이드바 데이터에서
  // 내려온 "참여 중인 챌린지" 목록이므로 여기에 포함된 챌린지에 대해서만
  // 해당 챌린지 일지로 직행한다. (id 는 사이드바에서 String 으로 정규화됨)
  const participatingChallengeIds = useMemo(
    () => new Set(challenges.map((challenge) => challenge.id)),
    [challenges]
  );

  // 일지 쓰기 라우팅 규칙:
  //   - 챌린지 상세 경로(`/challenge/:id...`) 에 있고 그 챌린지에 참여 중 → 해당 챌린지의 일지로
  //   - 그 외(미참여 챌린지 상세 포함) → 일반 일지 쓰기 페이지
  const handleWriteDiaryClick = useCallback((): void => {
    const challengeIdMatch = pathname?.match(CHALLENGE_DETAIL_PATH_REGEX);
    const challengeId = challengeIdMatch?.[1];
    const isParticipating = challengeId
      ? participatingChallengeIds.has(challengeId)
      : false;
    router.push(
      isParticipating
        ? `/diary/create?challengeId=${challengeId}`
        : '/diary/create'
    );
  }, [pathname, router, participatingChallengeIds]);

  return (
    <aside className={ASIDE_CLASS}>
      <RightRailSkeleton visible={isAuthLoading} />

      {!isLoggedIn ? (
        <div
          aria-hidden={contentHidden}
          className={cn(
            PANEL_CLASS,
            contentVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          <button
            type="button"
            onClick={() => router.push('/login')}
            aria-label="로그인 페이지로 이동"
            tabIndex={contentHidden ? -1 : 0}
            className={cn(
              'group flex flex-col items-stretch gap-3 p-5 text-center',
              'rounded-3 border-main-200 bg-main-100 border',
              'transition hover:brightness-105'
            )}
          >
            <span
              aria-hidden
              className={cn(
                'inline-flex items-center justify-center',
                'animate-flame-flicker text-red-500'
              )}
            >
              <Icon name="Flame" size={28} />
            </span>
            <span className="text-[13px] font-extrabold text-gray-900">
              게스트
            </span>
            <span className="text-[11px] leading-relaxed text-gray-600">
              로그인 후 스트릭과 오늘의 목표를
              <br />
              확인할 수 있어요.
            </span>
            <span
              className={cn(
                'mt-1 inline-flex w-full items-center justify-center',
                'rounded-2 bg-brand px-3 py-2',
                'text-[12px] font-bold text-white',
                'transition group-hover:brightness-105'
              )}
            >
              로그인하고 시작하기
            </span>
          </button>
        </div>
      ) : (
        <div
          aria-hidden={contentHidden}
          className={cn(
            PANEL_CLASS,
            contentVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          {/* Profile card */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/mypage')}
              tabIndex={contentHidden ? -1 : 0}
              aria-label="마이페이지로 이동"
              className={cn(
                'rounded-2 -m-1 flex min-w-0 flex-1 items-center gap-3 p-1',
                'text-left transition hover:bg-gray-50'
              )}
            >
              <span
                className={cn(
                  'h-12 w-12 shrink-0 overflow-hidden rounded-full',
                  'border-main-200 bg-main-100 border-2'
                )}
              >
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl}
                    alt={nickname}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    'truncate text-[14px] font-extrabold text-gray-900'
                  )}
                >
                  {nickname}
                </div>
                {handle ? (
                  <div className="truncate text-[11px] text-gray-500">
                    {handle}
                  </div>
                ) : null}
              </div>
            </button>
            <button
              type="button"
              aria-label="설정"
              onClick={() => router.push('/mypage/settings')}
              tabIndex={contentHidden ? -1 : 0}
              className="text-gray-500 transition hover:text-gray-700"
            >
              <Icon name="Settings" size={16} />
            </button>
          </div>

          {/* Streak hero */}
          <StreakHero
            days={streakDays}
            icon={
              <Icon
                name="Flame"
                size={22}
                aria-hidden
                className="animate-flame-flicker text-red-500"
              />
            }
            meta={`오늘의 목표 ${todayGoalCount}개`}
          />

          {/* Active challenges */}
          <div>
            <div
              className={cn(
                'mb-2 text-[12px] font-extrabold tracking-tight text-gray-900'
              )}
            >
              진행 중인 챌린지
            </div>
            {challenges.length === 0 ? (
              <p className="text-[11px] text-gray-500">
                아직 참여 중인 챌린지가 없어요.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {challenges.slice(0, 5).map((challenge) => {
                  // 무기한 챌린지는 진행률이 없으므로 주황 막대를 가득
                  // 채우고, 기한이 있으면 진행률 만큼만 채운다.
                  const fillWidth = challenge.hasDeadline
                    ? challenge.progress
                    : 100;
                  return (
                    <button
                      key={challenge.id}
                      type="button"
                      onClick={() => onChallengeClick(challenge.id)}
                      tabIndex={contentHidden ? -1 : 0}
                      className={cn(
                        'rounded-2 flex flex-col gap-1.5 p-2 text-left',
                        'transition hover:bg-gray-50'
                      )}
                    >
                      <span className="truncate text-[12px] font-bold text-gray-900">
                        {challenge.title}
                      </span>
                      <span className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <span
                          className="bg-brand block h-full"
                          style={{ width: `${fillWidth}%` }}
                        />
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {challenge.hasDeadline
                          ? `${challenge.progress}% 진행`
                          : '무기한'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!isDiaryWritePage && (
            <button
              type="button"
              onClick={handleWriteDiaryClick}
              tabIndex={contentHidden ? -1 : 0}
              className={cn(
                'rounded-2 bg-brand mt-auto py-2.5',
                'text-[12px] font-bold text-white transition',
                'hover:brightness-105'
              )}
            >
              + 일지 쓰기
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
