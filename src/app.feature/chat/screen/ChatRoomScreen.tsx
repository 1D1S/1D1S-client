'use client';

import { Text } from '@1d1s/design-system';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { getApiErrorCode } from '@module/api/error';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { useSignalPageReady } from '@module/hooks/useSignalPageReady';
import { toast } from '@module/providers/toast';
import { cn } from '@module/utils/cn';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bell, BellOff, MoreVertical, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { chatApi, chatImageContentType } from '../api/chatApi';
import { ChatComposer } from '../components/ChatComposer';
import { ChatMessageList } from '../components/ChatMessageList';
import { ChatReportSheet } from '../components/ChatReportSheet';
import { ChatSharePickerSheet } from '../components/ChatSharePickerSheet';
import {
  ChatMessageActionsSheet,
  type ChatMessageActionsState,
  ChatRoomMenuSheet,
  type ChatShareKind,
  ChatShareMenuSheet,
} from '../components/ChatSheets';
import {
  ChatArchivedBanner,
  ChatEndedBanner,
  ChatNoticeBanner,
  ChatNoticeMessageBanner,
} from '../components/ChatTopBanners';
import { CHAT_QUERY_KEYS } from '../consts/queryKeys';
import {
  useClearChatNotice,
  useReportChatMessage,
  useSetChatNotice,
  useToggleChatPush,
} from '../hooks/useChatMutations';
import { useChatRooms } from '../hooks/useChatQueries';
import { useChatRoom } from '../hooks/useChatRoom';
import { useEndedBannerDismissal } from '../hooks/useEndedBannerDismissal';
import { useMeasuredHeight } from '../hooks/useMeasuredHeight';
import { ChatMessage, ChatShareResolution } from '../type/chat';
import {
  canSendInChatRoom,
  formatChatClosesIn,
  isChatArchived,
} from '../utils/chatArchive';
import { chatShareLinkIn } from '../utils/chatShareLink';

const LINK_RESOLVE_DELAY_MS = 400;

function HeaderIconButton({
  label,
  onClick,
  children,
  muted = false,
}: {
  label: string;
  onClick(): void;
  children: React.ReactNode;
  muted?: boolean;
}): React.ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full',
        'transition-colors hover:bg-gray-100',
        muted ? 'text-gray-400' : 'text-gray-700'
      )}
    >
      {children}
    </button>
  );
}

export function ChatRoomScreen({
  roomId,
}: {
  roomId: number;
}): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleBack = useSafeBack('/chat');
  const { data: sidebar } = useSidebar();
  const { data: roomList } = useChatRooms();
  const room = roomList?.rooms.find((item) => item.roomId === roomId);
  // 서버가 side-bar 에 memberId 를 싣기 전에는 닉네임 비교로 버텼다.
  // 이제 내 회원 id 하나로 좌우 정렬·안 읽은 수·신고 가능 여부가 모두
  // 정해진다.
  const myMemberId = sidebar?.memberId;

  const {
    messages,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    subscriptionError,
    kickedOut,
    noticeUpdate,
    sendText,
    sendImage,
    sendShare,
    retry,
    readStates,
  } = useChatRoom(roomId, {
    myMemberId,
    challengeEnded: room?.challengeEnded,
  });

  useSignalPageReady('chat-room', !isLoading);

  const [draft, setDraft] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [share, setShare] = useState<ChatShareResolution | null>(null);
  /** 지금 카드로 바뀌어 있는 링크. 카드를 지우면 이 글을 되돌려 준다. */
  const [linkShareUrl, setLinkShareUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const [pickerKind, setPickerKind] = useState<'challenge' | 'diary' | null>(
    null
  );
  const [actions, setActions] = useState<ChatMessageActionsState | null>(null);
  const [actionTarget, setActionTarget] = useState<ChatMessage | null>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  /** 신고 시트를 연 메시지. null 이면 닫혀 있다. */
  const [reportTarget, setReportTarget] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  /** 이미 물어본 링크. 같은 글을 다시 물어보지 않는다. */
  const lastResolvedUrl = useRef<string | null>(null);

  const { ref: bannerRef, height: bannerInset } = useMeasuredHeight();
  const { mutate: togglePush } = useToggleChatPush();
  const { mutate: setNotice } = useSetChatNotice();
  const { mutate: clearNotice } = useClearChatNotice();
  const { mutate: reportMessage, isPending: isReporting } =
    useReportChatMessage();
  // 보관 = 종료 + 7일 경과 읽기 전용. 판정은 chatArchive 한 곳에서만 한다.
  const archived = room ? isChatArchived(room) : false;
  // 종료 배너는 아직 보낼 수 있는 동안만 — 보관되면 보관 배너가 대신한다.
  const ended = (room?.challengeEnded ?? false) && !archived;
  const closesIn = formatChatClosesIn(room?.chatClosesAt);
  const { dismissed, dismiss } = useEndedBannerDismissal(roomId);

  const canSend = (!room || canSendInChatRoom(room)) && !kickedOut;

  // 실시간 공지 통지가 방 목록보다 우선한다. 통지에는 본문이 안 실려 오므로
  // (뷰어별 권한 때문에 서버가 id 만 준다) 내 내역에서 찾고, 없으면 방
  // 목록이 실어다 준 값을 쓴다.
  const notice = useMemo(() => {
    if (noticeUpdate === undefined) {
      return room?.notice ?? null;
    }
    if (noticeUpdate === null) {
      return null;
    }
    if (room?.notice?.id === noticeUpdate) {
      return room.notice;
    }
    return messages.find((message) => message.id === noticeUpdate) ?? null;
  }, [messages, noticeUpdate, room]);

  // 붙여넣은 우리 링크를 공유 카드로 바꾼다. 판정은 서버가 한다 —
  // 못 바꾸는 링크는 막지 않고 그냥 글로 나간다.
  useEffect(() => {
    const url = chatShareLinkIn(draft);
    if (!url || url === lastResolvedUrl.current) {
      return undefined;
    }
    // 사진·공유가 이미 달려 있으면 자리를 뺏지 않는다.
    if (imageFile || share) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      lastResolvedUrl.current = url;
      void chatApi.resolveShare(url).then((resolution) => {
        if (!resolution.shareable) {
          // 우리 링크인데 못 보내는 것(삭제·비공개·차단·남의 일지)만 알린다.
          if (resolution.type) {
            toast.info('공유할 수 없는 링크예요. 글로 보낼게요.');
          }
          return;
        }
        setShare(resolution);
        setLinkShareUrl(url);
        // 카드가 대신하므로 글은 비운다 — 링크와 카드가 같이 나가면 중복이다.
        setDraft('');
      });
    }, LINK_RESOLVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [draft, imageFile, share]);

  /** 링크에서 만든 카드를 지우면 원래 글을 돌려준다. */
  const clearAttachment = (): void => {
    setImageFile(null);
    setShare(null);
    if (linkShareUrl) {
      setDraft(linkShareUrl);
      // 같은 링크를 곧바로 다시 카드로 만들지 않는다.
      lastResolvedUrl.current = linkShareUrl;
      setLinkShareUrl(null);
    }
  };

  const handleSend = async (): Promise<void> => {
    const text = draft.trim();
    const pendingImage = imageFile;
    const pendingShare = share;
    if (!text && !pendingImage && !pendingShare) {
      return;
    }
    setDraft('');
    setImageFile(null);
    setShare(null);
    setLinkShareUrl(null);
    setSending(true);
    try {
      if (pendingShare) {
        // 공유는 사진과 같은 규칙이다 — 캡션은 선택.
        await sendShare(pendingShare, text || undefined);
        return;
      }
      if (pendingImage) {
        await sendImage(pendingImage, text || undefined);
        return;
      }
      await sendText(text);
    } catch (error) {
      // 보고 있는 사이에 보관 시각이 지났다(CHAT-017). 목록을 새로 받아
      // 입력창을 잠근다 — 안 그러면 계속 "보낼 수 있는 척" 한다.
      if (getApiErrorCode(error) === 'CHAT-017') {
        toast.error('보관된 채팅방이에요. 더는 메시지를 보낼 수 없어요.');
        void queryClient.invalidateQueries({
          queryKey: CHAT_QUERY_KEYS.rooms(),
        });
        return;
      }
      // 판정과 전송 사이에 대상이 지워질 수 있다(CHAT-014). 링크에서 온
      // 카드면 원래 하려던 것 — 링크 보내기 — 로 되돌린다.
      if (pendingShare && linkShareUrl) {
        await sendText(linkShareUrl).catch(() => undefined);
        return;
      }
      toast.error(
        error instanceof Error ? error.message : '메시지를 보내지 못했습니다.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleShareKind = (kind: ChatShareKind): void => {
    if (kind === 'photo') {
      fileInputRef.current?.click();
      return;
    }
    setPickerKind(kind);
  };

  const handlePickFile = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 고를 수 있게 값을 비운다.
    event.target.value = '';
    if (!file) {
      return;
    }
    if (!chatImageContentType(file.name)) {
      toast.error('jpg · png · heic 만 보낼 수 있습니다.');
      return;
    }
    setImageFile(file);
    setShare(null);
    setLinkShareUrl(null);
  };

  const handleToggleNotifications = (): void => {
    if (!room) {
      return;
    }
    const enabled = !room.pushEnabled;
    togglePush(
      { roomId, enabled },
      {
        onSuccess: () =>
          toast.success(enabled ? '알림을 켰습니다.' : '알림을 껐습니다.'),
        onError: () => toast.error('알림 설정을 바꾸지 못했습니다.'),
      }
    );
  };

  const openActions = (message: ChatMessage): void => {
    if (message.id <= 0 || message.status === 'HIDDEN') {
      return;
    }
    const text = message.content?.trim() ?? '';
    const canEditNotice = room?.myRole === 'HOST';
    // 내 메시지는 신고 대상이 아니다.
    const canReport = message.senderId !== myMemberId;
    if (!text && !canEditNotice && !canReport) {
      return;
    }
    setActionTarget(message);
    setActions({
      text,
      canEditNotice,
      isNotice: notice?.id === message.id,
      canReport,
    });
  };

  const handleToggleNotice = (isNotice: boolean): void => {
    const target = actionTarget;
    setActionTarget(null);
    if (isNotice) {
      clearNotice(
        { roomId },
        {
          onSuccess: () => toast.success('공지를 해제했습니다.'),
          onError: () => toast.error('공지를 해제하지 못했습니다.'),
        }
      );
      return;
    }
    if (!target) {
      return;
    }
    setNotice(
      { roomId, messageId: target.id },
      {
        onSuccess: () => toast.success('공지로 지정했습니다.'),
        onError: () => toast.error('공지를 지정하지 못했습니다.'),
      }
    );
  };

  // 공지 원본이 이미 불러온 페이지에 있으면 잠깐 강조해 알려 준다.
  // 아직 안 받은 옛 공지는 버튼을 그리지 않는다 — 커서를 따라 몇 페이지를
  // 더 받을지 알 수 없어, 눌러도 아무 일이 없는 버튼이 되는 편이 나쁘다.
  const noticeLoaded =
    notice != null && messages.some((message) => message.id === notice.id);
  const jumpToNotice = (): void => {
    if (!notice) {
      return;
    }
    setHighlightId(notice.id);
    window.setTimeout(() => setHighlightId(null), 1600);
    document
      .getElementById(`chat-message-${notice.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    // 높이를 **여기서 확정한다**. `h-full` 로 두면 부모(AppLayoutShell 의
    // main)가 `min-h-screen` 기반 auto 높이라 퍼센트가 해석되지 않아 채팅
    // 화면이 콘텐츠 높이로 늘어나고, 그러면 내부 리스트 대신 **페이지가**
    // 스크롤되면서 헤더가 같이 밀려 올라갔다(헤더가 안 붙어 보이던 원인).
    // 100dvh 는 모바일 사파리 주소창 높이 변화까지 따라간다.
    // 데스크톱(lg)에는 글로벌 TopNav(62px)가 위에 있어 그만큼 뺀다 — 채팅
    // 라우트는 바텀 네비도, 뒤로가기 바도 없다.
    <div
      className={cn(
        'mx-auto flex w-full max-w-[760px] flex-col bg-gray-50',
        'h-[100dvh] lg:h-[calc(100dvh-62px)]'
      )}
    >
      <header
        className={cn(
          'flex shrink-0 items-center gap-1 border-b border-gray-200',
          'bg-white px-2 py-2'
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={handleBack}
          className="flex h-9 w-9 items-center justify-center rounded-full"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <Text
          size="body2"
          weight="extrabold"
          className="min-w-0 flex-1 truncate text-gray-900"
        >
          {room?.challengeTitle ?? '채팅'}
        </Text>
        {room ? (
          <div className="flex shrink-0 items-center">
            {/* 채팅 전용 참여자 API 가 없어 챌린지 참여자 화면을 그대로 쓴다. */}
            <Link
              href={`/challenge/${room.challengeId}/participants`}
              aria-label="참여자 보기"
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full',
                'text-gray-700 transition-colors hover:bg-gray-100'
              )}
            >
              <Users className="h-4.5 w-4.5" />
            </Link>
            <HeaderIconButton
              label={room.pushEnabled ? '알림 끄기' : '알림 켜기'}
              muted={!room.pushEnabled}
              onClick={handleToggleNotifications}
            >
              {room.pushEnabled ? (
                <Bell className="h-4.5 w-4.5" />
              ) : (
                <BellOff className="h-4.5 w-4.5" />
              )}
            </HeaderIconButton>
            <HeaderIconButton
              label="더보기"
              onClick={() => setRoomMenuOpen(true)}
            >
              <MoreVertical className="h-4.5 w-4.5" />
            </HeaderIconButton>
          </div>
        ) : null}
      </header>

      <div className="relative min-h-0 flex-1">
        {/* 배너는 메시지 **위에 떠 있다**. Column 에서 자리를 차지하면
            리스트를 밀어내 공유 카드가 배너에 잘려 보였다. */}
        <div ref={bannerRef} className="absolute inset-x-0 top-0 z-10">
          {archived ? <ChatArchivedBanner /> : null}
          {ended && dismissed === false ? (
            <ChatEndedBanner onDismiss={dismiss} closesIn={closesIn} />
          ) : null}
          {notice ? (
            <ChatNoticeBanner
              notice={notice}
              canEdit={room?.myRole === 'HOST'}
              onClear={() =>
                clearNotice(
                  { roomId },
                  {
                    onSuccess: () => toast.success('공지를 해제했습니다.'),
                    onError: () => toast.error('공지를 해제하지 못했습니다.'),
                  }
                )
              }
              onJumpToOrigin={noticeLoaded ? jumpToNotice : undefined}
            />
          ) : null}
          {subscriptionError ? (
            <ChatNoticeMessageBanner text={subscriptionError} />
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <span
              className={cn(
                'h-5 w-5 animate-spin rounded-full border-2',
                'border-gray-300 border-t-transparent'
              )}
            />
          </div>
        ) : (
          <ChatMessageList
            messages={messages}
            myMemberId={myMemberId}
            readStates={readStates}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            topInset={bannerInset}
            canSend={canSend}
            archived={archived}
            noticeId={notice?.id}
            highlightId={highlightId}
            onRetry={(message) => void retry(message)}
            onOpenActions={openActions}
          />
        )}
      </div>

      {/* 홈 인디케이터가 있는 기기에서 입력창이 가려지지 않게. */}
      <ChatComposer
        value={draft}
        onChange={setDraft}
        enabled={canSend}
        disabledPlaceholder={
          archived ? '보관된 채팅방이에요' : '읽기 전용 채팅방입니다'
        }
        sending={sending}
        imageFile={imageFile}
        share={share}
        onRemoveAttachment={clearAttachment}
        onOpenShareMenu={() => setShareMenuOpen(true)}
        onSend={() => void handleSend()}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,.jpg,.jpeg,.png,.heic"
        className="hidden"
        onChange={handlePickFile}
      />

      <ChatShareMenuSheet
        open={shareMenuOpen}
        onOpenChange={setShareMenuOpen}
        onSelect={handleShareKind}
      />
      <ChatSharePickerSheet
        kind={pickerKind}
        onOpenChange={(open) => {
          if (!open) {
            setPickerKind(null);
          }
        }}
        onSelect={(picked) => {
          setShare(picked);
          setImageFile(null);
          setLinkShareUrl(null);
        }}
      />
      <ChatRoomMenuSheet
        open={roomMenuOpen}
        onOpenChange={setRoomMenuOpen}
        onOpenChallenge={() =>
          room ? router.push(`/challenge/${room.challengeId}`) : undefined
        }
      />
      <ChatMessageActionsSheet
        state={actions}
        onOpenChange={(open) => {
          if (!open) {
            setActions(null);
            setActionTarget(null);
          }
        }}
        onCopy={(text) => {
          void navigator.clipboard
            .writeText(text)
            .then(() => toast.success('복사했습니다.'))
            .catch(() => toast.error('복사하지 못했습니다.'));
        }}
        onToggleNotice={handleToggleNotice}
        onReport={() => {
          if (actionTarget) {
            setReportTarget(actionTarget.id);
          }
        }}
      />
      <ChatReportSheet
        messageId={reportTarget}
        isPending={isReporting}
        onOpenChange={(open) => {
          if (!open) {
            setReportTarget(null);
          }
        }}
        onSubmit={(messageId, data) =>
          reportMessage(
            { messageId, data },
            {
              onSuccess: () => {
                setReportTarget(null);
                toast.success('신고가 접수되었습니다.');
              },
              onError: (error) => {
                const code = getApiErrorCode(error);
                if (code === 'CHAT-010') {
                  setReportTarget(null);
                  toast.info('이미 신고한 메시지예요.');
                  return;
                }
                toast.error(
                  code === 'CHAT-013'
                    ? '신고가 몰렸어요. 잠시 후 다시 시도해 주세요.'
                    : '신고하지 못했습니다.'
                );
              },
            }
          )
        }
      />
    </div>
  );
}
