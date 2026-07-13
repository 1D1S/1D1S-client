import Cookies from 'js-cookie';

// 공식 챌린지 가이드 배너의 "다시 보지 않기" 상태를 담는 장기 쿠키.
// popupDismissal 의 쿠키 패턴을 따르되, 배너가 하나라 boolean 으로 단순화한다.
const DISMISSED_COOKIE = '1d1s:officialGuideBannerDismissed';
const EXPIRES_DAYS = 365;

export function isOfficialGuideBannerDismissed(): boolean {
  // SSR/프리렌더에선 쿠키를 못 읽으므로 항상 false. 배너는 클라이언트에서만
  // 렌더하므로 이 값이 첫 페인트를 좌우한다.
  return Cookies.get(DISMISSED_COOKIE) === '1';
}

export function dismissOfficialGuideBanner(): void {
  Cookies.set(DISMISSED_COOKIE, '1', {
    expires: EXPIRES_DAYS,
    sameSite: 'lax',
    secure:
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:',
  });
}
