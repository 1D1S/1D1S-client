import { afterEach, describe, expect, it, vi } from 'vitest';

import { authStorage } from './auth';

afterEach(() => {
  localStorage.clear();
});

// 상태 전이는 모듈 레벨 변수라 테스트 간 격리를 위해 fresh import 로 초기
// 'unknown' 상태를 복원한다.
async function freshAuthStorage(): Promise<typeof authStorage> {
  vi.resetModules();
  return (await import('./auth')).authStorage;
}

describe('authStorage subscribe', () => {
  it('notifies subscribers on markAuthenticated and clearTokens', () => {
    const listener = vi.fn();
    const unsubscribe = authStorage.subscribe(listener);

    authStorage.markAuthenticated();
    authStorage.clearTokens();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    authStorage.markAuthenticated();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe('authStorage.getStatus', () => {
  it('starts as unknown before any resolution', async () => {
    const auth = await freshAuthStorage();
    expect(auth.getStatus()).toBe('unknown');
  });

  it('markAuthenticated → authenticated, clearTokens → guest', async () => {
    const auth = await freshAuthStorage();
    auth.markAuthenticated();
    expect(auth.getStatus()).toBe('authenticated');
    auth.clearTokens();
    expect(auth.getStatus()).toBe('guest');
  });

  it('settleGuest resolves unknown → guest', async () => {
    const auth = await freshAuthStorage();
    auth.settleGuest();
    expect(auth.getStatus()).toBe('guest');
  });

  it('settleGuest does not override an authenticated status', async () => {
    const auth = await freshAuthStorage();
    auth.markAuthenticated();
    auth.settleGuest();
    expect(auth.getStatus()).toBe('authenticated');
  });
});
