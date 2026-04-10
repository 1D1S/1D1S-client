import { apiClient } from '@module/api/client';
import {
  buildQueryString,
  requestBody,
  requestData,
} from '@module/api/request';

import {
  CreateCommentRequest,
  DiaryComment,
  DiaryCommentAuthor,
  DiaryCommentListParams,
  DiaryCommentListResponse,
  DiaryCommentPageInfo,
} from '../type/comment';

interface DiaryCommentAuthorApi {
  id?: number;
  memberId?: number;
  nickname?: string | null;
  profileImage?: string | null;
  profileImageUrl?: string | null;
}

interface DiaryCommentApi {
  id?: number;
  commentId?: number;
  parentCommentId?: number | null;
  content?: string | null;
  createdAt?: string | null;
  isDeleted?: boolean;
  deleted?: boolean;
  memberId?: number;
  authorInfoDto?: DiaryCommentAuthorApi | null;
  author?: DiaryCommentAuthorApi | null;
  member?: DiaryCommentAuthorApi | null;
}

interface DiaryCommentListApiResponse {
  items?: DiaryCommentApi[];
  pageInfo?: Partial<DiaryCommentPageInfo>;
}

const normalizeAuthor = (
  authorApi: DiaryCommentAuthorApi | null | undefined,
  fallbackMemberId?: number
): DiaryCommentAuthor => ({
  id: authorApi?.id ?? authorApi?.memberId ?? fallbackMemberId ?? 0,
  nickname: authorApi?.nickname ?? null,
  profileImage: authorApi?.profileImage ?? authorApi?.profileImageUrl ?? null,
});

const normalizeComment = (commentApi: DiaryCommentApi): DiaryComment => ({
  id: commentApi.id ?? commentApi.commentId ?? 0,
  parentCommentId: commentApi.parentCommentId ?? null,
  content: commentApi.content ?? '',
  createdAt: commentApi.createdAt ?? '',
  author: normalizeAuthor(
    commentApi.authorInfoDto ?? commentApi.author ?? commentApi.member,
    commentApi.memberId
  ),
  isDeleted: commentApi.isDeleted ?? commentApi.deleted ?? false,
});

const normalizePageInfo = (
  pageInfo: Partial<DiaryCommentPageInfo> | undefined,
  fallbackPage: number,
  fallbackSize: number
): DiaryCommentPageInfo => ({
  page: pageInfo?.page ?? fallbackPage,
  size: pageInfo?.size ?? fallbackSize,
  totalElements: pageInfo?.totalElements ?? 0,
  totalPages: pageInfo?.totalPages ?? 0,
  hasNextPage: pageInfo?.hasNextPage ?? false,
});

const normalizeListResponse = (
  response: DiaryCommentListApiResponse,
  fallbackPage: number,
  fallbackSize: number
): DiaryCommentListResponse => ({
  items: (response.items ?? []).map(normalizeComment),
  pageInfo: normalizePageInfo(response.pageInfo, fallbackPage, fallbackSize),
});

export const diaryCommentApi = {
  getDiaryComments: async (
    diaryId: number,
    params: DiaryCommentListParams = {}
  ): Promise<DiaryCommentListResponse> => {
    const page = params.page ?? 0;
    const size = params.size ?? 10;
    const query = buildQueryString({ page, size });
    const response = await requestData<DiaryCommentListApiResponse>(apiClient, {
      url: `/comments/diaries/${diaryId}?${query}`,
      method: 'GET',
    });

    return normalizeListResponse(response, page, size);
  },

  getCommentReplies: async (
    commentId: number,
    params: DiaryCommentListParams = {}
  ): Promise<DiaryCommentListResponse> => {
    const page = params.page ?? 0;
    const size = params.size ?? 10;
    const query = buildQueryString({ page, size });
    const response = await requestData<DiaryCommentListApiResponse>(apiClient, {
      url: `/comments/${commentId}/replies?${query}`,
      method: 'GET',
    });

    return normalizeListResponse(response, page, size);
  },

  createDiaryComment: async (
    diaryId: number,
    data: CreateCommentRequest
  ): Promise<void> => {
    await requestBody(apiClient, {
      url: `/comments/diaries/${diaryId}`,
      method: 'POST',
      data,
    });
  },

  createCommentReply: async (
    commentId: number,
    data: CreateCommentRequest
  ): Promise<void> => {
    await requestBody(apiClient, {
      url: `/comments/${commentId}/replies`,
      method: 'POST',
      data,
    });
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await requestBody(apiClient, {
      url: `/comments/${commentId}`,
      method: 'DELETE',
    });
  },
};
