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
