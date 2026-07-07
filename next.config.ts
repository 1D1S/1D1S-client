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
    ],
  },
  images: {
    // Vercel 기본 최적화기(/_next/image) 우회 — 한도(Image
    // Transformations) 소진 시 402 로 이미지가 통째로 깨지던 문제 회피.
    // 이전의 pass-through 커스텀 로더는 width 를 무시해 (1) "loader
    // does not implement width" 경고, (2) 동일 URL 반복 + 공백 포함
    // 파일명으로 인한 srcset 파싱 실패를 유발했다. 변환을 안 쓸 거면
    // unoptimized 가 정확한 설정: srcset 없이 원본 <img src> 만 낸다.
    // 백엔드/CDN 리사이징 도입 시 이 값을 지우고 커스텀 로더로 복귀.
    unoptimized: true,
  },
};

module.exports = nextConfig;
