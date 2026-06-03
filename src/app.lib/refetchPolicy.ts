/**
 * "다시 돌아왔을 때 최신이어야 하는" 화면(홈/챌린지 리스트/일지 리스트)용
 * refetch 정책.
 *
 * 전역 기본값(getQueryClient)은 읽기 위주 데이터 보호를 위해
 * `refetchOnWindowFocus:false`, `refetchOnMount:false`, `staleTime:5분` 이다.
 * 이 정책을 해당 훅에만 spread 해서 다음을 보장한다.
 * - 다른 창/탭을 보다 돌아오면(window focus) 항상 재요청한다.
 * - 30초 후부터 stale 로 보고, 페이지 재진입(remount) 시 재요청한다.
 *   (SSR prefetch 직후 곧바로 중복 요청하는 것은 막는다.)
 *
 * 상세/폼/작성 화면 등 다른 쿼리는 전역 기본값을 그대로 따른다.
 */
export const FRESH_ON_RETURN = {
  staleTime: 30_000,
  refetchOnWindowFocus: 'always',
  refetchOnMount: true,
} as const;
