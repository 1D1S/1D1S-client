import { MEMBER_QUERY_KEYS } from '@feature/member/consts/queryKeys';
import { clearCachedSidebar } from '@feature/member/hooks/useMemberQueries';
import { authStorage } from '@module/utils/auth';
import { peekNativeOAuth, postNativeMessage } from '@module/utils/nativeBridge';
import {
  RETURN_TO_PARAM,
  sanitizeReturnTo,
} from '@module/utils/returnTo';
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authApi } from '../api/authApi';
import { LogoutResponse, SocialLoginResponse } from '../type/auth';
import { signInWithApple } from '../utils/appleAuth';

// Sign in with Apple (웹) — 팝업으로 토큰 획득 → 서버 로그인 → 세션 확정.
//
// 콜백 페이지(OAuth 리다이렉트)의 성공 처리와 동일 패턴: markAuthenticated 로
// 세션을 확정하고, 로그인 전 null 로 캐시된 사이드바를 무효화한 뒤,
// profileComplete 여부로 /signup 또는 returnTo(없으면 홈)로 이동한다.
// (구글 콜백의 NotificationOptInPrompt 는 이번 웹 애플 흐름엔 미포함 — 보고 참조)
interface AppleLoginController {
  /** 애플 팝업 로그인 시작. */
  startLogin(): void;
  /** 팝업 오픈~서버 교환까지 — 버튼 중복 클릭 방지용. */
  isPending: boolean;
  /**
   * credential 수신 이후(서버 교환 + 라우팅) 구간에만 true.
   * 이 구간에서만 다른 소셜 로그인과 동일한 "로그인 처리 중..." 화면을 덮는다.
   * 팝업이 떠 있는 동안은 false 라, 사용자가 팝업을 닫아도 잔류 로딩이 없다.
   */
  isExchanging: boolean;
}

export function useAppleLogin(): AppleLoginController {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isExchanging, setIsExchanging] = useState(false);

  const mutation = useMutation<SocialLoginResponse, Error, void>({
    mutationFn: async () => {
      const credential = await signInWithApple();
      // 여기부터가 "제공자 인증 완료 후 서버 교환" 구간 — 리다이렉트형이
      // 콜백 페이지를 보여주는 시점과 같다.
      setIsExchanging(true);
      try {
        // 네이티브 쉘에서 시작된 경우에만 challenge 가 실린다(구글 흐름과 동일).
        return await authApi.appleLogin({
          ...credential,
          nativeCodeChallenge: peekNativeOAuth() ?? undefined,
        });
      } catch (error) {
        // 서버 교환 실패 → 로딩 해제하고 원래 로그인 화면으로 복귀.
        setIsExchanging(false);
        throw error;
      }
    },
    onSuccess: (res) => {
      authStorage.markAuthenticated();
      void queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.sidebar(),
      });
      // 팝업 흐름이라 페이지를 떠나지 않았으므로 returnTo 는 URL 에 그대로 있다.
      const returnTo = sanitizeReturnTo(
        new URLSearchParams(window.location.search).get(RETURN_TO_PARAM)
      );
      if (res.data.profileComplete === false) {
        router.replace(
          returnTo
            ? `/signup?${RETURN_TO_PARAM}=${encodeURIComponent(returnTo)}`
            : '/signup'
        );
        return;
      }
      router.replace(returnTo ?? '/');
    },
    onError: (error) => {
      // 사용자가 팝업을 닫으면(popup_closed_by_user) 여기로 온다 — 조용히 로그.
      // 이 경우 isExchanging 은 애초에 켜지지 않아 로딩이 남지 않는다.
      console.error('[Apple] 로그인 실패:', error);
    },
  });

  return {
    startLogin: mutation.mutate,
    isPending: mutation.isPending,
    isExchanging,
  };
}

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
