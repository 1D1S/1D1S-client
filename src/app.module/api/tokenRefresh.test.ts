import { afterEach, describe, expect, it, vi } from 'vitest';

// config.ts 가 jsdom(window 존재)에서 env 없으면 throw 하므로 임포트 전에 설정.
process.env.NEXT_PUBLIC_ODOS_API_URL = 'http://localhost/api';

// axios.get 만 스텁한다. runAuthBootProbe → refreshAccessTokenOnce → axios.get.
vi.mock('axios', () => ({
  default: { get: vi.fn() },
}));

interface BootProbeModules {
  get: ReturnType<typeof vi.fn>;
  authStorage: typeof import('@module/utils/auth').authStorage;
  runAuthBootProbe: typeof import('./tokenRefresh').runAuthBootProbe;
  refreshAccessTokenOnce: typeof import('./tokenRefresh').refreshAccessTokenOnce;
}

// 매 테스트마다 모듈 그래프를 리셋해 authStorage 상태를 'unknown' 으로,
// single-flight inFlight 를 null 로 되돌린다.
async function loadFresh(): Promise<BootProbeModules> {
  vi.resetModules();
  const axios = (await import('axios')).default as unknown as {
    get: ReturnType<typeof vi.fn>;
  };
  axios.get.mockReset();
  const { authStorage } = await import('@module/utils/auth');
  const { runAuthBootProbe, refreshAccessTokenOnce } = await import(
    './tokenRefresh'
  );
  return { get: axios.get, authStorage, runAuthBootProbe, refreshAccessTokenOnce };
}

const unauthorized = {
  isAxiosError: true,
  response: { status: 401 },
};

const networkError = { isAxiosError: true, message: 'Network Error' };

afterEach(() => {
  localStorage.clear();
});

describe('runAuthBootProbe', () => {
  it('힌트 없음 + 세션 유효(서버 200) → authenticated (Safari PWA 콜드 스타트 복구)', async () => {
    const { get, authStorage, runAuthBootProbe } = await loadFresh();
    // 힌트(localStorage/쿠키) 전무 — Safari standalone PWA 소실 상황.
    get.mockResolvedValue({ data: {} });

    await runAuthBootProbe();

    expect(get).toHaveBeenCalledTimes(1);
    expect(authStorage.getStatus()).toBe('authenticated');
  });

  it('힌트 있음 + 쿠키 만료(서버 401) → guest (스테일 힌트 무시)', async () => {
    const { get, authStorage, runAuthBootProbe } = await loadFresh();
    localStorage.setItem('1d1s:isAuthenticated', 'true'); // 스테일 힌트
    get.mockRejectedValue(unauthorized);

    await runAuthBootProbe();

    expect(authStorage.getStatus()).toBe('guest');
  });

  it('판정 불가(네트워크 오류) + 힌트 있음 → authenticated (낙관적 유지)', async () => {
    const { get, authStorage, runAuthBootProbe } = await loadFresh();
    localStorage.setItem('1d1s:isAuthenticated', 'true');
    get.mockRejectedValue(networkError);

    await runAuthBootProbe();

    expect(authStorage.getStatus()).toBe('authenticated');
  });

  it('판정 불가(네트워크 오류) + 힌트 없음 → guest', async () => {
    const { get, authStorage, runAuthBootProbe } = await loadFresh();
    get.mockRejectedValue(networkError);

    await runAuthBootProbe();

    expect(authStorage.getStatus()).toBe('guest');
  });

  it('single-flight: 동시 호출이 겹쳐도 서버 요청은 1발', async () => {
    const { get, authStorage, runAuthBootProbe } = await loadFresh();
    get.mockResolvedValue({ data: {} });

    await Promise.all([runAuthBootProbe(), runAuthBootProbe()]);

    expect(get).toHaveBeenCalledTimes(1);
    expect(authStorage.getStatus()).toBe('authenticated');
  });
});
