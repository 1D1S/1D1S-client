import { OAuthProvider } from '../type/auth';

export const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,
  socialLogin: (provider: OAuthProvider) =>
    [...AUTH_QUERY_KEYS.all, 'socialLogin', provider] as const,
};
