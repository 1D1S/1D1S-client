'use client';

import { Text } from '@1d1s/design-system';
import { useLogout } from '@feature/auth/hooks/useAuthMutations';
import { useDeleteMember } from '@feature/member/hooks/useMemberMutations';
import { ConfirmDialog } from '@feature/member/settings/components/ConfirmDialog';
import { notifyApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  LogOut,
  User,
  UserMinus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

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
    logout.mutate(undefined, {
      onSettled: () => {
        setIsLogoutDialogOpen(false);
        router.replace('/login');
      },
    });
  };

  const confirmWithdraw = (): void => {
    deleteMember.mutate(undefined, {
      onSuccess: (response) => {
        setIsWithdrawDialogOpen(false);
        toast.success(response.message ?? '회원 탈퇴가 완료되었습니다.');
        router.replace('/login');
      },
      onError: (error) => {
        notifyApiError(error);
      },
    });
  };

  return (
    <div className="min-h-screen w-full pt-14 lg:pt-0">
      {/* 모바일 fixed 헤더 — ← + 설정 */}
      <div
        className={cn(
          'fixed top-0 right-0 left-0 z-30 flex h-14 items-center gap-3',
          'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
          'lg:hidden'
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="body1"
          weight="extrabold"
          className="flex-1 tracking-[-0.3px] text-gray-900"
        >
          설정
        </Text>
      </div>

      <section className="mx-auto w-full max-w-[980px] p-4 lg:p-6">
        <div
          className={cn(
            'hidden items-start justify-between lg:flex',
            'border-b border-gray-200 pb-5'
          )}
        >
          <Text
            size="pageTitle"
            weight="extrabold"
            className="tracking-tight text-gray-900"
          >
            설정
          </Text>
        </div>

        <div className="mt-6 flex flex-col gap-3">
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
            <div className="h-px w-full bg-gray-100" />
            <SettingsRow
              icon={<UserMinus className="h-5 w-5" />}
              label="회원 탈퇴"
              onClick={() => setIsWithdrawDialogOpen(true)}
              disabled={isAnySending}
              withChevron={false}
            />
          </section>
        </div>
      </section>

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
        description="회원 탈퇴 요청 후 계정 삭제는 7일 뒤 처리됩니다."
        confirmLabel="회원 탈퇴"
        pendingLabel="처리 중..."
        isPending={deleteMember.isPending}
        isDisabled={isAnySending}
        onCancel={() => setIsWithdrawDialogOpen(false)}
        onConfirm={confirmWithdraw}
      />
    </div>
  );
}
