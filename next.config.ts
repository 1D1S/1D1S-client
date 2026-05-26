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
    remotePatterns: [
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
