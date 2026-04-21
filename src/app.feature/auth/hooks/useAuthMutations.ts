import { clearCachedSidebar } from '@feature/member/hooks/useMemberQueries';
import { authStorage } from '@module/utils/auth';
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { authApi } from '../api/authApi';
import { LogoutResponse } from '../type/auth';

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
