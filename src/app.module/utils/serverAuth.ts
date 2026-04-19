import { cookies, headers } from 'next/headers';

import { ACCESS_TOKEN_COOKIE_CANDIDATES } from './tokenCookie';

/**
 * 서버 컴포넌트에서 접근 토큰 쿠키 존재 여부를 확인한다.
 * - 미들웨어의 prefetch 스킵 등 엣지 케이스를 우회하여,
 *   RSC 렌더링 시점에 직접 쿠키를 검사한다.
 */
export async function hasServerAccessToken(): Promise<boolean> {
  const cookieStore = await cookies();
  return ACCESS_TOKEN_COOKIE_CANDIDATES.some((name) => {
    const value = cookieStore.get(name)?.value;
    return Boolean(value?.trim());
  });
}

function appendLoginRequired(pathWithMaybeQuery: string): string {
  const [path, query = ''] = pathWithMaybeQuery.split('?');
  const params = new URLSearchParams(query);
  params.set('loginRequired', 'true');
  return `${path}?${params.toString()}`;
}

/**
 * 로그인 필요 시 돌려보낼 URL을 결정한다.
 * - 같은 오리진의 Referer가 있으면 거기로 되돌아간다 (사용자가 온 페이지에서 모달을 띄우기 위함)
 * - 외부 Referer거나 Referer가 없으면 fallback 경로 사용
 * - 되돌릴 URL이 보호 상세 경로 자기 자신이면 무한 루프 방지 위해 fallback 사용
 */
export async function resolveLoginRequiredRedirect(
  fallbackPath: string,
  currentPathname: string
): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get('host');
  const referer = headerStore.get('referer');

  if (!referer || !host) {
    return appendLoginRequired(fallbackPath);
  }

  let refererUrl: URL;
  try {
    refererUrl = new URL(referer);
  } catch {
    return appendLoginRequired(fallbackPath);
  }

  if (refererUrl.host !== host) {
    return appendLoginRequired(fallbackPath);
  }

  // Referer가 현재 보호 경로와 같으면 루프 방지
  if (refererUrl.pathname === currentPathname) {
    return appendLoginRequired(fallbackPath);
  }

  refererUrl.searchParams.set('loginRequired', 'true');
  return `${refererUrl.pathname}${refererUrl.search}${refererUrl.hash}`;
}
