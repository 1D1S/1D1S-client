'use client';

import { Button, Text, Toggle } from '@1d1s/design-system';
import { SubPageShell } from '@component/layout/SubPageShell';
import { toast } from '@module/providers/toast';
import { cn } from '@module/utils/cn';
import { Bell, BellOff, BellRing, ExternalLink, Loader2 } from 'lucide-react';
import React from 'react';

import { useUpdateNotificationPreferences } from '../hooks/useNotificationMutations';
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

interface WebPushLabelEntry {
  icon: React.ReactElement;
  text: string;
}

const WEB_PUSH_LABEL: Record<string, WebPushLabelEntry> = {
  subscribed: {
    icon: <BellRing className="text-main-800 h-5 w-5" />,
    text: '브라우저 알림이 허용되어 있습니다',
  },
  denied: {
    icon: <BellOff className="h-5 w-5 text-gray-400" />,
    text: '브라우저에서 알림을 차단했습니다. 아래 버튼으로 사이트별 설정을 열어 알림을 "허용" 으로 변경해 주세요.',
  },
  error: {
    icon: <BellOff className="h-5 w-5 text-red-400" />,
    text: '알림 구독 중 오류가 발생했습니다. 다시 시도해 주세요.',
  },
};

/**
 * 브라우저별 알림 설정 페이지 URL. 보안상 웹 페이지가 직접 navigate 할 수
 * 없으므로 클립보드 복사 및 새 탭 시도 용도로만 사용한다.
 */
function getBrowserSettingsUrl(): string | null {
  if (typeof navigator === 'undefined') {
    return null;
  }
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('edg/')) {
    return 'edge://settings/content/notifications';
  }
  if (ua.includes('opr/') || ua.includes('opera')) {
    return 'opera://settings/siteSettings/notifications';
  }
  if (ua.includes('firefox')) {
    return 'about:preferences#privacy';
  }
  if (ua.includes('chrome') || ua.includes('chromium')) {
    return 'chrome://settings/content/notifications';
  }
  return null;
}

function openBrowserSettings(): void {
  const url = getBrowserSettingsUrl();
  if (!url) {
    toast.info(
      '브라우저/기기 설정 → 알림에서 1Day 1Streak 의 권한을 허용해주세요.'
    );
    return;
  }

  const copyAndNotify = async (): Promise<void> => {
    try {
      await navigator.clipboard?.writeText(url);
      toast.success(
        '설정 주소를 복사했어요. 새 탭 주소창에 붙여넣어 열어주세요.'
      );
    } catch {
      toast.info(`주소창에 "${url}" 을 입력해 열어주세요.`);
    }
  };

  void copyAndNotify();

  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch {
    // 브라우저 정책상 차단되면 무시 — 클립보드 안내로 폴백.
  }
}

export function NotificationSettingsScreen(): React.ReactElement {
  const { data, isLoading } = useNotificationPreferences();
  const { mutate: updatePreferences } = useUpdateNotificationPreferences();
  const { status, subscribe } = useWebPushSubscription();

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
                  <Text
                    size="caption1"
                    weight="regular"
                    className="text-gray-400"
                  >
                    이 기기 브라우저로 실시간 알림을 받습니다
                  </Text>
                </div>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={status === 'loading'}
                  onClick={() => {
                    void subscribe();
                  }}
                >
                  {status === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  {status === 'loading' ? '처리 중...' : '알림 허용'}
                </Button>
              </div>
            ) : status === 'denied' ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  {WEB_PUSH_LABEL.denied?.icon}
                  <Text size="body2" weight="regular" className="text-gray-500">
                    {WEB_PUSH_LABEL.denied?.text}
                  </Text>
                </div>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={openBrowserSettings}
                  className="self-start"
                >
                  <ExternalLink className="h-4 w-4" />
                  사이트별 설정 열기
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {WEB_PUSH_LABEL[status]?.icon}
                <Text
                  size="body2"
                  weight="regular"
                  className={cn(
                    status === 'subscribed' ? 'text-gray-700' : 'text-gray-500'
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
    </SubPageShell>
  );
}
