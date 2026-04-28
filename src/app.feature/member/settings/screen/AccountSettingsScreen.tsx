'use client';

import {
  AvatarImagePicker,
  Button,
  Text,
  TextField,
} from '@1d1s/design-system';
import { useLogout } from '@feature/auth/hooks/useAuthMutations';
import {
  useDeleteMember,
  useUpdateNickname,
  useUpdateProfileImage,
} from '@feature/member/hooks/useMemberMutations';
import { useMyPage } from '@feature/member/hooks/useMemberQueries';
import {
  ConfirmDialog,
} from '@feature/member/settings/components/ConfirmDialog';
import { notifyApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import { validateNickname } from '@module/utils/nickname';
import { LogOut, UserMinus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const PROVIDER_CONFIG = {
  KAKAO: {
    label: '카카오',
    bg: 'bg-[#FEE500]',
    textColor: 'text-black',
    icon: '/images/kakao-logo.png',
  },
  NAVER: {
    label: '네이버',
    bg: 'bg-[#03C75A]',
    textColor: 'text-white',
    icon: '/images/naver-logo.png',
  },
  GOOGLE: {
    label: '구글',
    bg: 'bg-white border border-gray-300',
    textColor: 'text-gray-700',
    icon: null,
  },
} as const;

export default function AccountSettingsScreen(): React.ReactElement {
  const router = useRouter();
  const logout = useLogout();
  const { data } = useMyPage();

  const [editedNickname, setEditedNickname] = useState<
    string | undefined
  >();
  const [nicknameError, setNicknameError] = useState('');
  const [localProfilePreview, setLocalProfilePreview] = useState<
    string | undefined
  >();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  const nickname = editedNickname ?? data?.nickname ?? '';
  const profilePreview = localProfilePreview ?? data?.profileUrl ?? '';

  const updateNickname = useUpdateNickname();
  const updateProfileImage = useUpdateProfileImage();
  const deleteMember = useDeleteMember();

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setLocalProfilePreview(URL.createObjectURL(file));
    updateProfileImage.mutate(file);
  };

  const handleNicknameChange = (value: string): void => {
    updateNickname.reset();
    setEditedNickname(value);
    setNicknameError(validateNickname(value));
  };

  const handleNicknameSave = (): void => {
    const trimmed = nickname.trim();
    const error = validateNickname(trimmed);
    if (error) {
      setNicknameError(error);
      return;
    }
    if (trimmed === data?.nickname) {
      return;
    }
    updateNickname.mutate(trimmed);
  };

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
        toast.success(
          response.message ?? '회원 탈퇴가 완료되었습니다.'
        );
        router.replace('/login');
      },
      onError: (error) => {
        notifyApiError(error);
      },
    });
  };

  const isAnySending = logout.isPending || deleteMember.isPending;

  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <section
        className="rounded-3 mx-auto w-full max-w-[980px] bg-white p-2"
      >
        <div
          className={cn(
            'flex items-start justify-between',
            'border-b border-gray-200 pb-5',
          )}
        >
          <Text size="display1" weight="bold" className="text-gray-900">
            계정 설정
          </Text>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <section className="rounded-4 border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <Text
                size="body1"
                weight="bold"
                className="text-gray-500"
              >
                프로필
              </Text>
            </div>

            <div className="flex flex-col gap-6 px-5 py-5">
              <div className="flex flex-col items-center gap-3">
                <AvatarImagePicker
                  size={160}
                  defaultImageUrl={profilePreview || undefined}
                  changeLabel="변경"
                  onChange={handleProfileImageChange}
                />
                {updateProfileImage.isPending && (
                  <Text
                    size="caption1"
                    weight="regular"
                    className="text-gray-400"
                  >
                    업로드 중...
                  </Text>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Text
                  size="body1"
                  weight="medium"
                  className="text-gray-700"
                >
                  닉네임
                </Text>
                <div className="flex gap-2">
                  <TextField
                    value={nickname}
                    onChange={(event) =>
                      handleNicknameChange(event.target.value)
                    }
                    placeholder="닉네임을 입력하세요"
                    className="flex-1"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleNicknameSave();
                      }
                    }}
                  />
                  <Button
                    size="small"
                    onClick={handleNicknameSave}
                    disabled={
                      updateNickname.isPending ||
                      !nickname.trim() ||
                      Boolean(nicknameError) ||
                      nickname.trim() === data?.nickname
                    }
                  >
                    {updateNickname.isPending ? '저장 중...' : '저장'}
                  </Button>
                </div>
                {nicknameError ? (
                  <Text
                    size="caption1"
                    weight="regular"
                    className="text-red-500"
                  >
                    {nicknameError}
                  </Text>
                ) : updateNickname.isSuccess ? (
                  <Text
                    size="caption1"
                    weight="regular"
                    className="text-green-600"
                  >
                    닉네임이 변경되었습니다.
                  </Text>
                ) : updateNickname.isError ? (
                  <Text
                    size="caption1"
                    weight="regular"
                    className="text-red-500"
                  >
                    닉네임 변경에 실패했습니다.
                  </Text>
                ) : null}
              </div>

              {data?.provider && (
                <div className="flex flex-col gap-2">
                  <Text
                    size="body1"
                    weight="medium"
                    className="text-gray-700"
                  >
                    연동 계정
                  </Text>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const config = PROVIDER_CONFIG[data.provider];
                      return (
                        <span
                          className={cn(
                            'inline-flex shrink-0 items-center',
                            'justify-center rounded-lg px-3 py-2',
                            config.bg,
                            config.textColor,
                          )}
                        >
                          {config.icon ? (
                            <Image
                              src={config.icon}
                              alt={config.label}
                              width={20}
                              height={20}
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {config.label}
                            </span>
                          )}
                        </span>
                      );
                    })()}
                    <TextField
                      value={data.email}
                      readOnly
                      className="flex-1 text-gray-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-4 border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <Text
                size="body1"
                weight="bold"
                className="text-gray-500"
              >
                계정
              </Text>
            </div>

            <button
              type="button"
              onClick={() => setIsLogoutDialogOpen(true)}
              disabled={isAnySending}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3',
                'px-5 py-4 text-red-500 transition hover:bg-red-50',
                'disabled:opacity-50',
              )}
            >
              <LogOut className="h-5 w-5" />
              <Text size="body1" weight="medium">
                {logout.isPending ? '로그아웃 중...' : '로그아웃'}
              </Text>
            </button>

            <div className="h-px w-full bg-gray-100" />

            <button
              type="button"
              onClick={() => setIsWithdrawDialogOpen(true)}
              disabled={isAnySending}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3',
                'px-5 py-4 text-gray-500 transition hover:bg-gray-50',
              )}
            >
              <UserMinus className="h-5 w-5" />
              <Text
                size="body1"
                weight="medium"
                className="text-gray-600"
              >
                회원 탈퇴
              </Text>
            </button>
          </section>
        </div>
      </section>

      <ConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
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
