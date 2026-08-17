'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import {
  Archive,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  PartyPopper,
  X,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { ChatMessage } from '../type/chat';
import { ChatBubbleBody } from './ChatMessageBubble';

/**
 * 채팅방 상단 배너들의 공통 껍데기. 화면 폭에 꽉 붙는 띠가 아니라 **떠 있는
 * 카드**다 — 좌우·위 여백, 큰 라운드. 그림자 대신 한 톤 진한 테두리로
 * 구분한다(배경이 옅은 브랜드 톤이라 회색 보더는 겉돈다).
 */
function BannerCard({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?(): void;
}): React.ReactElement {
  const className = cn(
    'border-main-300 mx-3 mt-2.5 mb-0.5 overflow-hidden rounded-2xl',
    'border bg-[#fff4e5] text-left'
  );
  if (!onClick) {
    return <div className={className}>{children}</div>;
  }
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      className={cn(className, 'cursor-pointer')}
    >
      {children}
    </div>
  );
}

/** 배너 앞머리 태그 — [공지] / [미디어]. */
function NoticeTag({
  label,
  brand = false,
}: {
  label: string;
  brand?: boolean;
}): React.ReactElement {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-1.5 py-px text-[10px] leading-5',
        'font-extrabold',
        brand
          ? 'bg-main-600 text-white'
          : 'border border-gray-200 bg-white text-gray-600'
      )}
    >
      {label}
    </span>
  );
}

interface ChatNoticeBannerProps {
  notice: ChatMessage;
  /** 호스트에게만 해제 버튼을 준다. */
  canEdit: boolean;
  onClear(): void;
  /** 원본이 이미 화면에 있으면 그리로 보낸다. 없으면 버튼을 안 그린다. */
  onJumpToOrigin?(): void;
}

/** 방 상단 고정 공지. */
export function ChatNoticeBanner({
  notice,
  canEdit,
  onClear,
  onJumpToOrigin,
}: ChatNoticeBannerProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const text = notice.content?.trim() ?? '';
  // 사진이든 공유 카드든 "글 말고 뭔가 더 있다" 는 표시가 필요하다.
  const hasMedia =
    notice.type === 'IMAGE' ||
    notice.type === 'CHALLENGE_SHARE' ||
    notice.type === 'DIARY_SHARE';
  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <BannerCard onClick={() => setExpanded((value) => !value)}>
      <div
        className={cn(
          'flex gap-1.5 px-3.5 py-3',
          expanded ? 'items-start' : 'items-center'
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <NoticeTag label="공지" brand />
            {hasMedia ? <NoticeTag label="미디어" /> : null}
            {text && !expanded ? (
              <Text size="caption2" className="truncate text-gray-800">
                {text.replace(/\n/g, ' ')}
              </Text>
            ) : null}
          </div>
          {expanded ? (
            <>
              <Text size="caption3" weight="bold" className="text-gray-500">
                {notice.senderNickname}
              </Text>
              {/* 미디어 공지는 본문 렌더가 캡션까지 그린다 — 여기서 또
                  그리면 같은 글이 두 번 나온다. */}
              {hasMedia ? (
                <div className="pt-1">
                  <ChatBubbleBody message={notice} isMine={false} />
                </div>
              ) : text ? (
                <Text
                  size="caption2"
                  className="whitespace-pre-wrap text-gray-800"
                >
                  {text}
                </Text>
              ) : null}
              {onJumpToOrigin ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onJumpToOrigin();
                  }}
                  className="text-main-700 flex w-fit items-center gap-0.5 pt-1"
                >
                  <Text size="caption3" weight="bold" className="text-inherit">
                    원본 보기
                  </Text>
                  <ChevronRight className="h-3 w-3" />
                </button>
              ) : null}
            </>
          ) : null}
        </div>
        <Chevron className="mt-1 h-3.5 w-3.5 shrink-0 text-gray-500" />
        {canEdit ? (
          <button
            type="button"
            aria-label="공지 해제"
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center"
          >
            <X className="h-3.5 w-3.5 text-gray-600" />
          </button>
        ) : null}
      </div>
    </BannerCard>
  );
}

/**
 * 종료된 챌린지 안내. 종료돼도 방은 **일주일 더** 그대로 쓴다 — 그동안은
 * 입력창을 잠그지 않는다. 대신 언제까지 쓸 수 있는지 알리고, 접거나 아주
 * 끄면 물러난다.
 */
export function ChatEndedBanner({
  onDismiss,
  /** 전송이 막히기까지 남은 기간("6일"·"3시간"). 서버가 안 주면 생략. */
  closesIn,
}: {
  onDismiss(): void;
  closesIn?: string | null;
}): React.ReactElement {
  const [collapsed, setCollapsed] = useState(false);
  const Chevron = collapsed ? ChevronDown : ChevronUp;

  return (
    <BannerCard>
      <div
        className={cn(
          'flex gap-2 px-3.5 py-3',
          collapsed ? 'items-center' : 'items-start'
        )}
      >
        <PartyPopper className="text-main-600 mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Text size="caption2" weight="bold" className="truncate text-gray-800">
            챌린지가 종료되었습니다!
          </Text>
          {!collapsed ? (
            <>
              <Text size="caption3" className="text-gray-600">
                {closesIn
                  ? `채팅방은 ${closesIn} 뒤 보관돼요. 그 뒤로는 메시지를 보낼 수 없고 지난 대화만 볼 수 있어요.`
                  : '채팅방은 종료 후 일주일간 유지돼요. 그 뒤로는 메시지를 보낼 수 없고 지난 대화만 볼 수 있어요.'}
              </Text>
              <Text size="caption3" className="text-gray-600">
                새로운 챌린지를 진행해보는건 어떠신가요?
              </Text>
              <div className="flex items-center gap-2 pt-2">
                <Link
                  href="/challenge"
                  className={cn(
                    'bg-main-600 rounded-lg px-2.5 py-1.5 text-white'
                  )}
                >
                  <Text size="caption4" weight="extrabold" className="text-inherit">
                    챌린지 둘러보기
                  </Text>
                </Link>
                <button
                  type="button"
                  onClick={onDismiss}
                  className={cn(
                    'rounded-lg border border-gray-200 bg-white px-2.5 py-1.5',
                    'text-gray-700'
                  )}
                >
                  <Text size="caption4" weight="extrabold" className="text-inherit">
                    다시 보지 않기
                  </Text>
                </button>
              </div>
            </>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={collapsed ? '펼치기' : '접기'}
          onClick={() => setCollapsed((value) => !value)}
          className="flex h-7 w-7 shrink-0 items-center justify-center"
        >
          <Chevron className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </div>
    </BannerCard>
  );
}

/**
 * 보관된 방 안내. 종료 후 일주일이 지나 전송이 잠긴 상태다.
 *
 * 종료 배너와 달리 끌 수 없다 — 왜 입력창이 잠겼는지 설명하는 유일한
 * 자리라, 끄면 사용자는 고장으로 읽는다.
 */
export function ChatArchivedBanner(): React.ReactElement {
  return (
    <BannerCard>
      <div className="flex items-start gap-2 px-3.5 py-3">
        <Archive className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Text size="caption2" weight="bold" className="text-gray-800">
            보관된 채팅방이에요
          </Text>
          <Text size="caption3" className="text-gray-600">
            챌린지 종료 후 일주일이 지나 더는 메시지를 보낼 수 없어요. 지난
            대화는 계속 볼 수 있어요.
          </Text>
        </div>
      </div>
    </BannerCard>
  );
}

/**
 * 구독이 거절된 상태 안내. **재접속 트리거가 아니다** — 서버는 구독만 막고
 * 세션은 살려 두므로, 여기서 재연결하면 거절 루프가 무한히 돈다.
 */
export function ChatNoticeMessageBanner({
  text,
}: {
  text: string;
}): React.ReactElement {
  return (
    <BannerCard>
      <div className="px-3.5 py-2.5">
        <Text size="caption2" className="text-gray-800">
          {text}
        </Text>
      </div>
    </BannerCard>
  );
}
