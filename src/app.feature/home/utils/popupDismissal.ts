import Cookies from 'js-cookie';

// "다시 보지 않기"로 등록된 팝업 key 목록을 담는 장기 쿠키(JSON 배열).
// JS 접근 가능한 일반 쿠키다.
const DISMISSED_POPUPS_COOKIE = '1d1s:dismissedPopups';
const EXPIRES_DAYS = 365;

export function getDismissedPopupKeys(): string[] {
  const raw = Cookies.get(DISMISSED_POPUPS_COOKIE);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((key): key is string => typeof key === 'string')
      : [];
  } catch {
    return [];
  }
}

// 현재 노출된 모든 팝업 key 를 기존 목록과 합쳐 쿠키에 등록한다.
export function dismissPopupKeys(keys: string[]): void {
  const merged = Array.from(
    new Set([...getDismissedPopupKeys(), ...keys])
  );
  Cookies.set(DISMISSED_POPUPS_COOKIE, JSON.stringify(merged), {
    expires: EXPIRES_DAYS,
    sameSite: 'lax',
    secure:
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:',
  });
}
