import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

function resolvePath(relativePath: string): string {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // api/config 는 브라우저 환경에서 이 값이 없으면 import 시점에 던진다.
    // jsdom 테스트는 브라우저로 판정되므로 더미 오리진을 넣어 둔다 —
    // 네트워크는 테스트에서 각자 mock 한다.
    env: {
      NEXT_PUBLIC_ODOS_API_URL: 'https://api.test.1day1streak.com',
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // @1d1s/design-system 는 `next/image` 를 bare specifier 로 import 한다.
    // Node ESM 외부화 상태로는 subpath 해석이 실패하므로 vite 로 인라인
    // 변환해 별칭/exports 해석을 태운다.
    server: {
      deps: {
        inline: [/@1d1s\/design-system/],
      },
    },
  },
  resolve: {
    alias: [
      {
        find: /^@component\//,
        replacement: resolvePath('./src/app.component/'),
      },
      {
        find: /^@feature\//,
        replacement: resolvePath('./src/app.feature/'),
      },
      {
        find: /^@module\//,
        replacement: resolvePath('./src/app.module/'),
      },
      {
        find: /^@constants\//,
        replacement: resolvePath('./src/app.constants/'),
      },
      { find: /^@\//, replacement: resolvePath('./src/') },
    ],
  },
});
