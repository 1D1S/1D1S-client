'use client';

import { Button, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react';
import React from 'react';

import {
  useUpdateNotificationPreferences,
} from '../hooks/useNotificationMutations';
import { useNotificationPreferences } from '../hooks/useNotificationQueries';
import { useWebPushSubscription } from '../hooks/useWebPushSubscription';
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

interface WebPushLabelEntry { icon: React.ReactElement; text: string }

const WEB_PUSH_LABEL: Record<string, WebPushLabelEntry> = {
  subscribed: {
    icon: <BellRing className="text-main-800 h-5 w-5" />,
    text: '브라우저 알림이 허용되어 있습니다',
  },
  denied: {
    icon: <BellOff className="h-5 w-5 text-gray-400" />,
    text: '브라우저에서 알림을 차단했습니다. 브라우저 설정에서 허용해 주세요.',
  },
  error: {
    icon: <BellOff className="h-5 w-5 text-red-400" />,
    text: '알림 구독 중 오류가 발생했습니다. 다시 시도해 주세요.',
  },
};

export function NotificationSettingsScreen(): React.ReactElement {
  const { data, isLoading } = useNotificationPreferences();
  const { mutate: updatePreferences } = useUpdateNotificationPreferences();
  const { status, subscribe } = useWebPushSubscription();

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
    <div className="flex min-h-screen w-full flex-col p-4">
      <section className="mx-auto w-full max-w-[980px] p-2">
        <div className="border-b border-gray-200 pb-5">
          <Text size="display1" weight="bold" className="text-gray-900">
            알림 설정
          </Text>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <section className="rounded-4 border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <Text size="body1" weight="bold" className="text-gray-500">
                브라우저 알림
              </Text>
            </div>
            <div className="px-5 py-4">
              {status === 'idle' || status === 'loading' ? (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Text size="body1" weight="medium" className="text-gray-800">
                      브라우저 알림 허용
                    </Text>
                    <Text size="caption1" weight="regular" className="text-gray-400">
                      이 기기 브라우저로 실시간 알림을 받습니다
                    </Text>
                  </div>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={status === 'loading'}
                    onClick={() => { void subscribe(); }}
                  >
                    {status === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                    {status === 'loading' ? '처리 중...' : '알림 허용'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {WEB_PUSH_LABEL[status]?.icon}
                  <Text
                    size="body2"
                    weight="regular"
                    className={cn(
                      status === 'subscribed' ? 'text-gray-700' : 'text-gray-500',
                    )}
                  >
                    {WEB_PUSH_LABEL[status]?.text}
                  </Text>
                </div>
              )}
            </div>
          </section>

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
