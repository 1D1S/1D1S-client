import Cookies from 'js-cookie';
import { afterEach, describe, expect, it } from 'vitest';

import {
  getSessionDismissedPopupKeys,
  sessionDismissPopupKeys,
} from './popupDismissal';

// 세션 차단은 이제 WebView 간 공유되는 세션 쿠키에 저장한다(sessionStorage 는
// 인스턴스별로 갈려 다른 탭/리로드에서 재노출됐다).
const SESSION_COOKIE = '1d1s:sessionDismissedPopups';

afterEach(() => {
  Cookies.remove(SESSION_COOKIE);
});

describe('session popup dismissal', () => {
  it('빈 세션에서는 차단 key 가 없다', () => {
    expect(getSessionDismissedPopupKeys()).toEqual([]);
  });

  it('기록한 key 를 되읽는다', () => {
    sessionDismissPopupKeys(['a', 'b']);
    expect(getSessionDismissedPopupKeys().sort()).toEqual(['a', 'b']);
  });

  it('여러 번 기록해도 중복 없이 합쳐진다', () => {
    sessionDismissPopupKeys(['a']);
    sessionDismissPopupKeys(['a', 'b']);
    expect(getSessionDismissedPopupKeys().sort()).toEqual(['a', 'b']);
  });

  it('손상된 값이면 빈 배열로 복구한다', () => {
    Cookies.set(SESSION_COOKIE, '{bad');
    expect(getSessionDismissedPopupKeys()).toEqual([]);
  });

  it('배열이 아닌 JSON 이면 빈 배열을 반환한다', () => {
    Cookies.set(SESSION_COOKIE, '"x"');
    expect(getSessionDismissedPopupKeys()).toEqual([]);
  });
});
