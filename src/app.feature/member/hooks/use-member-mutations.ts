import { clearCachedSidebar } from '@feature/member/hooks/use-member-queries';
import { authStorage } from '@module/utils/auth';
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { memberApi } from '../api/member-api';
import { MEMBER_QUERY_KEYS } from '../consts/query-keys';

export function useUpdateNickname(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nickname: string) => memberApi.updateNickname(nickname),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.myPage(),
      });
      void queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.sidebar(),
      });
    },
  });
}

export function useUpdateProfileImage(): UseMutationResult<void, Error, File> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => memberApi.updateProfileImage(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.myPage(),
      });
      void queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.sidebar(),
      });
    },
  });
}

export function useDeleteMember(): UseMutationResult<
  { message?: string },
  Error,
  void
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => memberApi.deleteMember(),
    onSuccess: () => {
      authStorage.clearTokens();
      clearCachedSidebar();
      queryClient.clear();
    },
  });
}
