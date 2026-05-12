import { cn } from '@module/utils/cn';

import type { OAuthProvider } from '../type/auth';

interface ProviderMeta {
  img: string;
  text: string;
  className: string;
}

export const PROVIDER_ORDER: OAuthProvider[] = ['kakao', 'naver', 'google'];

export const PROVIDER_META: Record<OAuthProvider, ProviderMeta> = {
  kakao: {
    img: '/images/kakao-logo.png',
    text: '카카오로 시작하기',
    className: cn(
      'border-0 bg-[#FEE500] font-extrabold text-[#191600]',
      'shadow-[0_6px_18px_rgba(254,229,0,0.35)]',
      'hover:bg-[#FEE500]/90 hover:brightness-100'
    ),
  },
  naver: {
    img: '/images/naver-logo.png',
    text: '네이버로 시작하기',
    className: cn(
      'border-0 bg-[#03C75A] font-extrabold text-white',
      'shadow-[0_6px_18px_rgba(3,199,90,0.25)]',
      'hover:bg-[#03C75A]/90 hover:brightness-100'
    ),
  },
  google: {
    img: '/images/google-logo.svg',
    text: 'Google로 계속하기',
    className: cn(
      'border border-gray-200 bg-white font-extrabold text-gray-800',
      'shadow-sm hover:bg-gray-50 hover:brightness-100'
    ),
  },
};

export function getOrderedProviders(
  recommended: OAuthProvider | null
): OAuthProvider[] {
  if (!recommended) {
    return PROVIDER_ORDER;
  }
  return [
    recommended,
    ...PROVIDER_ORDER.filter((provider) => provider !== recommended),
  ];
}
