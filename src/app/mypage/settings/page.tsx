'use client';

import {
  Button,
  CircleAvatar,
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
  useUpdateNickname,
  useUpdateProfileImage,
} from '@feature/member/hooks/use-member-mutations';
import { useMyPage } from '@feature/member/hooks/use-member-queries';
import { Camera, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

export default function AccountSettingsPage(): React.ReactElement {
  const router = useRouter();
  const logout = useLogout();
  const { data } = useMyPage();

  const [nickname, setNickname] = useState('');
  const [profilePreview, setProfilePreview] = useState('');
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);

  const updateNickname = useUpdateNickname();
  const updateProfileImage = useUpdateProfileImage();

  useEffect(() => {
    if (data && !isInitialized.current) {
      isInitialized.current = true;
      const timerId = window.setTimeout(() => {
        setNickname(data.nickname ?? '');
        setProfilePreview(data.profileUrl ?? '');
      }, 0);
      return () => window.clearTimeout(timerId);
    }
    return undefined;
  }, [data]);

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setProfilePreview(URL.createObjectURL(file));
    updateProfileImage.mutate(file);
  };

  const handleNicknameSave = (): void => {
    const trimmed = nickname.trim();
    if (!trimmed || trimmed === data?.nickname) {
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <section className="rounded-3 w-full bg-white p-2">
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
                <div className="relative">
                  <CircleAvatar imageUrl={profilePreview} size="lg" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updateProfileImage.isPending}
                    className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-700 text-white transition hover:bg-gray-900 disabled:opacity-50"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </div>
                <Text
                  size="caption1"
                  weight="regular"
                  className="text-gray-400"
                >
                  {updateProfileImage.isPending
                    ? '업로드 중...'
                    : '사진을 클릭해 변경하세요'}
                </Text>
              </div>

              {/* 닉네임 */}
              <div className="flex flex-col gap-2">
                <Text size="body1" weight="medium" className="text-gray-700">
                  닉네임
                </Text>
                <div className="flex gap-2">
                  <TextField
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
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
                      nickname.trim() === data?.nickname
                    }
                    className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-40"
                  >
                    {updateNickname.isPending ? '저장 중...' : '저장'}
                  </button>
                </div>
                {updateNickname.isSuccess && (
                  <Text
                    size="caption1"
                    weight="regular"
                    className="text-green-600"
                  >
                    닉네임이 변경되었습니다.
                  </Text>
                )}
                {updateNickname.isError && (
                  <Text
                    size="caption1"
                    weight="regular"
                    className="text-red-500"
                  >
                    닉네임 변경에 실패했습니다.
                  </Text>
                )}
              </div>
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
              disabled={logout.isPending}
              className="flex w-full items-center gap-3 px-5 py-4 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
            >
              <LogOut className="h-5 w-5" />
              <Text size="body1" weight="medium">
                {logout.isPending ? '로그아웃 중...' : '로그아웃'}
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
              disabled={logout.isPending}
            >
              취소
            </Button>
            <Button
              size="medium"
              className="flex-1"
              onClick={confirmLogout}
              disabled={logout.isPending}
            >
              {logout.isPending ? '로그아웃 중...' : '로그아웃'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
