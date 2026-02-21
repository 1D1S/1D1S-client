import { authStorage } from '@module/utils/auth';
import axios from 'axios';
import { toast } from 'sonner';

import type { ApiErrorResponse, NormalizedApiError } from './types';

const DEFAULT_ERROR_MESSAGE =
  '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
const NETWORK_ERROR_MESSAGE = '네트워크 연결을 확인한 뒤 다시 시도해 주세요.';
const TIMEOUT_ERROR_MESSAGE =
  '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.';
const UNAUTHORIZED_ERROR_MESSAGE = '로그인이 필요하거나 세션이 만료되었습니다.';

const TOASTED_ERRORS = new WeakSet<object>();
let isRedirecting = false;

const STATUS_ERROR_MESSAGE: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: UNAUTHORIZED_ERROR_MESSAGE,
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  408: TIMEOUT_ERROR_MESSAGE,
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  502: '서버와 연결할 수 없습니다.',
  503: '서비스가 일시적으로 불가능합니다.',
  504: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.',
};

const getResponseMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const apiError = payload as ApiErrorResponse;
  return typeof apiError.message === 'string' && apiError.message.trim()
    ? apiError.message
    : null;
};

export const isUnauthorizedError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 401;

export const normalizeApiError = (error: unknown): NormalizedApiError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payloadMessage = getResponseMessage(error.response?.data);

    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return {
          code: error.code,
          message: TIMEOUT_ERROR_MESSAGE,
        };
      }

      return {
        code: error.code,
        message: NETWORK_ERROR_MESSAGE,
      };
    }

    return {
      status,
      code: error.code,
      message:
        payloadMessage ||
        (status ? STATUS_ERROR_MESSAGE[status] : null) ||
        DEFAULT_ERROR_MESSAGE,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || DEFAULT_ERROR_MESSAGE,
    };
  }

  return {
    message: DEFAULT_ERROR_MESSAGE,
  };
};

const shouldSkipToast = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  if (TOASTED_ERRORS.has(error)) {
    return true;
  }

  TOASTED_ERRORS.add(error);
  return false;
};

export const notifyApiError = (error: unknown): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (shouldSkipToast(error)) {
    return;
  }

  const normalizedError = normalizeApiError(error);
  toast.error(normalizedError.message);
};

export const handleAuthError = (error: unknown): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!isUnauthorizedError(error)) {
    return;
  }

  authStorage.clearTokens();

  notifyApiError(error);

  if (!isRedirecting) {
    isRedirecting = true;
    window.location.assign('/login');
  }
};
