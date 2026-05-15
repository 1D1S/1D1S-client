'use client';

import { Button, CircleAvatar, Text } from '@1d1s/design-system';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useUnreadCount } from '@feature/notification/hooks/useNotificationQueries';
import { cn } from '@module/utils/cn';
import { Bell, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ProfileStatProps {
  label: string;
  value: number;
}

function ProfileStat({ label, value }: ProfileStatProps): React.ReactElement {
  return (
    <div className="flex items-baseline gap-1.5">
      <Text size="body1" weight="bold" className="text-gray-900">
        {value}
      </Text>
      <Text size="caption1" weight="regular" className="text-gray-500">
        {label}
      </Text>
    </div>
  );
}

interface MyPageProfileCardProps {
  nickname: string;
  profileUrl: string;
  email?: string;
  totalDiaryCount: number;
  totalChallengeCount: number;
  completedFiniteChallengeCount: number;
  /** 모바일 3-col grid에서 스트릭 카운트 표시용 */
  currentStreak?: number;
  /** 우측 액션 영역 — 미지정 시 기본 (프로필 편집 + 설정) 사용 */
  actions?: React.ReactNode;
}

/**
 * 배너에 -60px 마진으로 겹쳐 올라오는 프로필 카드.
 * 좌측 96px 아바타 + 닉네임/핸들/스탯 + 우측 액션.
 */
export function MyPageProfileCard({
  nickname,
  profileUrl,
  email,
  totalDiaryCount,
  totalChallengeCount,
  completedFiniteChallengeCount,
  currentStreak,
  actions,
}: MyPageProfileCardProps): React.ReactElement {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const { data: unreadData } = useUnreadCount({ enabled: isLoggedIn });
  const hasUnread = isLoggedIn && (unreadData?.unreadCount ?? 0) > 0;
  const handle = email
    ? `@${email.split('@')[0]}`
    : `@${nickname}`;
  const defaultActions = (
    <>
      <Button
        variant="default"
        size="medium"
        onClick={() => router.push('/mypage/settings/profile')}
      >
        프로필 편집
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="medium"
        aria-label="설정"
        onClick={() => router.push('/mypage/settings')}
        className={cn(
          'h-10 w-10 p-0',
          'bg-gray-100 text-gray-600 hover:bg-gray-200',
        )}
      >
        <Settings className="h-4 w-4" />
      </Button>
    </>
  );

  return (
    <>
      {/* 모바일: 부모 컨테이너 패딩에 정렬, 72px 아바타 + 3-col stats grid */}
      <section className={cn('relative lg:hidden')}>
        <div className="flex min-h-8 items-center justify-end gap-1">
          {actions ?? (
            <>
              <button
                type="button"
                aria-label="알림"
                onClick={() => router.push('/notification')}
                className={cn(
                  'relative flex h-8 w-8 items-center justify-center',
                  'rounded-lg text-gray-500 transition-colors',
                  'hover:bg-gray-100',
                )}
              >
                <Bell className="h-[18px] w-[18px]" />
                {hasUnread ? (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute top-1.5 right-1.5 h-1.5 w-1.5',
                      'bg-brand rounded-full',
                    )}
                  />
                ) : null}
              </button>
              <button
                type="button"
                aria-label="설정"
                onClick={() => router.push('/mypage/settings')}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  'text-gray-500 transition-colors hover:bg-gray-100',
                )}
              >
                <Settings className="h-[18px] w-[18px]" />
              </button>
            </>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3.5">
          <div
            className={cn(
              'h-18 w-18 shrink-0 overflow-hidden rounded-full',
              'border-[3px] border-white',
            )}
          >
            <CircleAvatar imageUrl={profileUrl} size={66} />
          </div>
          <div className="min-w-0 flex-1">
            <Text size="heading1" weight="extrabold" className="text-gray-900">
              {nickname}
            </Text>
            <Text size="caption1" weight="regular" className="text-gray-500">
              {handle}
            </Text>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div
            className={cn(
              'border-main-200 rounded-[12px] border bg-white',
              'px-3 py-3 text-center',
            )}
          >
            <div className="text-main-800 text-[20px] font-extrabold">
              🔥 {currentStreak ?? 0}
            </div>
            <div className="mt-0.5 text-[10px] text-gray-500">스트릭</div>
          </div>
          <div
            className={cn(
              'rounded-[12px] border border-gray-200 bg-white',
              'px-3 py-3 text-center',
            )}
          >
            <div className="text-[20px] font-extrabold text-gray-900">
              {totalChallengeCount}
            </div>
            <div className="mt-0.5 text-[10px] text-gray-500">챌린지</div>
          </div>
          <div
            className={cn(
              'rounded-[12px] border border-gray-200 bg-white',
              'px-3 py-3 text-center',
            )}
          >
            <div className="text-[20px] font-extrabold text-gray-900">
              {totalDiaryCount}
            </div>
            <div className="mt-0.5 text-[10px] text-gray-500">일지</div>
          </div>
        </div>
      </section>

      {/* 데스크탑: hero 위에 -60px 마진으로 겹쳐 올라오는 카드.
          컨테이너 lg:py-10(40px top) 보정 위해 -mt-25(-100px)를 사용 */}
      <section
        className={cn(
          'rounded-4 relative -mt-25 hidden border border-gray-200 bg-white',
          'p-5 shadow-[0_6px_20px_rgba(0,0,0,0.06)]',
          'lg:flex lg:flex-row lg:items-center lg:gap-5 lg:p-6',
        )}
      >
        <div className="flex shrink-0 justify-center sm:block">
          <div
            className={cn(
              'h-24 w-24 overflow-hidden rounded-full border-4',
              'border-white shadow-md',
            )}
          >
            <CircleAvatar imageUrl={profileUrl} size={88} />
          </div>
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <Text size="display2" weight="bold" className="text-gray-900">
            {nickname}
          </Text>
          <div className="mt-1">
            <Text size="caption1" weight="regular" className="text-gray-500">
              {handle}
            </Text>
          </div>
          <div
            className={cn(
              'mt-3 flex flex-wrap justify-center gap-4',
              'sm:justify-start',
            )}
          >
            <ProfileStat label="작성한 일지" value={totalDiaryCount} />
            <ProfileStat label="참여 챌린지" value={totalChallengeCount} />
            <ProfileStat
              label="완료 챌린지"
              value={completedFiniteChallengeCount}
            />
          </div>
        </div>

        <div
          className={cn(
            'flex shrink-0 items-center gap-2',
            'justify-center sm:justify-end',
          )}
        >
          {actions ?? defaultActions}
        </div>
      </section>
    </>
  );
}
