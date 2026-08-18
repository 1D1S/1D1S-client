import { describe, expect, it } from 'vitest';

import {
  APP_OPEN_TIMEOUT_MS,
  shouldFallbackToStore,
  SUSPEND_DRIFT_MS,
} from './openApp';

// 오판의 대가가 비대칭이다 — 안 보내면 한 번 더 누르면 되지만, 잘못
// 보내면 이미 열린 앱을 App Store 가 덮는다. 그래서 "앱이 열렸다" 신호가
// 하나라도 있으면 보내지 않는지를 각각 잠근다.
describe('shouldFallbackToStore', () => {
  const onTime = { elapsedMs: APP_OPEN_TIMEOUT_MS };

  it('앱이 안 열렸으면(화면 그대로, 제시간) 스토어로 보낸다', () => {
    expect(
      shouldFallbackToStore({ wentHidden: false, hiddenNow: false, ...onTime })
    ).toBe(true);
  });

  it('중간에 화면이 숨겨졌으면 보내지 않는다 — 앱이 앞으로 나온 것이다', () => {
    expect(
      shouldFallbackToStore({ wentHidden: true, hiddenNow: false, ...onTime })
    ).toBe(false);
  });

  it('지금 숨겨져 있으면 보내지 않는다', () => {
    expect(
      shouldFallbackToStore({ wentHidden: false, hiddenNow: true, ...onTime })
    ).toBe(false);
  });

  it('타이머가 늦게 돌았으면 보내지 않는다 — 그동안 페이지가 정지돼 있었다', () => {
    // 앱에서 한참 있다가 돌아와 뒤늦게 콜백이 실행된 경우.
    expect(
      shouldFallbackToStore({
        wentHidden: false,
        hiddenNow: false,
        elapsedMs: APP_OPEN_TIMEOUT_MS + SUSPEND_DRIFT_MS + 1,
      })
    ).toBe(false);
    // 반대로 오차 범위 안이면 정상 타임아웃으로 본다.
    expect(
      shouldFallbackToStore({
        wentHidden: false,
        hiddenNow: false,
        elapsedMs: APP_OPEN_TIMEOUT_MS + SUSPEND_DRIFT_MS - 1,
      })
    ).toBe(true);
  });
});
