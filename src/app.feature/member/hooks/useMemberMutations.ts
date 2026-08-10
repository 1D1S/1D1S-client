import { clearCachedSidebar } from '@feature/member/hooks/useMemberQueries';
import { beginLogoutSuppression } from '@module/api/errorNotify';
import { toast } from '@module/providers/toast';
import { authStorage } from '@module/utils/auth';
import {
  isNativeBridgeAvailable,
  postNativeMessage,
} from '@module/utils/nativeBridge';
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
    onMutate: () => {
      // useLogout 과 동일한 정리 창 — 탈퇴 처리 중 잔여 in-flight 요청들이
      // 401/취소로 떨어지며 에러 토스트·로그인 리다이렉트를 유발하는 것을 막는다.
      beginLogoutSuppression();
      void queryClient.cancelQueries();
    },
    onSuccess: () => {
      authStorage.clearTokens();
      clearCachedSidebar();
      queryClient.clear();
      // 영속된 RQ 캐시(localStorage)도 비운다 — 탈퇴 후 개인 데이터 잔존 방지.
      purgePersistedQueries();
      // 완료 문구 고정(서버 유예 문구 잔존 방지).
      const successMessage = '회원 탈퇴가 완료되었습니다.';
      if (isNativeBridgeAvailable()) {
        // 앱(웹뷰): 앱이 정리(푸시토큰 회수→네이티브 로그아웃→쿠키 삭제→홈
        // 리로드)를 모두 마친 뒤 이 문구를 네이티브 토스트로 띄운다(빌드 126
        // 계약). 정리 창에서 웹 토스트는 씹히므로 웹에선 띄우지 않는다.
        postNativeMessage({ type: 'logout', successMessage });
      } else {
        // 브라우저: 앱 정리 흐름이 없으므로 웹 토스트를 그대로 띄운다.
        toast.success(successMessage);
      }
    },
  });
}
