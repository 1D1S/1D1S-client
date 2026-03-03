import { OAuthProvider } from '../type/auth';

export const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,
  socialLogin: (
    provider: OAuthProvider,
    code: string | null,
    state: string | null
  ) => [...AUTH_QUERY_KEYS.all, 'socialLogin', provider, code, state] as const,
};
