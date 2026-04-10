export interface DiaryCommentAuthor {
  id: number;
  nickname: string | null;
  profileImage: string | null;
}

export interface DiaryComment {
  id: number;
  parentCommentId: number | null;
  content: string;
  createdAt: string;
  author: DiaryCommentAuthor;
  isDeleted: boolean;
}

export interface DiaryCommentPageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface DiaryCommentListResponse {
  items: DiaryComment[];
  pageInfo: DiaryCommentPageInfo;
}

export interface DiaryCommentListParams {
  page?: number;
  size?: number;
}

export interface CreateCommentRequest {
  content: string;
}
