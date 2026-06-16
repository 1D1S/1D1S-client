import type { ImageLoaderProps } from 'next/image';

/**
 * next/image 커스텀 로더 — Vercel 기본 최적화기(/_next/image) 우회용.
 *
 * 기본 로더는 모든 이미지를 `/_next/image` 변환 엔드포인트로 보낸다.
 * Vercel Hobby 플랜의 월 변환(Image Transformations) 한도가 소진되면
 * 이 엔드포인트가 402 를 반환해 이미지가 통째로 깨진다(빈 이미지).
 * 커스텀 로더를 지정하면 next/image 가 변환기를 거치지 않고 로더가
 * 반환한 URL 을 그대로 <img src> 로 사용하므로 한도와 무관해진다.
 *
 * 지금은 원본 URL 을 그대로 통과시킨다(pass-through). 백엔드/CDN 이
 * width 기반 리사이징(예: `?w=800`)을 지원하는 것이 확인되면 아래
 * 주석 위치에서 width/quality 를 쿼리로 덧붙여 변환을 위임하면 된다.
 * 그 전까지 임의 파라미터를 붙이면 백엔드가 무시하거나 404 를 낼 수
 * 있으므로 붙이지 않는다.
 */
export default function imageLoader({ src }: ImageLoaderProps): string {
  // data:/blob: 인라인 소스, 앱 내부 정적 자산(/_next, /images),
  // 외부 업로드 이미지 모두 원본 그대로 반환한다.
  //
  // 백엔드 리사이징 확인 시 이 자리에서 확장:
  //   const url = new URL(src);
  //   url.searchParams.set('w', String(width));
  //   url.searchParams.set('q', String(quality ?? 75));
  //   return url.toString();
  return src;
}
