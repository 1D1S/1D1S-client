/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  compiler: {
    removeConsole: isDev ? false : { exclude: ['error', 'warn'] },
  },
  experimental: {
    // Next.js 15+ 기본값은 dynamic: 0 이라 라우트 캐시(=RSC payload 클라이언트
    // 캐시) 가 즉시 stale 로 만료된다. router.prefetch 가 채워 둔 payload 도
    // 곧바로 휘발되어, 네이티브 탭 전환마다 RSC 가 다시 fetch 되고 페이지
    // 컴포넌트가 매번 새로 마운트되어 사용자 체감상 "매번 로딩". 두 값
    // 모두 명시적으로 늘려, 짧은 시간 안의 탭 왕복은 캐시 hit 으로 즉시
    // 전환되도록 한다. TanStack Query staleTime 과 별개 레이어.
    staleTimes: {
      dynamic: 120,
      static: 600,
    },
    webpackMemoryOptimizations: true,
    // 큰 라이브러리의 트리쉐이킹을 활성화해 초기 번들 크기를 줄인다.
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@1d1s/design-system',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-menubar',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-switch',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      'class-variance-authority',
      'tailwind-merge',
      'cmdk',
      'sonner',
    ],
  },
  images: {
    dangerouslyAllowSVG: isDev,
    // 변환 결과를 길게 캐시해 같은 이미지의 재변환(=재과금)을 줄인다.
    // 업로드 이미지는 보통 URL 이 새로 생기므로 stale 위험이 낮다.
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
    // AVIF 까지 켜면 브라우저별로 변환이 2배가 되므로 webp 단일 유지.
    formats: ['image/webp'],
    // 전부 기본 품질(75)만 쓰므로 1종으로 고정해 변형 다중화를 막는다.
    qualities: [75],
    // 실제 사용하는 sizes 기준으로 너비 변형 가짓수를 줄인다.
    // 기본값(최대 3840)은 거의 안 쓰는 초대형 변환을 만들어 낭비가 크다.
    deviceSizes: [640, 828, 1080, 1920, 2048],
    imageSizes: [32, 64, 128, 256, 384],
    remotePatterns: [
      // ⚠️ hostname '**' 는 누구나 이 최적화기로 외부 이미지를 변환하게
      // 허용해 쿼터가 도난될 수 있다. 실제 이미지 호스트(백엔드 +
      // OAuth 프로필 CDN)로 좁히는 것을 권장(아래 설명 참고).
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
