'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

import {
  useUpdateNotificationPreferences,
} from '../hooks/useNotificationMutations';
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
    <div
      className={cn(
        'flex items-center justify-between px-5 py-4',
        disabled && 'opacity-40',
      )}
    >
      <div className="flex flex-col gap-0.5">
        <Text size="body1" weight="medium" className="text-gray-800">
          {label}
        </Text>
        <Text size="caption1" weight="regular" className="text-gray-400">
          {description}
        </Text>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={cn(
          'relative ml-4 inline-flex h-6 w-11 shrink-0',
          'cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200',
          'focus-visible:ring-2 focus-visible:outline-none',
          'focus-visible:ring-main-800',
          value ? 'bg-main-800' : 'bg-gray-200',
          disabled && 'cursor-not-allowed',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full',
            'bg-white shadow-sm transition-transform duration-200',
            value ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

export function NotificationSettingsScreen(): React.ReactElement {
  const { data, isLoading } = useNotificationPreferences();
  const { mutate: updatePreferences } = useUpdateNotificationPreferences();

  function handleChange(
    key: keyof NotificationPreferences,
    next: boolean,
  ): void {
    if (!data) { return; }
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
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <section className="mx-auto w-full max-w-[980px] bg-white p-2">
        <div className="border-b border-gray-200 pb-5">
          <Text size="display1" weight="bold" className="text-gray-900">
            알림 설정
          </Text>
        </div>

        <div className="mt-6 flex flex-col gap-3">
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
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
