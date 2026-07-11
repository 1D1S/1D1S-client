import { afterEach, describe, expect, it, vi } from 'vitest';

import { authStorage } from './auth';

afterEach(() => {
  localStorage.clear();
});

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
