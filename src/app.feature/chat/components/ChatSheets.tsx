'use client';

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetTitle,
  Text,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import {
  BookOpen,
  ChevronRight,
  Copy,
  Flag,
  ImageIcon,
  Pin,
  PinOff,
  Siren,
  SquareArrowOutUpRight,
  TrendingUp,
} from 'lucide-react';
import React from 'react';

import type { ChatStatsVariant } from '../type/chat';

export type ChatShareKind = 'photo' | 'challenge' | 'diary' | 'stats';

function SheetRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick(): void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3.5 rounded-xl px-1 py-3.5',
        'text-left transition-colors hover:bg-gray-50'
      )}
    >
      <span className="text-gray-700">{icon}</span>
      <Text size="body2" weight="medium" className="text-gray-900">
        {label}
      </Text>
    </button>
  );
}

function Sheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="px-5 pb-3">
        <BottomSheetTitle className="sr-only">{title}</BottomSheetTitle>
        <div className="flex flex-col">{children}</div>
      </BottomSheetContent>
    </BottomSheet>
  );
}

/** 첨부 시트의 한 칸 — 아이콘 타일 + 라벨(디자인 .sh). */
function SheetTile({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick(): void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-[7px]"
    >
      <span
        className={cn(
          'bg-main-200 text-main-900 flex h-[54px] w-[54px] items-center',
          'justify-center rounded-[18px] transition-colors',
          'hover:bg-main-300'
        )}
      >
        {icon}
      </span>
      <Text size="caption3" weight="bold" className="text-gray-700">
        {label}
      </Text>
    </button>
  );
}

/**
 * + 버튼 — 무엇을 붙일지 먼저 고른다.
 *
 * 세로 목록이 아니라 **4열 그리드 타일**이다(디자인). 항목이 적어
 * 목록으로 두면 시트가 세로로 길고 손가락 이동도 멀다.
 */
export function ChatShareMenuSheet({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  onSelect(kind: ChatShareKind): void;
}): React.ReactElement {
  const pick = (kind: ChatShareKind) => (): void => {
    onOpenChange(false);
    onSelect(kind);
  };
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="px-3 pt-4 pb-5">
        <BottomSheetTitle className="sr-only">보낼 것 고르기</BottomSheetTitle>
        <div className="grid grid-cols-4 gap-2.5">
          <SheetTile
            icon={<ImageIcon className="h-6 w-6" />}
            label="사진"
            onClick={pick('photo')}
          />
          <SheetTile
            icon={<Flag className="h-6 w-6" />}
            label="챌린지"
            onClick={pick('challenge')}
          />
          <SheetTile
            icon={<BookOpen className="h-6 w-6" />}
            label="일지"
            onClick={pick('diary')}
          />
          <SheetTile
            icon={<TrendingUp className="h-6 w-6" />}
            label="통계"
            onClick={pick('stats')}
          />
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}

/** 헤더 더보기 메뉴. 챌린지가 끝났어도 상세는 볼 수 있다. */
export function ChatRoomMenuSheet({
  open,
  onOpenChange,
  onOpenChallenge,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  onOpenChallenge(): void;
}): React.ReactElement {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="채팅방 메뉴">
      <SheetRow
        icon={<SquareArrowOutUpRight className="h-5 w-5" />}
        label="챌린지 상세 보기"
        onClick={() => {
          onOpenChange(false);
          onOpenChallenge();
        }}
      />
    </Sheet>
  );
}

export interface ChatMessageActionsState {
  /** 복사할 글. 없으면 복사 항목을 안 그린다. */
  text: string;
  /** 호스트만 공지를 걸고 푼다(서버도 403 CHAT-009 로 막는다). */
  canEditNotice: boolean;
  isNotice: boolean;
  /** 내 메시지는 신고 대상이 아니다. */
  canReport: boolean;
}

/** 말풍선 롱프레스·우클릭 메뉴. */
export function ChatMessageActionsSheet({
  state,
  onOpenChange,
  onCopy,
  onToggleNotice,
  onReport,
}: {
  state: ChatMessageActionsState | null;
  onOpenChange(open: boolean): void;
  onCopy(text: string): void;
  onToggleNotice(isNotice: boolean): void;
  onReport(): void;
}): React.ReactElement {
  const NoticeIcon = state?.isNotice ? PinOff : Pin;
  return (
    <Sheet
      open={Boolean(state)}
      onOpenChange={onOpenChange}
      title="메시지 메뉴"
    >
      {state?.text ? (
        <SheetRow
          icon={<Copy className="h-5 w-5" />}
          label="복사"
          onClick={() => {
            onOpenChange(false);
            onCopy(state.text);
          }}
        />
      ) : null}
      {state?.canEditNotice ? (
        <SheetRow
          icon={<NoticeIcon className="h-5 w-5" />}
          label={state.isNotice ? '공지 해제' : '공지로 지정'}
          onClick={() => {
            onOpenChange(false);
            onToggleNotice(state.isNotice);
          }}
        />
      ) : null}
      {state?.canReport ? (
        <SheetRow
          icon={<Siren className="h-5 w-5 text-red-500" />}
          label="신고하기"
          onClick={() => {
            onOpenChange(false);
            onReport();
          }}
        />
      ) : null}
    </Sheet>
  );
}

/**
 * 통계 자랑 — 어떤 카드로 보낼지 고른다.
 *
 * 숫자는 서버가 채우므로 여기서 미리 보여 줄 값이 없다. 고르는 것은
 * **모양**뿐이라 설명을 곁들여 무엇이 강조되는지 알린다.
 */
export function ChatStatsVariantSheet({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  onSelect(variant: ChatStatsVariant): void;
}): React.ReactElement {
  const pick = (variant: ChatStatsVariant) => (): void => {
    onOpenChange(false);
    onSelect(variant);
  };
  const items: Array<{
    variant: ChatStatsVariant;
    label: string;
    hint: string;
  }> = [
    { variant: 'WEEK', label: '이번 주 기록', hint: '요일별 작성 현황' },
    { variant: 'CURRENT_STREAK', label: '현재 스트릭', hint: '연속 작성 일수' },
    { variant: 'MAX_STREAK', label: '최장 스트릭', hint: '역대 최고 기록' },
  ];
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="px-3 pt-4 pb-5">
        <BottomSheetTitle className="px-1 pb-2 text-left">
          어떤 기록을 자랑할까요?
        </BottomSheetTitle>
        <div className="flex flex-col">
          {items.map((item) => (
            <button
              key={item.variant}
              type="button"
              onClick={pick(item.variant)}
              className={cn(
                'flex items-center justify-between gap-3 rounded-xl px-3',
                'py-3 text-left transition-colors hover:bg-gray-100'
              )}
            >
              <span className="flex min-w-0 flex-col">
                <Text size="body2" weight="bold" className="text-gray-900">
                  {item.label}
                </Text>
                <Text size="caption3" className="text-gray-500">
                  {item.hint}
                </Text>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
            </button>
          ))}
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
