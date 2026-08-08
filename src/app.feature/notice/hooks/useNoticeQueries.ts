import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { noticeApi } from '../api/noticeApi';
import { NOTICE_QUERY_KEYS } from '../consts/queryKeys';
import { Notice, NoticeListData } from '../type/notice';

const NOTICE_PAGE_SIZE = 20;

/**
 * 공지 목록. 서버가 정렬(고정 우선)까지 끝내 주므로 응답 순서를 그대로 쓴다.
 * 실패는 삼키지 않는다 — 목록이 본문인 화면이라 "공지가 없어요" 로 위장하면
 * 사용자가 오류를 오해한다. 화면이 isError 를 받아 안내 문구를 그린다.
 */
export function useNoticesInfinite(): UseInfiniteQueryResult<
  InfiniteData<NoticeListData>,
  Error
> {
  return useInfiniteQuery({
    queryKey: NOTICE_QUERY_KEYS.list({ size: NOTICE_PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      noticeApi.getNotices({ page: pageParam, size: NOTICE_PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.page + 1 : undefined,
  });
}

/**
 * 홈/탐색 상단 스트립용 최신 1건.
 *
 * 비핵심 UI 라 엔드포인트 미배포·일시 오류로 실패해도 화면이 깨지면 안 된다.
 * queryFn 에서 오류를 삼켜 null 을 돌려주고, 소비처는 null 이면 렌더하지
 * 않는다(전역 에러 토스트도 뜨지 않음).
 */
export function useLatestNotice(): UseQueryResult<Notice | null, Error> {
  return useQuery({
    queryKey: NOTICE_QUERY_KEYS.list({ size: 1 }),
    queryFn: async () => {
      try {
        const data = await noticeApi.getNotices({ page: 0, size: 1 });
        return data.items[0] ?? null;
      } catch {
        return null;
      }
    },
  });
}

/**
 * 공지 단건. 404(NOTICE-001)를 포함한 실패는 상세 화면이 직접 안내하므로
 * 전역 토스트를 끈다 — 같은 사실을 두 번 알릴 이유가 없다.
 */
export function useNotice(id: string): UseQueryResult<Notice, Error> {
  return useQuery({
    queryKey: NOTICE_QUERY_KEYS.detail(id),
    queryFn: () => noticeApi.getNotice(id),
    meta: { skipGlobalErrorToast: true },
  });
}
