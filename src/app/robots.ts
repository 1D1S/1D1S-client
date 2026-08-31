import { SITE_URL } from '@module/metadata/seo';
import type { MetadataRoute } from 'next';

// 일지는 전부 비공개다. 목록·상세 모두 크롤링 대상에서 제외한다.
// 나머지는 인증 게이트라 크롤링해도 로그인으로 튕긴다.
const DISALLOW = [
  '/api/',
  '/diary',
  '/login',
  '/signup',
  '/mypage',
  '/member',
  '/notification',
  '/onboarding',
  '/shell',
  '/challenge/create',
];

// /api/og 는 기본 OG 이미지다. disallow: '/api/' 아래 있으면 크롤러가
// 링크 프리뷰 이미지를 못 가져오므로 더 구체적인 Allow 로 뚫어 둔다.
const ALLOW = ['/', '/api/og'];

/**
 * AI 답변엔진 크롤러. `User-agent: *` 로도 이미 허용되지만, 이름을 적어 두는
 * 편이 정책을 분명히 한다(나중에 특정 봇만 막을 때도 여기만 고치면 된다).
 *
 * 주의: 크롤러는 자기 이름이 적힌 그룹 **하나만** 따르고 `*` 그룹은 무시한다.
 * 그래서 각 그룹에 같은 disallow 목록을 그대로 붙인다 — 안 그러면 이 봇들만
 * /mypage 같은 인증 경로까지 긁는다.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'meta-externalagent',
  'Bytespider',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: ALLOW, disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: ALLOW,
        disallow: DISALLOW,
      })),
    ],
    sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
  };
}
