import Cookies from 'js-cookie';
import { afterEach, describe, expect, it } from 'vitest';

import {
  dismissOfficialGuideBanner,
  isOfficialGuideBannerDismissed,
} from './officialGuideBannerDismissal';

const COOKIE = '1d1s:officialGuideBannerDismissed';

afterEach(() => {
  Cookies.remove(COOKIE);
});

describe('official guide banner dismissal', () => {
  it('기본값은 미차단(false)이다', () => {
    expect(isOfficialGuideBannerDismissed()).toBe(false);
  });

  it('다시 보지 않기 후에는 차단(true)으로 읽힌다', () => {
    dismissOfficialGuideBanner();
    expect(isOfficialGuideBannerDismissed()).toBe(true);
  });

  it('다른 값의 쿠키는 미차단으로 취급한다', () => {
    Cookies.set(COOKIE, '0');
    expect(isOfficialGuideBannerDismissed()).toBe(false);
  });
});
