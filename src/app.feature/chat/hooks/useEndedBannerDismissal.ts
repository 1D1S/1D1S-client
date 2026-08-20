'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

const STORAGE_KEY = '1d1s:chat:endedBannerDismissed';

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// 스냅샷은 참조가 안정적이어야 한다 — 배열을 새로 만들면 매 렌더 갱신으로
// 읽혀 무한 루프가 된다. 원본 문자열을 그대로 스냅샷으로 쓴다.
function getSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

// SSR 에서는 아직 모른다. 껐던 배너가 하이드레이션 직후 번쩍이지 않도록
// null 로 두고, 클라이언트가 읽은 뒤에만 판정한다.
function getServerSnapshot(): null {
  return null;
}

/** "다시 보지 않기" 를 누른 방들. 기기에 남긴다. */
export function useEndedBannerDismissal(roomId: number): {
  /** null 이면 아직 모름 — 그동안은 배너를 그리지 않는다. */
  dismissed: boolean | null;
  dismiss(): void;
} {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const dismissed = useMemo(() => {
    if (raw === null) {
      return null;
    }
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) && parsed.includes(roomId);
    } catch {
      return false;
    }
  }, [raw, roomId]);

  const dismiss = useCallback(() => {
    try {
      const parsed: unknown = JSON.parse(getSnapshot() || '[]');
      const current = Array.isArray(parsed) ? parsed : [];
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(new Set([...current, roomId])))
      );
    } catch {
      // 저장 실패는 그대로 둔다 — 다음 진입에 배너가 다시 보일 뿐이다.
    }
    listeners.forEach((listener) => listener());
  }, [roomId]);

  return { dismissed, dismiss };
}
