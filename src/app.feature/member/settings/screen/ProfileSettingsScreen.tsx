'use client';

import {
  AvatarImagePicker,
  Button,
  Text,
  TextField,
} from '@1d1s/design-system';
import { NicknameCheckButton } from '@feature/member/components/NicknameCheckButton';
import {
  useCheckNickname,
  useUpdateNickname,
  useUpdateProfileImage,
} from '@feature/member/hooks/useMemberMutations';
import { useMyPage } from '@feature/member/hooks/useMemberQueries';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import { validateNickname } from '@module/utils/nickname';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

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

export default function ProfileSettingsScreen(): React.ReactElement {
  const router = useRouter();
  const { data } = useMyPage();

  const [editedNickname, setEditedNickname] = useState<string | undefined>();
  const [nicknameError, setNicknameError] = useState('');
  const [localProfilePreview, setLocalProfilePreview] = useState<
    string | undefined
  >();

  const nickname = editedNickname ?? data?.nickname ?? '';
  const profilePreview = localProfilePreview ?? data?.profileUrl ?? '';

  const updateNickname = useUpdateNickname();
  const updateProfileImage = useUpdateProfileImage();
  const checkNickname = useCheckNickname();

  const trimmedNickname = nickname.trim();
  const isSameAsCurrent = trimmedNickname === data?.nickname;
  const isFormatValid =
    !validateNickname(trimmedNickname) && !isSameAsCurrent;
  const checkedNickname = checkNickname.variables;
  const isCheckCurrent = checkedNickname === trimmedNickname;
  const showCheckSuccess = isCheckCurrent && checkNickname.isSuccess;
  const showCheckError = isCheckCurrent && checkNickname.isError;
  const isVerified = showCheckSuccess;

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
    checkNickname.reset();
    setEditedNickname(value);
    setNicknameError(validateNickname(value));
  };

  const handleCheckNickname = (): void => {
    if (!isFormatValid) {
      return;
    }
    checkNickname.mutate(trimmedNickname);
  };

  const handleNicknameSave = (): void => {
    const error = validateNickname(trimmedNickname);
    if (error) {
      setNicknameError(error);
      return;
    }
    if (isSameAsCurrent || !isVerified) {
      return;
    }
    updateNickname.mutate(trimmedNickname);
  };

  return (
    <div className="min-h-screen w-full pt-14 lg:pt-0">
      {/* 모바일 fixed 헤더 — ← + 프로필 설정 */}
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
          프로필 설정
        </Text>
      </div>

      <section className="mx-auto w-full max-w-[980px] p-4 lg:p-6">
        <div className="hidden border-b border-gray-200 pb-5 lg:block">
          <Text
            size="pageTitle"
            weight="extrabold"
            className="tracking-tight text-gray-900"
          >
            프로필 설정
          </Text>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <section className="rounded-4 border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <Text size="body1" weight="bold" className="text-gray-500">
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
                    iconRight={
                      <NicknameCheckButton
                        onClick={handleCheckNickname}
                        disabled={!isFormatValid || isVerified}
                        isPending={checkNickname.isPending}
                      />
                    }
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
                      !trimmedNickname ||
                      Boolean(nicknameError) ||
                      isSameAsCurrent ||
                      !isVerified
                    }
                    className="shrink-0 whitespace-nowrap"
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
                ) : showCheckError ? (
                  <Text
                    size="caption1"
                    weight="regular"
                    className="text-red-500"
                  >
                    {normalizeApiError(checkNickname.error).message}
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
                ) : showCheckSuccess ? (
                  <Text
                    size="caption1"
                    weight="regular"
                    className="text-green-600"
                  >
                    ✅ 사용 가능한 닉네임이에요
                  </Text>
                ) : null}
              </div>

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
                          className={cn(
                            'inline-flex shrink-0 items-center',
                            'justify-center rounded-lg px-3 py-2',
                            config.bg,
                            config.textColor
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
        </div>
      </section>
    </div>
  );
}
