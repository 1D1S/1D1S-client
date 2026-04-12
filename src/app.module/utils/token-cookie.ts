const PRODUCTION_ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
const PRODUCTION_REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const DEVELOPMENT_ACCESS_TOKEN_COOKIE_NAME = 'devAccessToken';
const DEVELOPMENT_REFRESH_TOKEN_COOKIE_NAME = 'devRefreshToken';

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
const defaultRefreshTokenCookieName = isDevelopment
  ? DEVELOPMENT_REFRESH_TOKEN_COOKIE_NAME
  : PRODUCTION_REFRESH_TOKEN_COOKIE_NAME;

export const ACCESS_TOKEN_COOKIE_NAME = resolveEnvCookieName(
  process.env.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE_NAME,
  defaultAccessTokenCookieName
);

export const REFRESH_TOKEN_COOKIE_NAME = resolveEnvCookieName(
  process.env.NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_NAME,
  defaultRefreshTokenCookieName
);

const withFallbacks = (
  primaryName: string,
  fallbackNames: string[]
): string[] => Array.from(new Set([primaryName, ...fallbackNames]));

export const ACCESS_TOKEN_COOKIE_CANDIDATES = withFallbacks(
  ACCESS_TOKEN_COOKIE_NAME,
  [PRODUCTION_ACCESS_TOKEN_COOKIE_NAME, DEVELOPMENT_ACCESS_TOKEN_COOKIE_NAME]
);

export const REFRESH_TOKEN_COOKIE_CANDIDATES = withFallbacks(
  REFRESH_TOKEN_COOKIE_NAME,
  [PRODUCTION_REFRESH_TOKEN_COOKIE_NAME, DEVELOPMENT_REFRESH_TOKEN_COOKIE_NAME]
);
