import { clearCachedSidebar } from '@feature/member/hooks/use-member-queries';
import { authStorage } from '@module/utils/auth';
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { authApi } from '../api/auth-api';
import { AUTH_QUERY_KEYS } from '../consts/query-keys';
import {
  LogoutResponse,
  RefreshTokenResponse,
  SignUpInfoRequest,
  SignUpInfoResponse,
} from '../type/auth';

// 토큰 갱신
export function useRefreshToken(): UseMutationResult<
  RefreshTokenResponse,
  Error,
  string
> {
  return useMutation({
    mutationFn: (refreshToken: string) => authApi.refreshToken(refreshToken),
    onSuccess: (data) => {
      authStorage.setAccessToken(data.data.accessToken);
      authStorage.setRefreshToken(data.data.refreshToken);
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
    mutationFn: ({
      data,
      accessToken,
    }: {
      data: SignUpInfoRequest;
      accessToken: string;
    }) => authApi.completeSignUpInfo(data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.all,
      });
    },
  });
}

// 로그아웃
export function useLogout(): UseMutationResult<LogoutResponse, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      authStorage.clearTokens();
      clearCachedSidebar();
      queryClient.clear();
    },
    onError: () => {
      authStorage.clearTokens();
      clearCachedSidebar();
      queryClient.clear();
    },
  });
}
