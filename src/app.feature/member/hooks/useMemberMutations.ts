import { clearCachedSidebar } from '@feature/member/hooks/useMemberQueries';
import { toast } from '@module/providers/toast';
import { authStorage } from '@module/utils/auth';
import { postNativeMessage } from '@module/utils/nativeBridge';
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { purgePersistedQueries } from '@/app.lib/queryPersist';

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
      // 성공 토스트를 로그아웃 신호보다 "먼저" 보낸다. toast·logout 둘 다
      // 네이티브 위임 메시지인데(같은 JS 채널), logout 이 먼저 가면 앱이
      // 웹뷰·세션을 정리하는 사이 뒤이은 toast 메시지가 씹혔다(반복 신고).
      // 서버 message 는 옛 유예 문구가 남을 수 있어 완료 문구로 고정한다.
      // 순서 보장을 위해 컴포넌트가 아니라 여기(hook onSuccess, 항상 먼저 실행)
      // 에서 토스트를 띄운다.
      toast.success('회원 탈퇴가 완료되었습니다.');
      authStorage.clearTokens();
      clearCachedSidebar();
      queryClient.clear();
      // 영속된 RQ 캐시(localStorage)도 비운다 — 탈퇴 후 개인 데이터 잔존 방지.
      purgePersistedQueries();
      // 앱(웹뷰)은 네이티브 세션을 따로 들고 있어, 토큰만 지우면 쉘이 곧
      // 웹 세션을 복구해 버린다(로그아웃 버그와 동일). 로그아웃과 같은
      // 신호를 보내 쉘 세션까지 정리한다 — 탈퇴 후 완전히 로그아웃된다.
      postNativeMessage({ type: 'logout' });
    },
  });
}
