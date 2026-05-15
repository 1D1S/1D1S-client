'use client';

import { useSocialLogin } from '@feature/auth/hooks/useAuthQueries';
import { OAuthProvider } from '@feature/auth/type/auth';
import { MEMBER_QUERY_KEYS } from '@feature/member/consts/queryKeys';
import {
  NotificationOptInPrompt,
} from '@feature/notification/components/NotificationOptInPrompt';
import { authStorage } from '@module/utils/auth';
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

  const finishToHome = useCallback((): void => {
    router.replace('/');
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
      authStorage.markAuthenticated();
      // 로그인 전 null로 캐시된 사이드바 무효화 → 홈에서 즉시 리페치
      void queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.sidebar(),
      });

      if (data?.data?.profileComplete === false) {
        router.replace('/signup');
      }
      // profileComplete === true → optInActive(derived)=true.
      // prompt 가 사용자 액션 후 finishToHome 으로 redirect 한다.
    }
  }, [data, error, isSuccess, provider, router, queryClient]);

  return (
    <>
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">로그인 처리 중...</p>
      </div>
      <NotificationOptInPrompt
        active={optInActive}
        onComplete={finishToHome}
      />
    </>
  );
}

export default function OAuthCallbackPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">로그인 처리 중...</p>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
