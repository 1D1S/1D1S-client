import type { OffsetPageInfo } from '@module/api/types';

/** 공지 단건 — 작성자 정보 없음. content 는 어드민 tiptap 이 저장한 HTML. */
export interface Notice {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeListData {
  items: Notice[];
  pageInfo: OffsetPageInfo;
}

export interface NoticeListParams {
  page?: number;
  size?: number;
}
