'use client';

import { Button } from '@1d1s/design-system';
import { API_BASE_URL } from '@module/api/config';
import { cn } from '@module/utils/cn';
import Image from 'next/image';

import { OAuthProvider } from '../type/auth';

const LAST_PROVIDER_KEY = '1d1s:last-oauth-provider';

export function getLastOAuthProvider(): OAuthProvider | null {
  if (typeof window === 'undefined') {return null;}
  const value = window.localStorage.getItem(LAST_PROVIDER_KEY);
  if (value === 'kakao' || value === 'naver' || value === 'google') {
    return value;
  }
  return null;
}

const handleSocialLogin = (provider: OAuthProvider): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LAST_PROVIDER_KEY, provider);
  }
  window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
};

interface LoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  img: string;
  text: string;
  provider: OAuthProvider;
  size?: 'medium' | 'large';
  recentBadge?: boolean;
}

export function LoginButton({
  img,
  text,
  provider,
  className,
  size = 'medium',
  recentBadge = false,
}: LoginButtonProps): React.ReactElement {
  return (
    <div className="relative w-full">
      <Button
        size={size}
        fullWidth
        onClick={() => handleSocialLogin(provider)}
        className={cn('relative', className)}
      >
        <span className="absolute left-5 inline-flex">
          <Image src={img} alt={text} width={20} height={20} />
        </span>
        {text}
      </Button>
      {recentBadge && (
        <span
          className={cn(
            'pointer-events-none absolute -top-2.5 right-3.5 z-10',
            'rounded-full bg-gray-900 px-2 py-[3px] text-[10px]',
            'font-extrabold tracking-wide text-white shadow-sm'
          )}
        >
          최근 사용 ✨
        </span>
      )}
    </div>
  );
}
