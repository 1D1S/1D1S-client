'use client';

import { useSocialLogin } from '@feature/auth/hooks/use-auth-queries';
import { OAuthProvider } from '@feature/auth/type/auth';
import { authStorage } from '@module/utils/auth';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

function OAuthCallbackContent(): React.ReactElement {
  const router = useRouter();
  const params = useParams<{ provider: string }>();
  const searchParams = useSearchParams();
  const processed = useRef(false);

  const provider = params.provider as OAuthProvider;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const { data, error } = useSocialLogin(provider, code, state);

  useEffect(() => {
    if (processed.current) {
      return;
    }

    if (error) {
      processed.current = true;
      router.replace('/login');
      return;
    }

    if (data) {
      processed.current = true;
      authStorage.setAccessToken(data.data.accessToken);
      authStorage.setRefreshToken(data.data.refreshToken);

      if (!data.data.profileComplete) {
        router.replace('/signup');
      } else {
        router.replace('/');
      }
    }
  }, [data, error, router]);

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
