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

export type QueryParamPrimitive = string | number | boolean;
export type QueryParamValue =
  | QueryParamPrimitive
  | QueryParamPrimitive[]
  | null
  | undefined;
