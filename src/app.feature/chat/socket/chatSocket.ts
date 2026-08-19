import { API_BASE_URL } from '@module/api/config';
import { refreshAccessTokenOnce } from '@module/api/tokenRefresh';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

import {
  ChatMessage,
  ChatMessageUpdate,
  ChatNoticeUpdate,
  ChatReadReceipt,
  ChatSocketError,
} from '../type/chat';

/**
 * 채팅 STOMP 연결. **탭 전체에서 하나만** 살아 있고, 화면들은 그 위에 방
 * 구독을 붙였다 뗀다. 모듈 스코프 싱글턴 + 리스너 refcount 라 StrictMode
 * 이중 마운트나 HMR 로도 연결이 두 개 생기지 않는다.
 *
 * 인증은 **쿠키**다. 브라우저는 STOMP CONNECT 에 Authorization 네이티브
 * 헤더를 실을 수는 있지만 그러려면 토큰 값을 JS 가 읽어야 하는데, 상용
 * accessToken 은 httpOnly 라 읽을 수 없다. 서버가 /ws/chat 을 permitAll 로
 * 열고 JwtAuthenticationFilter 가 핸드셰이크 HTTP 요청에서 쿠키를
 * (Authorization 헤더보다 먼저) 파싱해 SecurityContext 를 채우면,
 * ChatStompAuthInterceptor 가 그 principal 을 그대로 쓴다. 즉 WebSocket
 * 핸드셰이크에 쿠키만 실리면 인증이 끝난다.
 *
 * 서버 계약:
 *   수신  /topic/chat/rooms/{roomId}            본문
 *         /topic/chat/rooms/{roomId}/notice     공지 설정·해제
 *         /topic/chat/rooms/{roomId}/updates    링크 프리뷰 지연 완성
 *         /topic/chat/rooms/{roomId}/read       읽음 위치 갱신(한 줄)
 *   에러  /user/queue/chat-errors  {code,message} + x-failed-destination
 *
 * 전송은 소켓이 아니라 REST(POST /chat/rooms/{id}/messages)다 — 소켓이 아직
 * 안 붙었을 때를 위한 대기열이 필요 없고, 실패가 응답으로 바로 돌아온다.
 */

const ERROR_QUEUE = '/user/queue/chat-errors';
const FAILED_DESTINATION_HEADER = 'x-failed-destination';
const HEARTBEAT_MS = 10_000;

export interface ChatRoomHandlers {
  onMessage?(message: ChatMessage): void;
  onNotice?(update: ChatNoticeUpdate): void;
  onUpdate?(update: ChatMessageUpdate): void;
  /** 누군가의 읽음 위치가 옮겨졌다. 그 한 줄만 갈아 끼우면 된다. */
  onRead?(receipt: ChatReadReceipt): void;
  /** 이 방과 관련된 구독 거절. 방과 무관한 에러는 오지 않는다. */
  onError?(error: ChatSocketError): void;
  /**
   * 구독이 (다시) 붙었다. 끊겨 있던 동안 온 메시지는 토픽으로 다시 오지
   * 않으므로, 이 시점에 최신 페이지를 받아 갭을 메운다.
   */
  onReconnect?(): void;
}

type RoomChannel = '' | '/notice' | '/updates' | '/read';

const ROOM_CHANNELS: RoomChannel[] = ['', '/notice', '/updates', '/read'];

const roomListeners = new Map<number, Set<ChatRoomHandlers>>();
const subscriptions = new Map<string, StompSubscription>();

let client: Client | null = null;
/** 한 번이라도 CONNECTED 를 받았는가. 못 받으면 세션을 의심한다. */
let connectedOnce = false;
/** 연결 시도 횟수. 두 번째 시도부터가 "직전에 실패한" 상황이다. */
let attempts = 0;
/** 세션 갱신을 무한 반복하지 않도록 연결 성공 전까지 1회만. */
let refreshAttempted = false;

function socketUrl(): string {
  const base = new URL(API_BASE_URL);
  base.protocol = base.protocol === 'http:' ? 'ws:' : 'wss:';
  base.pathname = '/ws/chat';
  base.search = '';
  return base.toString();
}

function parseError(frame: IMessage): ChatSocketError {
  let body: Partial<ChatSocketError> = {};
  try {
    const decoded: unknown = JSON.parse(frame.body || '{}');
    if (decoded && typeof decoded === 'object') {
      body = decoded as Partial<ChatSocketError>;
    }
  } catch {
    // 본문이 JSON 이 아니면 코드 없이 통지한다.
  }
  return {
    code: body.code ?? 'UNKNOWN',
    message: body.message ?? '채팅 서버 오류가 발생했습니다.',
    failedDestination: frame.headers[FAILED_DESTINATION_HEADER],
    retryAfterSeconds: body.retryAfterSeconds,
  };
}

/** 거절된 destination 에서 방 번호를 뽑는다. 방과 무관한 에러면 null. */
export function failedRoomId(error: ChatSocketError): number | null {
  const match = /^\/topic\/chat\/rooms\/(\d+)(\/.*)?$/.exec(
    error.failedDestination ?? ''
  );
  return match ? Number(match[1]) : null;
}

/**
 * 본문 토픽이 막혔는가. 곁가지 채널(/notice·/updates)만 막힌 것은 메시지
 * 수신과 무관하다 — 그걸로 "새 메시지가 안 온다" 고 알리면 거짓말이 된다.
 */
export function blocksMessages(error: ChatSocketError): boolean {
  if (!error.failedDestination) {
    return true;
  }
  return /^\/topic\/chat\/rooms\/\d+$/.test(error.failedDestination);
}

function parseJson<T>(frame: IMessage): T | null {
  try {
    const decoded: unknown = JSON.parse(frame.body || '');
    return decoded && typeof decoded === 'object' ? (decoded as T) : null;
  } catch {
    return null;
  }
}

function notifyRoom(
  roomId: number,
  visit: (handlers: ChatRoomHandlers) => void
): void {
  roomListeners.get(roomId)?.forEach(visit);
}

function subscribeChannel(roomId: number, channel: RoomChannel): void {
  const active = client;
  const destination = `/topic/chat/rooms/${roomId}${channel}`;
  if (!active?.connected || subscriptions.has(destination)) {
    return;
  }
  subscriptions.set(
    destination,
    active.subscribe(destination, (frame) => {
      if (channel === '') {
        const message = parseJson<ChatMessage>(frame);
        if (message) {
          notifyRoom(roomId, (entry) => entry.onMessage?.(message));
        }
        return;
      }
      if (channel === '/notice') {
        const update = parseJson<ChatNoticeUpdate>(frame);
        if (update) {
          notifyRoom(roomId, (entry) => entry.onNotice?.(update));
        }
        return;
      }
      if (channel === '/read') {
        const receipt = parseJson<ChatReadReceipt>(frame);
        if (receipt) {
          notifyRoom(roomId, (entry) => entry.onRead?.(receipt));
        }
        return;
      }
      const update = parseJson<ChatMessageUpdate>(frame);
      if (update) {
        notifyRoom(roomId, (entry) => entry.onUpdate?.(update));
      }
    })
  );
}

function subscribeRoomChannels(roomId: number): void {
  ROOM_CHANNELS.forEach((channel) => subscribeChannel(roomId, channel));
}

function holdReconnect(delayMs: number): void {
  const held = client;
  if (!held) {
    return;
  }
  void held.deactivate();
  window.setTimeout(() => {
    if (client === held && roomListeners.size > 0) {
      held.activate();
    }
  }, delayMs);
}

function onErrorFrame(frame: IMessage): void {
  const error = parseError(frame);
  // 거절된 구독은 죽은 상태다. 그 핸들만 버리고 **재접속하지 않는다** —
  // 재접속하면 권한 없는 방 하나 때문에 연결→거절→재접속이 무한히 돈다.
  if (error.failedDestination) {
    subscriptions.delete(error.failedDestination);
  }
  // 동시 연결 한도. 지금 다시 붙어도 또 막히므로 서버가 알려 준 시간만큼
  // 쉬었다 붙는다(계약 EG).
  if (error.code === 'CHAT-015') {
    holdReconnect((error.retryAfterSeconds ?? 5) * 1000);
  }
  const roomId = failedRoomId(error);
  if (roomId == null) {
    roomListeners.forEach((handlers) =>
      handlers.forEach((entry) => entry.onError?.(error))
    );
    return;
  }
  notifyRoom(roomId, (entry) => entry.onError?.(error));
}

function ensureClient(): Client {
  if (client) {
    return client;
  }
  const next = new Client({
    brokerURL: socketUrl(),
    // 3초. 서버 하트비트가 10초라 죽은 세션은 그 안에 정리된다.
    reconnectDelay: 3_000,
    heartbeatIncoming: HEARTBEAT_MS,
    heartbeatOutgoing: HEARTBEAT_MS,
    // 붙기 전에 세션이 만료됐을 수 있다. 첫 연결이 CONNECTED 없이 끊긴
    // 뒤라면 재시도 전에 쿠키를 한 번 갱신한다 — 갱신된 쿠키는 다음
    // 핸드셰이크에 자동으로 실린다.
    beforeConnect: async () => {
      attempts += 1;
      if (attempts === 1 || connectedOnce || refreshAttempted) {
        return;
      }
      refreshAttempted = true;
      try {
        await refreshAccessTokenOnce();
      } catch {
        // 갱신 실패는 그대로 둔다 — 어차피 CONNECT 가 거절된다.
      }
    },
    onConnect: () => {
      // 첫 연결은 갭이 없다 — 화면이 방금 내역을 받았다.
      const isReconnect = connectedOnce;
      connectedOnce = true;
      refreshAttempted = false;
      subscriptions.clear();
      // 에러 큐를 **먼저** 건다. 방 토픽을 먼저 걸면 그 구독이 거절될 때
      // 통지를 받을 구독처가 아직 없어 조용히 사라진다.
      subscriptions.set(ERROR_QUEUE, next.subscribe(ERROR_QUEUE, onErrorFrame));
      roomListeners.forEach((handlers, roomId) => {
        subscribeRoomChannels(roomId);
        if (isReconnect) {
          handlers.forEach((handler) => handler.onReconnect?.());
        }
      });
    },
    onWebSocketClose: () => {
      subscriptions.clear();
    },
  });
  client = next;
  next.activate();
  return next;
}

/**
 * 방 수신 시작. 반환된 함수를 호출하면 이 리스너만 떨어진다. 마지막
 * 리스너가 빠지면 그 방 구독을 끊되 연결은 유지한다 — 화면을 오갈 때마다
 * 핸드셰이크를 반복하지 않기 위해서다.
 */
export function subscribeChatRoom(
  roomId: number,
  handlers: ChatRoomHandlers
): () => void {
  const existing = roomListeners.get(roomId);
  const set = existing ?? new Set<ChatRoomHandlers>();
  set.add(handlers);
  roomListeners.set(roomId, set);
  ensureClient();
  subscribeRoomChannels(roomId);

  return () => {
    const current = roomListeners.get(roomId);
    if (!current) {
      return;
    }
    current.delete(handlers);
    if (current.size > 0) {
      return;
    }
    roomListeners.delete(roomId);
    ROOM_CHANNELS.forEach((channel) => {
      const destination = `/topic/chat/rooms/${roomId}${channel}`;
      subscriptions.get(destination)?.unsubscribe();
      subscriptions.delete(destination);
    });
  };
}

/** 로그아웃 등에서 연결 자체를 접는다. */
export function closeChatSocket(): void {
  roomListeners.clear();
  subscriptions.clear();
  connectedOnce = false;
  refreshAttempted = false;
  attempts = 0;
  void client?.deactivate();
  client = null;
}
