const PRODUCTION_ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
const DEVELOPMENT_ACCESS_TOKEN_COOKIE_NAME = 'devAccessToken';

const resolveEnvCookieName = (
  envValue: string | undefined,
  fallbackName: string
): string => {
  const trimmedValue = envValue?.trim();
  return trimmedValue ? trimmedValue : fallbackName;
};

const isDevelopment = process.env.NODE_ENV === 'development';

const defaultAccessTokenCookieName = isDevelopment
  ? DEVELOPMENT_ACCESS_TOKEN_COOKIE_NAME
  : PRODUCTION_ACCESS_TOKEN_COOKIE_NAME;

export const ACCESS_TOKEN_COOKIE_NAME = resolveEnvCookieName(
  process.env.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE_NAME,
  defaultAccessTokenCookieName
);

const withFallbacks = (
  primaryName: string,
  fallbackNames: string[]
): string[] => Array.from(new Set([primaryName, ...fallbackNames]));

export const ACCESS_TOKEN_COOKIE_CANDIDATES = withFallbacks(
  ACCESS_TOKEN_COOKIE_NAME,
  [PRODUCTION_ACCESS_TOKEN_COOKIE_NAME, DEVELOPMENT_ACCESS_TOKEN_COOKIE_NAME]
);
