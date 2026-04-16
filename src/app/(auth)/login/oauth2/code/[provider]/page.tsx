'use client';

import { useSocialLogin } from '@feature/auth/hooks/use-auth-queries';
import { OAuthProvider } from '@feature/auth/type/auth';
import { MEMBER_QUERY_KEYS } from '@feature/member/consts/query-keys';
import { authStorage } from '@module/utils/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

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
      } else {
        router.replace('/');
      }
    }
  }, [data, error, isSuccess, provider, router, queryClient]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">로그인 처리 중...</p>
    </div>
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
