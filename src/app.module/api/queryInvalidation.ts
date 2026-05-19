import type { QueryClient } from '@tanstack/react-query';

/**
 * 여러 query key를 한 번에 무효화한다.
 * onSuccess 콜백에서 반복되는 invalidateQueries 호출을 줄이기 위한 헬퍼.
 *
 * `null`/`undefined` 항목은 조건부 invalidate (e.g. id가 있을 때만) 를
 * 호출부에서 깔끔하게 표현할 수 있도록 무시한다.
 */
export function invalidateAll(
  queryClient: QueryClient,
  keys: ReadonlyArray<readonly unknown[] | null | undefined>
): void {
  for (const key of keys) {
    if (key) {
      queryClient.invalidateQueries({ queryKey: key });
    }
  }
}
