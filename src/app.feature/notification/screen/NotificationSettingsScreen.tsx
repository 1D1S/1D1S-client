'use client';

import { Text, Toggle } from '@1d1s/design-system';
import { SubPageShell } from '@component/layout/SubPageShell';
import { cn } from '@module/utils/cn';
import React from 'react';

import { useUpdateNotificationPreferences } from '../hooks/useNotificationMutations';
import { useNotificationPreferences } from '../hooks/useNotificationQueries';
import { NotificationPreferences } from '../type/notification';

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onChange(next: boolean): void;
}

function ToggleRow({
  label,
  description,
  value,
  disabled = false,
  onChange,
}: ToggleRowProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className={cn('flex flex-col gap-0.5', disabled && 'opacity-40')}>
        <Text size="body1" weight="medium" className="text-gray-800">
          {label}
        </Text>
        <Text size="caption1" weight="regular" className="text-gray-400">
          {description}
        </Text>
      </div>

      <Toggle
        checked={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="ml-4"
      />
    </div>
  );
}

export function NotificationSettingsScreen(): React.ReactElement {
  const { data, isLoading } = useNotificationPreferences();
  const { mutate: updatePreferences } = useUpdateNotificationPreferences();

  function handleChange(
    key: keyof NotificationPreferences,
    next: boolean
  ): void {
    if (!data) {
      return;
    }
    updatePreferences({ ...data, [key]: next });
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Text size="body1" weight="regular" className="text-gray-400">
          불러오는 중...
        </Text>
      </div>
    );
  }

  return (
    <SubPageShell title="알림 설정">
      <div className="flex flex-col gap-3">
        <section className="rounded-4 border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <Text size="body1" weight="bold" className="text-gray-500">
              푸시 알림
            </Text>
          </div>

          <ToggleRow
            label="전체 푸시 알림"
            description="기기로 푸시 알림을 받습니다"
            value={data.pushEnabled}
            onChange={(next) => handleChange('pushEnabled', next)}
          />
        </section>

        <section className="rounded-4 border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <Text size="body1" weight="bold" className="text-gray-500">
              카테고리별 알림
            </Text>
          </div>

          <div className="divide-y divide-gray-100">
            <ToggleRow
              label="친구 알림"
              description="친구 신청·수락 알림을 받습니다"
              value={data.friendEnabled}
              disabled={!data.pushEnabled}
              onChange={(next) => handleChange('friendEnabled', next)}
            />
            <ToggleRow
              label="일지 알림"
              description="일지 댓글·좋아요 알림을 받습니다"
              value={data.diaryEnabled}
              disabled={!data.pushEnabled}
              onChange={(next) => handleChange('diaryEnabled', next)}
            />
            <ToggleRow
              label="챌린지 알림"
              description="챌린지 승인·거절 알림을 받습니다"
              value={data.challengeEnabled}
              disabled={!data.pushEnabled}
              onChange={(next) => handleChange('challengeEnabled', next)}
            />
            {/* 방별 종 토글 위의 상위 스위치다 — 여기서 끄면 어느 방도 안 온다. */}
            <ToggleRow
              label="채팅 알림"
              description="그룹 채팅 새 메시지 알림을 받습니다"
              value={data.chatEnabled}
              disabled={!data.pushEnabled}
              onChange={(next) => handleChange('chatEnabled', next)}
            />
          </div>
        </section>
      </div>
    </SubPageShell>
  );
}
