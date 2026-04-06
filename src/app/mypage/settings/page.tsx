'use client';

import {
  AvatarImagePicker,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Text,
  TextField,
} from '@1d1s/design-system';
import { useLogout } from '@feature/auth/hooks/use-auth-mutations';
import {
  useDeleteMember,
  useUpdateNickname,
  useUpdateProfileImage,
} from '@feature/member/hooks/use-member-mutations';
import { useMyPage } from '@feature/member/hooks/use-member-queries';
import { notifyApiError } from '@module/api/error';
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

export default function AccountSettingsPage(): React.ReactElement {
  const router = useRouter();
  const logout = useLogout();
  const { data } = useMyPage();

  // 서버 데이터를 기반으로 파생: 사용자가 편집하면 editedNickname에 저장
  const [editedNickname, setEditedNickname] = useState<string | undefined>();
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
        toast.success(response.message ?? '회원 탈퇴가 완료되었습니다.');
        router.replace('/login');
      },
      onError: (error) => {
        notifyApiError(error);
      },
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <section className="rounded-3 mx-auto w-full max-w-[980px] bg-white p-2">
        <div className="flex items-start justify-between border-b border-gray-200 pb-5">
          <Text size="display1" weight="bold" className="text-gray-900">
            계정 설정
          </Text>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {/* 프로필 편집 */}
          <section className="rounded-4 border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <Text size="body1" weight="bold" className="text-gray-500">
                프로필
              </Text>
            </div>

            <div className="flex flex-col gap-6 px-5 py-5">
              {/* 프로필 사진 */}
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

              {/* 닉네임 */}
              <div className="flex flex-col gap-2">
                <Text size="body1" weight="medium" className="text-gray-700">
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
                  <button
                    type="button"
                    onClick={handleNicknameSave}
                    disabled={
                      updateNickname.isPending ||
                      !nickname.trim() ||
                      Boolean(nicknameError) ||
                      nickname.trim() === data?.nickname
                    }
                    className="g900 shripx-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-40"
                  >
                    {updateNickname.isPending ? '저장 중...' : '저장'}
                  </button>
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

              {/* 연동 계정 */}
              {data?.provider && (
                <div className="flex flex-col gap-2">
                  <Text size="body1" weight="medium" className="text-gray-700">
                    연동 계정
                  </Text>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const config = PROVIDER_CONFIG[data.provider];
                      return (
                        <span
                          className={`inline-flex shrink-0 items-center justify-center rounded-lg px-3 py-2 ${config.bg} ${config.textColor}`}
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

          {/* 계정 */}
          <section className="rounded-4 border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <Text size="body1" weight="bold" className="text-gray-500">
                계정
              </Text>
            </div>

            <button
              type="button"
              onClick={() => setIsLogoutDialogOpen(true)}
              disabled={logout.isPending || deleteMember.isPending}
              className="flex w-full items-center gap-3 px-5 py-4 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
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
              disabled={logout.isPending || deleteMember.isPending}
              className="flex w-full items-center gap-3 px-5 py-4 text-gray-500 transition hover:bg-gray-50"
            >
              <UserMinus className="h-5 w-5" />
              <Text size="body1" weight="medium" className="text-gray-600">
                회원탈퇴
              </Text>
            </button>
          </section>
        </div>
      </section>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="gap-6 px-8 py-6 sm:max-w-[380px] sm:px-6">
          <DialogHeader className="items-center text-center sm:text-center">
            <DialogTitle>로그아웃 하시겠어요?</DialogTitle>
          </DialogHeader>

          <DialogDescription className="block w-full text-center">
            현재 계정에서 로그아웃됩니다.
          </DialogDescription>

          <DialogFooter className="flex-row gap-2">
            <Button
              size="medium"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsLogoutDialogOpen(false)}
              disabled={logout.isPending || deleteMember.isPending}
            >
              취소
            </Button>
            <Button
              size="medium"
              className="flex-1"
              onClick={confirmLogout}
              disabled={logout.isPending || deleteMember.isPending}
            >
              {logout.isPending ? '로그아웃 중...' : '로그아웃'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}
      >
        <DialogContent className="gap-6 px-8 py-6 sm:max-w-[380px] sm:px-6">
          <DialogHeader className="items-center text-center sm:text-center">
            <DialogTitle>회원탈퇴 하시겠어요?</DialogTitle>
          </DialogHeader>

          <DialogDescription className="block w-full text-center">
            회원 탈퇴 요청 후 계정 삭제는 7일 뒤 처리됩니다.
          </DialogDescription>

          <DialogFooter className="flex-row gap-2">
            <Button
              size="medium"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsWithdrawDialogOpen(false)}
              disabled={deleteMember.isPending || logout.isPending}
            >
              취소
            </Button>
            <Button
              size="medium"
              className="flex-1"
              onClick={confirmWithdraw}
              disabled={deleteMember.isPending || logout.isPending}
            >
              {deleteMember.isPending ? '처리 중...' : '회원탈퇴'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
