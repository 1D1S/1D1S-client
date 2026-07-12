import { afterEach, describe, expect, it } from 'vitest';

import {
  getSessionDismissedPopupKeys,
  sessionDismissPopupKeys,
} from './popupDismissal';

afterEach(() => {
  window.sessionStorage.clear();
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
    window.sessionStorage.setItem('1d1s:sessionDismissedPopups', '{bad');
    expect(getSessionDismissedPopupKeys()).toEqual([]);
  });

  it('배열이 아닌 JSON 이면 빈 배열을 반환한다', () => {
    window.sessionStorage.setItem('1d1s:sessionDismissedPopups', '"x"');
    expect(getSessionDismissedPopupKeys()).toEqual([]);
  });
});
