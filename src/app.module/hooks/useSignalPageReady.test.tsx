import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSignalPageReady } from './useSignalPageReady';

// 핸드셰이크(`__1D1S_FEATURES__`) 주입 시점을 테스트가 직접 통제한다.
const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  skeletonAvailable: { value: false },
}));

vi.mock('@module/utils/nativeBridge', () => ({
  isNativeSkeletonAvailable: (): boolean => mocks.skeletonAvailable.value,
  sendNativePageReady: mocks.send,
}));

vi.mock('next/navigation', () => ({
  usePathname: (): string => '/challenge',
}));

function Probe({ ready }: { ready: boolean }): null {
  useSignalPageReady('challenge_board', ready);
  return null;
}

/** 앱이 핸드셰이크를 주입하는 순간(플래그 세팅 + native:ready 발화). */
function injectHandshake(): void {
  act(() => {
    mocks.skeletonAvailable.value = true;
    window.dispatchEvent(new Event('native:ready'));
  });
}

beforeEach(() => {
  mocks.send.mockClear();
  mocks.skeletonAvailable.value = false;
  // double rAF 를 동기 실행해 emit 을 즉시 관측한다.
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback): number => {
    cb(0);
    return 0;
  });
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useSignalPageReady', () => {
  it('핸드셰이크가 이미 끝났으면 즉시 emit 한다', () => {
    mocks.skeletonAvailable.value = true;

    render(<Probe ready />);

    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(mocks.send).toHaveBeenCalledWith('challenge_board', '/challenge');
  });

  it('핸드셰이크 전에는 emit 하지 않는다', () => {
    render(<Probe ready />);

    expect(mocks.send).not.toHaveBeenCalled();
  });

  it('ready 가 첫 렌더부터 true 여도 늦게 온 핸드셰이크에 재시도한다', () => {
    // 회귀 방지 본체: 예전 구현은 effect 가 플래그 주입 전에 한 번 돌고
    // 끝나 page_ready 가 영구 유실됐다(앱 스켈레톤 12초 유지).
    render(<Probe ready />);
    expect(mocks.send).not.toHaveBeenCalled();

    injectHandshake();

    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(mocks.send).toHaveBeenCalledWith('challenge_board', '/challenge');
  });

  it('핸드셰이크가 여러 번 와도 route 당 1회만 emit 한다', () => {
    render(<Probe ready />);
    injectHandshake();
    injectHandshake();

    expect(mocks.send).toHaveBeenCalledTimes(1);
  });

  it('ready 가 false 면 핸드셰이크가 와도 emit 하지 않는다', () => {
    render(<Probe ready={false} />);
    injectHandshake();

    expect(mocks.send).not.toHaveBeenCalled();
  });
});
