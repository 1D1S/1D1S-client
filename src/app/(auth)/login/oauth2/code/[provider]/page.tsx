'use client';

import { LoginProcessingScreen } from '@feature/auth/components/LoginProcessingScreen';
import { useSocialLogin } from '@feature/auth/hooks/useAuthQueries';
import { OAuthProvider } from '@feature/auth/type/auth';
import { MEMBER_QUERY_KEYS } from '@feature/member/consts/queryKeys';
import { NotificationOptInPrompt } from '@feature/notification/components/NotificationOptInPrompt';
import { authStorage } from '@module/utils/auth';
import { consumeNativeOAuth } from '@module/utils/nativeBridge';
import { RETURN_TO_PARAM, returnToStorage } from '@module/utils/returnTo';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef } from 'react';

function OAuthCallbackContent(): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ provider: string }>();
  const searchParams = useSearchParams();
  const processed = useRef(false);

  const provider = params.provider as OAuthProvider;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const { data, error, isSuccess } = useSocialLogin(provider, code, state);

  // profileComplete === true 일 때만 prompt 활성화. signup 분기는 effect 에서
  // router.replace 로 처리하므로 derived 값으로 충분하다.
  const optInActive =
    isSuccess && !error && data?.data?.profileComplete === true;

  // 로그인 성공 시 sessionStorage 에서 1회 소비한 returnTo. prompt 완료
  // 시점(finishLogin)까지 유지해야 하므로 ref 에 담아 둔다.
  const returnToRef = useRef<string | null>(null);

  const finishLogin = useCallback((): void => {
    router.replace(returnToRef.current ?? '/');
  }, [router]);

  useEffect(() => {
    if (processed.current) {
      return;
    }

    if (error) {
      processed.current = true;
      console.error(`[OAuth] ${provider} 로그인 실패:`, error);
      router.replace('/login');
      return;
    }

    if (isSuccess) {
      processed.current = true;
      const nativeCodeChallenge = consumeNativeOAuth();
      if (nativeCodeChallenge) {
        const nativeLoginCode = data?.data?.nativeLoginCode;
        if (!nativeLoginCode) {
          processed.current = false;
          console.error('[OAuth] 앱 로그인 코드가 응답에 없습니다.');
          router.replace('/login');
          return;
        }
        const callback = new URL('onedayonestreak://auth/callback');
        callback.searchParams.set('code', nativeLoginCode);
        window.location.replace(callback.toString());
        return;
      }
      authStorage.markAuthenticated();
      returnToRef.current = returnToStorage.consume();
      // 로그인 전 null로 캐시된 사이드바 무효화 → 홈에서 즉시 리페치
      void queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.sidebar(),
      });

      if (data?.data?.profileComplete === false) {
        // 프로필 설정을 먼저 거치되, 완료 후 원래 경로로 복귀할 수 있게
        // returnTo 를 쿼리로 넘긴다.
        const returnTo = returnToRef.current;
        router.replace(
          returnTo
            ? `/signup?${RETURN_TO_PARAM}=${encodeURIComponent(returnTo)}`
            : '/signup'
        );
      }
      // profileComplete === true → optInActive(derived)=true.
      // prompt 가 사용자 액션 후 finishLogin 으로 redirect 한다.
    }
  }, [data, error, isSuccess, provider, router, queryClient]);

  return (
    <>
      <LoginProcessingScreen />
      <NotificationOptInPrompt active={optInActive} onComplete={finishLogin} />
    </>
  );
}

export default function OAuthCallbackPage(): React.ReactElement {
  return (
    <Suspense fallback={<LoginProcessingScreen />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
