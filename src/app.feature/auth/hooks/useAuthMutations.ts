import { clearCachedSidebar } from '@feature/member/hooks/useMemberQueries';
import { authStorage } from '@module/utils/auth';
import { postNativeMessage } from '@module/utils/nativeBridge';
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

  const clearLocalSession = (): void => {
    authStorage.clearTokens();
    clearCachedSidebar();
    queryClient.clear();
  };

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: clearLocalSession,
    onError: clearLocalSession,
    // 네이티브 쉘에는 로컬 정리가 끝난 뒤에 알린다. 쉘은 이 신호를 받으면
    // 살아 있는 탭들을 리로드하는데, localStorage 의 로그인 힌트와 사이드바
    // 캐시는 origin 단위로 공유되므로 아직 남아 있으면 새로 뜬 문서가 그걸
    // 읽고 로그인 상태로 되돌아간다 (프로필 사진이 그대로 보이고, 로그아웃을
    // 두 번 눌러야 했다). onSettled 는 onSuccess/onError 뒤에 돈다.
    onSettled: () => postNativeMessage({ type: 'logout' }),
  });
}
