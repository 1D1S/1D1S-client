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

// 그냥 닫기로 이번 세션 동안만 차단할 팝업 key 목록.
//
// 세션 "쿠키"(expires 없음)로 저장한다. 예전엔 sessionStorage 였는데, 앱은 탭마다
// WebView 를 따로 띄우고 리로드/재생성 시 sessionStorage 가 인스턴스별로 갈려
// 한 탭에서 닫아도 다른 탭·리로드된 WebView 는 몰라 팝업이 다시 떴다. 세션
// 쿠키는 Android WebView 의 공용 CookieManager 에 올라가 앱 세션 동안 모든
// WebView 가 공유하므로, 한 번 닫으면 세션 내 재노출을 막는다(앱 종료 시 소멸).
const SESSION_DISMISSED_POPUPS_KEY = '1d1s:sessionDismissedPopups';

export function getSessionDismissedPopupKeys(): string[] {
  const raw = Cookies.get(SESSION_DISMISSED_POPUPS_KEY);
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

// 현재 노출된 모든 팝업 key 를 세션 차단 목록에 합쳐 기록한다.
export function sessionDismissPopupKeys(keys: string[]): void {
  const merged = Array.from(
    new Set([...getSessionDismissedPopupKeys(), ...keys])
  );
  // expires 미지정 = 세션 쿠키. 앱 세션 동안 모든 WebView 가 공유한다.
  Cookies.set(SESSION_DISMISSED_POPUPS_KEY, JSON.stringify(merged), {
    sameSite: 'lax',
    secure:
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:',
  });
}
