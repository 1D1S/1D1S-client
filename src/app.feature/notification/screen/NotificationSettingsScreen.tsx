'use client';

import { Button, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import {
  ArrowLeft,
  Bell,
  BellOff,
  BellRing,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

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
    <div
      className={cn(
        'flex items-center justify-between px-5 py-4',
        disabled && 'opacity-40'
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
          disabled && 'cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full',
            'bg-white shadow-sm transition-transform duration-200',
            value ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
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
  const router = useRouter();
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
    <div className="min-h-screen w-full pt-14 lg:pt-0">
      {/* 모바일 fixed 헤더 — ← + 알림 설정 */}
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
          알림 설정
        </Text>
      </div>

      <section className="mx-auto w-full max-w-[980px] p-4 lg:p-6">
        <div className="hidden border-b border-gray-200 pb-5 lg:block">
          <Text
            size="pageTitle"
            weight="extrabold"
            className="tracking-tight text-gray-900"
          >
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
                    <Text
                      size="body1"
                      weight="medium"
                      className="text-gray-800"
                    >
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
                    <Text
                      size="body2"
                      weight="regular"
                      className="text-gray-500"
                    >
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
                      status === 'subscribed'
                        ? 'text-gray-700'
                        : 'text-gray-500'
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
