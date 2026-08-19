import { apiClient } from '@module/api/client';
import { UPLOAD_TIMEOUT_MS } from '@module/api/config';
import { requestData } from '@module/api/request';

import {
  ChatImagePresign,
  ChatMessage,
  ChatMessagePage,
  ChatReadStates,
  ChatReportRequest,
  ChatRoomList,
  ChatSendRequest,
  ChatShareResolution,
} from '../type/chat';

/** 서버 ChatImageService.MAX_IMAGE_SIZE 와 같은 값. */
export const CHAT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

/**
 * 서버가 받는 확장자 ↔ contentType 매핑. 둘이 어긋나면 400 이다.
 * 업로드가 끝난 뒤에도 서버가 HEAD 로 크기·타입을 다시 확인한다.
 */
export function chatImageContentType(fileName: string): string | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.heic')) {
    return 'image/heic';
  }
  return null;
}

/**
 * 채팅 presign 은 서명에 **contentType 과 contentLength 만** 넣는다.
 * 공용 putToStorage 는 Cache-Control 을 붙이므로 여기서는 쓸 수 없다 —
 * 서명에 없는 헤더를 덧붙이면 S3 가 403(SignatureDoesNotMatch)을 준다.
 */
async function putChatImage(
  uploadUrl: string,
  file: File,
  contentType: string
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`이미지 업로드 실패 (${response.status})`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 방 목록 응답은 배열(구) / 객체(신) 두 형태가 있다. 배포 시점이 어긋날 수
 * 있어 둘 다 읽는다 — 구 형식이면 hiddenMemberIds 는 비어 있다.
 */
function parseRoomList(data: unknown): ChatRoomList {
  const payload = data as Partial<ChatRoomList> | ChatRoomList['rooms'];
  if (Array.isArray(payload)) {
    return { rooms: payload, hiddenMemberIds: [] };
  }
  return {
    rooms: payload?.rooms ?? [],
    hiddenMemberIds: payload?.hiddenMemberIds ?? [],
  };
}

export const chatApi = {
  /** archived 를 생략하면 전체(보관 포함)를 준다. */
  getRooms: async (params?: { archived?: boolean }): Promise<ChatRoomList> =>
    parseRoomList(
      await requestData<unknown>(apiClient, {
        url: '/chat/rooms',
        method: 'GET',
        params,
      })
    ),

  /** 최신순 한 페이지. 첫 페이지는 cursor 를 생략한다. */
  getMessages: async (
    roomId: number,
    params?: { cursor?: string; size?: number }
  ): Promise<ChatMessagePage> =>
    requestData<ChatMessagePage>(apiClient, {
      url: `/chat/rooms/${roomId}/messages`,
      method: 'GET',
      params,
    }),

  /**
   * REST 전송. 소켓이 아직 안 붙었어도 나가고, 응답과 브로드캐스트가 두 번
   * 도착해도 clientMessageId 로 하나로 합쳐진다(서버 멱등).
   */
  sendMessage: async (
    roomId: number,
    data: ChatSendRequest
  ): Promise<ChatMessage> =>
    requestData<ChatMessage, ChatSendRequest>(apiClient, {
      url: `/chat/rooms/${roomId}/messages`,
      method: 'POST',
      data,
    }),

  /**
   * 메시지 신고. 서버는 접수만 하고(PENDING) 메시지를 곧바로 가리지 않는다 —
   * 숨김(HIDDEN)은 관리자가 신고를 승인했을 때만 일어난다. 그래서 화면도
   * 신고 직후에 말풍선을 바꾸지 않는다.
   */
  reportMessage: async (
    messageId: number,
    data: ChatReportRequest
  ): Promise<void> =>
    requestData<void, ChatReportRequest>(apiClient, {
      url: `/chat/messages/${messageId}/reports`,
      method: 'POST',
      data,
    }),

  /**
   * 방 멤버 전원의 읽음 위치. 방에 들어갈 때 한 번 받아 두고, 이후 갱신은
   * `/topic/chat/rooms/{id}/read` 구독으로 한 줄씩 받는다.
   */
  getReadStates: async (roomId: number): Promise<ChatReadStates> =>
    requestData<ChatReadStates>(apiClient, {
      url: `/chat/rooms/${roomId}/read-states`,
      method: 'GET',
    }),

  markRead: async (roomId: number, lastReadMessageId: number): Promise<void> =>
    requestData<void, { lastReadMessageId: number }>(apiClient, {
      url: `/chat/rooms/${roomId}/read`,
      method: 'PUT',
      data: { lastReadMessageId },
    }),

  setNotifications: async (roomId: number, enabled: boolean): Promise<void> =>
    requestData<void, { enabled: boolean }>(apiClient, {
      url: `/chat/rooms/${roomId}/notifications`,
      method: 'PUT',
      data: { enabled },
    }),

  setNotice: async (roomId: number, messageId: number): Promise<void> =>
    requestData<void, { messageId: number }>(apiClient, {
      url: `/chat/rooms/${roomId}/notice`,
      method: 'PUT',
      data: { messageId },
    }),

  clearNotice: async (roomId: number): Promise<void> =>
    requestData<void>(apiClient, {
      url: `/chat/rooms/${roomId}/notice`,
      method: 'DELETE',
    }),

  /**
   * 붙여넣은 링크가 공유 카드가 될 수 있는지 서버에 묻는다. 판정에 실패하면
   * 그냥 글로 보낸다 — 링크 하나 때문에 전송을 막지 않는다.
   */
  resolveShare: async (url: string): Promise<ChatShareResolution> => {
    try {
      return await requestData<ChatShareResolution, { url: string }>(
        apiClient,
        { url: '/chat/shares/resolve', method: 'POST', data: { url } }
      );
    } catch {
      return { shareable: false, type: null, targetId: null, share: null };
    }
  },

  /** presign → S3 PUT → imageUploadId. 전송은 호출부가 이어서 한다. */
  uploadImage: async (roomId: number, file: File): Promise<string> => {
    const contentType = chatImageContentType(file.name);
    if (!contentType) {
      throw new Error('jpg · png · heic 만 보낼 수 있습니다.');
    }
    if (file.size > CHAT_IMAGE_MAX_BYTES) {
      throw new Error('이미지는 10MB 이하만 보낼 수 있습니다.');
    }
    // ponytail: 압축하지 않는다. 서버가 확장자와 contentType 일치를 요구해
    // (png → image/jpeg 로 재인코딩되면 400) 압축이 오히려 전송을 깬다.
    const { uploadUrl, imageUploadId } = await requestData<
      ChatImagePresign,
      { fileName: string; contentType: string; fileSize: number }
    >(apiClient, {
      url: `/chat/rooms/${roomId}/images/presign`,
      method: 'POST',
      data: {
        fileName: file.name,
        contentType,
        fileSize: file.size,
      },
    });
    await putChatImage(uploadUrl, file, contentType);
    return imageUploadId;
  },
};
