import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMarkDetailAsRead } from './useMarkDetailAsRead';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  loggedIn: { value: true },
}));

vi.mock('./useNotificationMutations', () => ({
  useMarkTargetAsRead: () => ({ mutate: mocks.mutate }),
}));

vi.mock('@feature/member/hooks/useIsLoggedIn', () => ({
  useIsLoggedIn: (): boolean => mocks.loggedIn.value,
}));

function Probe({
  targetId,
  enabled = true,
}: {
  targetId: number;
  enabled?: boolean;
}): null {
  useMarkDetailAsRead('CHALLENGE_DETAIL', targetId, enabled);
  return null;
}

beforeEach(() => {
  mocks.mutate.mockClear();
  mocks.loggedIn.value = true;
});

describe('useMarkDetailAsRead', () => {
  it('마운트 시 1회 호출한다', () => {
    render(<Probe targetId={7} />);

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    expect(mocks.mutate).toHaveBeenCalledWith({
      targetType: 'CHALLENGE_DETAIL',
      targetId: 7,
    });
  });

  it('리렌더로는 다시 호출하지 않는다', () => {
    const { rerender } = render(<Probe targetId={7} />);
    rerender(<Probe targetId={7} />);
    rerender(<Probe targetId={7} />);

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
  });

  it('targetId 가 바뀌면 새로 호출한다', () => {
    const { rerender } = render(<Probe targetId={7} />);
    rerender(<Probe targetId={8} />);

    expect(mocks.mutate).toHaveBeenCalledTimes(2);
    expect(mocks.mutate).toHaveBeenLastCalledWith({
      targetType: 'CHALLENGE_DETAIL',
      targetId: 8,
    });
  });

  it('비로그인이면 호출하지 않는다', () => {
    mocks.loggedIn.value = false;

    render(<Probe targetId={7} />);

    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('로그인이 늦게 확정되면 그때 호출한다', () => {
    // 부팅 프로브(authStatus unknown → authenticated) 경로.
    mocks.loggedIn.value = false;
    const { rerender } = render(<Probe targetId={7} />);
    expect(mocks.mutate).not.toHaveBeenCalled();

    mocks.loggedIn.value = true;
    rerender(<Probe targetId={7} />);

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
  });

  it('유효하지 않은 id 는 건너뛴다', () => {
    render(<Probe targetId={0} />);
    render(<Probe targetId={Number.NaN} />);

    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('enabled=false 면 호출하지 않는다', () => {
    render(<Probe targetId={7} enabled={false} />);

    expect(mocks.mutate).not.toHaveBeenCalled();
  });
});
