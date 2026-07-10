import { useMemo } from 'react';

/**
 * id 기준으로 중복을 제거한다. 뒤에 온 항목이 앞을 덮어쓴다
 * (Map.set 의미) — 무한스크롤 페이지 경계에서 재수신된 항목의
 * 최신 상태가 유지되도록 하는 기존 동작을 그대로 보존한다.
 */
export function dedupeById<T>(items: T[], getId: (item: T) => number): T[] {
  const map = new Map<number, T>();
  items.forEach((item) => {
    map.set(getId(item), item);
  });
  return Array.from(map.values());
}

interface InfiniteData<TPage> {
  pages?: TPage[];
}

/**
 * useInfiniteQuery 결과의 pages 를 평탄화한 뒤 id 로 중복을 제거한다.
 * 일지 리스트 3개 화면에서 반복되던 `flatMap → Map dedupe` 를 공통화.
 */
export function useDedupedInfinitePages<TPage, TItem>(
  data: InfiniteData<TPage> | undefined,
  getItems: (page: TPage) => TItem[] | undefined,
  getId: (item: TItem) => number
): TItem[] {
  return useMemo(() => {
    const flattened =
      data?.pages?.flatMap((page) => getItems(page) ?? []) ?? [];
    return dedupeById(flattened, getId);
    // getItems/getId 는 구조적 셀렉터로 의미가 불변 — 기존 화면과
    // 동일하게 data 변경 시에만 재계산한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
}
