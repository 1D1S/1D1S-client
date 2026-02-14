import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { authApi } from '../api/auth-api';
import {
  RefreshTokenResponse,
  SignUpInfoRequest,
  SignUpInfoResponse,
  SignUpInfoWithFileRequest,
  LogoutResponse,
} from '../type/auth';
import { AUTH_QUERY_KEYS } from '../const/query-keys';
import { authStorage } from '@module/utils/auth';

// 토큰 갱신
export function useRefreshToken(): UseMutationResult<RefreshTokenResponse, Error, string> {
  return useMutation({
    mutationFn: (refreshToken: string) => authApi.refreshToken(refreshToken),
    onSuccess: (data) => {
      authStorage.setAccessToken(data.data.accessToken);
      authStorage.setRefreshToken(data.data.responseToken);
    },
    onError: () => {
      authStorage.clearTokens();
    },
  });
}

// 추가 정보 입력 (텍스트만)
export function useCompleteSignUpInfo(): UseMutationResult<
  SignUpInfoResponse,
  Error,
  { data: SignUpInfoRequest; accessToken: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, accessToken }: { data: SignUpInfoRequest; accessToken: string }) =>
      authApi.completeSignUpInfo(data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.all,
      });
    },
  });
}

// 추가 정보 입력 (프로필 이미지 포함)
export function useCompleteSignUpInfoWithFile(): UseMutationResult<
  SignUpInfoResponse,
  Error,
  { data: SignUpInfoWithFileRequest; accessToken: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, accessToken }: { data: SignUpInfoWithFileRequest; accessToken: string }) =>
      authApi.completeSignUpInfoWithFile(data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.all,
      });
    },
  });
}

// 로그아웃
export function useLogout(): UseMutationResult<LogoutResponse, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accessToken: string) => authApi.logout(accessToken),
    onSuccess: () => {
      authStorage.clearTokens();
      queryClient.clear();
    },
    onError: () => {
      authStorage.clearTokens();
      queryClient.clear();
    },
  });
}
