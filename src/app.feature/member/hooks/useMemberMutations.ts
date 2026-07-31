import { clearCachedSidebar } from '@feature/member/hooks/useMemberQueries';
import { authStorage } from '@module/utils/auth';
import { postNativeMessage } from '@module/utils/nativeBridge';
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { memberApi } from '../api/memberApi';
import { MEMBER_QUERY_KEYS } from '../consts/queryKeys';

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

export function useUpdatePhoneNumber(): UseMutationResult<
  void,
  Error,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phoneNumber: string) =>
      memberApi.updatePhoneNumber(phoneNumber),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.myPage(),
      });
    },
  });
}

export function useCheckNickname(): UseMutationResult<
  { message?: string },
  Error,
  string
> {
  return useMutation({
    mutationFn: (nickname: string) => memberApi.checkNickname(nickname),
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
      // 앱(웹뷰)은 네이티브 세션을 따로 들고 있어, 토큰만 지우면 쉘이 곧
      // 웹 세션을 복구해 버린다(로그아웃 버그와 동일). 로그아웃과 같은
      // 신호를 보내 쉘 세션까지 정리한다 — 탈퇴 후 완전히 로그아웃된다.
      postNativeMessage({ type: 'logout' });
    },
  });
}
