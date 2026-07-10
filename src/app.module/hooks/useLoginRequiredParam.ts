import { RETURN_TO_PARAM, sanitizeReturnTo } from '@module/utils/returnTo';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface LoginRequiredParam {
  /** `?loginRequired=true` 로 진입했는지 여부 */
  isLoginRequired: boolean;
  /** 로그인 후 복귀할 상세 경로 (무효면 null) */
  returnTo: string | null;
}

/**
 * 상세 → 목록 바운스 시 붙는 `loginRequired` / `returnTo` 쿼리를 읽고,
 * 첫 렌더 이후 URL 에서 두 파라미터를 제거한다. 다이얼로그 상태 처리는
 * 화면마다 상이하므로 반환값만 제공하고 표시 여부는 호출부가 결정한다.
 */
export function useLoginRequiredParam(): LoginRequiredParam {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoginRequired = searchParams.get('loginRequired') === 'true';
  const returnTo = sanitizeReturnTo(searchParams.get(RETURN_TO_PARAM));

  useEffect(() => {
    if (!isLoginRequired) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete('loginRequired');
    params.delete(RETURN_TO_PARAM);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [isLoginRequired, pathname, router, searchParams]);

  return { isLoginRequired, returnTo };
}
