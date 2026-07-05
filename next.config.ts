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
    // Vercel 기본 최적화기(/_next/image)를 우회하는 커스텀 로더.
    // 한도(Image Transformations) 소진 시 이 엔드포인트가 402 를 반환해
    // 업로드 이미지가 통째로 빈 이미지로 내려오던 문제를 회피한다.
    // 로더는 변환기를 거치지 않고 원본 URL 을 그대로 쓰므로 한도와
    // 무관하다. 동작/확장은 src/app.lib/imageLoader.ts 참고.
    loader: 'custom',
    loaderFile: './src/app.lib/imageLoader.ts',
    // srcset 의 width 후보. 지금은 로더가 width 를 무시하지만, 백엔드
    // 리사이징 도입 시 그대로 변환 폭으로 재사용된다.
    deviceSizes: [640, 828, 1080, 1920, 2048],
    imageSizes: [32, 64, 128, 256, 384],
  },
};

module.exports = nextConfig;
