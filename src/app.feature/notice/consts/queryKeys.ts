import { NoticeListParams } from '../type/notice';

export const NOTICE_QUERY_KEYS = {
  all: ['notices'] as const,
  lists: () => [...NOTICE_QUERY_KEYS.all, 'list'] as const,
  list: (params?: NoticeListParams) =>
    [...NOTICE_QUERY_KEYS.lists(), params] as const,
  details: () => [...NOTICE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...NOTICE_QUERY_KEYS.details(), id] as const,
};
