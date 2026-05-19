/**
 * URL 끝의 슬래시(들)를 제거한다. 빈 문자열을 받으면 그대로 빈 문자열을 반환한다.
 */
export function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}
