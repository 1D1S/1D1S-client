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
  Copy,
  Flag,
  ImageIcon,
  Pin,
  PinOff,
  Siren,
  SquareArrowOutUpRight,
} from 'lucide-react';
import React from 'react';

export type ChatShareKind = 'photo' | 'challenge' | 'diary';

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

/** + 버튼 — 무엇을 붙일지 먼저 고른다. */
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
    <Sheet open={open} onOpenChange={onOpenChange} title="보낼 것 고르기">
      <SheetRow
        icon={<ImageIcon className="h-5 w-5" />}
        label="사진"
        onClick={pick('photo')}
      />
      <SheetRow
        icon={<Flag className="h-5 w-5" />}
        label="챌린지 공유"
        onClick={pick('challenge')}
      />
      <SheetRow
        icon={<BookOpen className="h-5 w-5" />}
        label="일지 공유"
        onClick={pick('diary')}
      />
    </Sheet>
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
