export interface ApiResponse<TData> {
  message?: string;
  data: TData;
}

export interface ApiErrorResponse {
  message?: string;
  code?: string;
}

export interface NormalizedApiError {
  status?: number;
  code?: string;
  message: string;
}

export interface LikeInfo {
  likedByMe: boolean;
  likeCnt: number;
}

// 오프셋 페이지네이션 응답 공통 형태 — 일지/챌린지/멤버 목록이 공유한다.
export interface OffsetPageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNextPage: boolean;
}

export type QueryParamPrimitive = string | number | boolean;
export type QueryParamValue =
  | QueryParamPrimitive
  | QueryParamPrimitive[]
  | null
  | undefined;
