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

// 그냥 닫기로 이번 세션 동안만 차단할 팝업 key 목록을 담는 sessionStorage.
// 탭/브라우저를 닫으면 사라지므로 다음 세션엔 다시 노출된다.
const SESSION_DISMISSED_POPUPS_KEY = '1d1s:sessionDismissedPopups';

export function getSessionDismissedPopupKeys(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_DISMISSED_POPUPS_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((key): key is string => typeof key === 'string')
      : [];
  } catch {
    return [];
  }
}

// 현재 노출된 모든 팝업 key 를 세션 차단 목록에 합쳐 기록한다.
export function sessionDismissPopupKeys(keys: string[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  const merged = Array.from(
    new Set([...getSessionDismissedPopupKeys(), ...keys])
  );
  try {
    window.sessionStorage.setItem(
      SESSION_DISMISSED_POPUPS_KEY,
      JSON.stringify(merged)
    );
  } catch {
    // sessionStorage 접근 불가(프라이빗 모드 등)면 조용히 무시한다.
  }
}
