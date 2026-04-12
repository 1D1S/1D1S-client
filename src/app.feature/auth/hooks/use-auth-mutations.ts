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
  SignUpInfoRequest,
  SignUpInfoResponse,
} from '../type/auth';

// 추가 정보 입력 (텍스트만)
export function useCompleteSignUpInfo(): UseMutationResult<
  SignUpInfoResponse,
  Error,
  SignUpInfoRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignUpInfoRequest) => authApi.completeSignUpInfo(data),
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
