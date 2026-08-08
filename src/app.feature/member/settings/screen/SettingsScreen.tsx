'use client';

import { Text } from '@1d1s/design-system';
import { SubPageShell } from '@component/layout/SubPageShell';
import { useLogout } from '@feature/auth/hooks/useAuthMutations';
import { useDeleteMember } from '@feature/member/hooks/useMemberMutations';
import { ConfirmDialog } from '@feature/member/settings/components/ConfirmDialog';
import { getApiErrorCode } from '@module/api/error';
import { notifyApiError } from '@module/api/errorNotify';
import { cn } from '@module/utils/cn';
import {
  Ban,
  Bell,
  BookOpen,
  ChevronRight,
  HelpCircle,
  LogOut,
  Megaphone,
  Trash2,
  Trophy,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

type SettingsRowTone = 'default' | 'danger';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  tone?: SettingsRowTone;
  onClick(): void;
  disabled?: boolean;
  withChevron?: boolean;
}

function SettingsRow({
  icon,
  label,
  description,
  tone = 'default',
  onClick,
  disabled,
  withChevron = true,
}: SettingsRowProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 px-5 py-4 text-left transition',
        'disabled:cursor-not-allowed disabled:opacity-50',
        tone === 'danger'
          ? 'text-red-500 hover:bg-red-50'
          : 'text-gray-800 hover:bg-gray-50'
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center',
          tone === 'danger' ? 'text-red-500' : 'text-gray-600'
        )}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <Text
          size="body1"
          weight="medium"
          className={cn(tone === 'danger' ? 'text-red-500' : 'text-gray-900')}
        >
          {label}
        </Text>
        {description ? (
          <Text
            size="caption2"
            weight="regular"
            className="mt-0.5 block text-gray-500"
          >
            {description}
          </Text>
        ) : null}
      </div>
      {withChevron ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
      ) : null}
    </button>
  );
}

export default function SettingsScreen(): React.ReactElement {
  const router = useRouter();
  const logout = useLogout();
  const deleteMember = useDeleteMember();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  const isAnySending = logout.isPending || deleteMember.isPending;

  const confirmLogout = (): void => {
    // 세션 정리는 mutate 의 onMutate 에서 즉시 끝난다. 로그아웃 POST 응답을
    // 기다리지 않고 바로 닫고 이동한다 — POST 가 느리거나 멈춰도 이전 정보가
    // 남거나 화면이 멈추지 않게.
    setIsLogoutDialogOpen(false);
    logout.mutate();
    router.replace('/login');
  };

  const confirmWithdraw = (): void => {
    deleteMember.mutate(undefined, {
      onSuccess: () => {
        // 성공 토스트는 useDeleteMember onSuccess 가 로그아웃 신호보다 먼저
        // 보낸다(순서 보장). 여기서 또 띄우면 중복이라 다이얼로그 정리·이동만.
        setIsWithdrawDialogOpen(false);
        router.replace('/login');
      },
      onError: (error) => {
        // TEMP(탈퇴 실패 진단): 실기기에서 실제 status+body 확보용. DELETE /member
        // 가 서버 즉시탈퇴 스펙과 맞는지 판단 후 제거한다.
        const axiosLike = error as {
          response?: { status?: number; data?: unknown };
          message?: string;
        };
        console.error('[withdraw-fail]', {
          status: axiosLike?.response?.status,
          code: getApiErrorCode(error),
          body: axiosLike?.response?.data,
          message: axiosLike?.message,
        });
        notifyApiError(error);
      },
    });
  };

  return (
    <SubPageShell title="설정">
      <div className="flex flex-col gap-3">
        <section
          className={cn(
            'overflow-hidden rounded-[14px] border border-gray-200 bg-white'
          )}
        >
          <SettingsRow
            icon={<User className="h-5 w-5" />}
            label="프로필 설정"
            description="닉네임·프로필 이미지·연동 계정"
            onClick={() => router.push('/mypage/settings/profile')}
          />
          <div className="h-px w-full bg-gray-100" />
          <SettingsRow
            icon={<Bell className="h-5 w-5" />}
            label="알림 설정"
            description="알림 수신 항목을 관리해요"
            onClick={() => router.push('/mypage/settings/notifications')}
          />
          <div className="h-px w-full bg-gray-100" />
          <SettingsRow
            icon={<Ban className="h-5 w-5" />}
            label="차단 관리"
            description="차단한 사용자를 확인하고 해제해요"
            onClick={() => router.push('/mypage/friend/blocked')}
          />
        </section>

        <section
          className={cn(
            'overflow-hidden rounded-[14px] border border-gray-200 bg-white'
          )}
        >
          <SettingsRow
            icon={<Megaphone className="h-5 w-5" />}
            label="공지사항"
            description="서비스 업데이트와 안내사항을 확인해요"
            onClick={() => router.push('/notice')}
          />
          <div className="h-px w-full bg-gray-100" />
          <SettingsRow
            icon={<BookOpen className="h-5 w-5" />}
            label="사용 가이드"
            description="1D1S 사용법을 5단계로 확인해요"
            onClick={() => router.push('/guide')}
          />
          <div className="h-px w-full bg-gray-100" />
          <SettingsRow
            icon={<Trophy className="h-5 w-5" />}
            label="공식 챌린지 안내"
            description="공식 챌린지 참여·보상 조건을 확인해요"
            onClick={() => router.push('/guide/official')}
          />
          <div className="h-px w-full bg-gray-100" />
          <SettingsRow
            icon={<HelpCircle className="h-5 w-5" />}
            label="문의하기"
            description="궁금한 점·불편한 점을 알려주세요"
            onClick={() => router.push('/inquiry')}
          />
        </section>

        <section
          className={cn(
            'overflow-hidden rounded-[14px] border border-gray-200 bg-white'
          )}
        >
          <SettingsRow
            icon={<LogOut className="h-5 w-5" />}
            label={logout.isPending ? '로그아웃 중...' : '로그아웃'}
            tone="danger"
            onClick={() => setIsLogoutDialogOpen(true)}
            disabled={isAnySending}
            withChevron={false}
          />
        </section>

        {/* App Store 5.1.1(v): 계정 삭제는 앱 안에서 명확히 도달 가능해야
            한다. 붉은 톤의 독립 카드로 분리해 눈에 띄게 하되 과하지 않게. */}
        <section
          className={cn(
            'overflow-hidden rounded-[14px] border border-red-200 bg-red-50/50'
          )}
        >
          <SettingsRow
            icon={<Trash2 className="h-5 w-5" />}
            label={deleteMember.isPending ? '탈퇴 처리 중...' : '회원 탈퇴'}
            description="계정과 모든 데이터를 영구 삭제해요"
            tone="danger"
            onClick={() => setIsWithdrawDialogOpen(true)}
            disabled={isAnySending}
          />
        </section>
      </div>

      <ConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        tone="brand"
        icon="LogIn"
        title="로그아웃 하시겠어요?"
        description="현재 계정에서 로그아웃됩니다."
        confirmLabel="로그아웃"
        pendingLabel="로그아웃 중..."
        isPending={logout.isPending}
        isDisabled={isAnySending}
        onCancel={() => setIsLogoutDialogOpen(false)}
        onConfirm={confirmLogout}
      />

      <ConfirmDialog
        open={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}
        tone="danger"
        icon="Close"
        title="회원 탈퇴 하시겠어요?"
        description="탈퇴하면 계정과 모든 데이터가 즉시 영구 삭제되며 복구할 수 없습니다."
        confirmLabel="회원 탈퇴"
        pendingLabel="처리 중..."
        isPending={deleteMember.isPending}
        isDisabled={isAnySending}
        onCancel={() => setIsWithdrawDialogOpen(false)}
        onConfirm={confirmWithdraw}
      />
    </SubPageShell>
  );
}
