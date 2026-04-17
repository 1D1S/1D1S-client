import type { KnipConfig } from 'knip';

/**
 * Knip 설정
 *
 * - 목적: 사용되지 않는 파일/export/의존성 탐지로 dead code 누적 방지
 * - CI 정책: 이슈 발견 시 실패 (knip --reporter=compact)
 * - Baseline: 현 시점 탐지된 항목은 ignore 배열에 등록.
 *             신규로 발생하는 이슈만 CI 차단.
 *             기존 항목은 `docs/ai/TECH_DEBT.md` Minor 티켓으로 관리.
 */
const config: KnipConfig = {
  // Next.js App Router 진입점
  // loading/error/template 파일은 현재 없음 — 생성 시 여기 추가
  entry: [
    'src/app/**/page.{ts,tsx}',
    'src/app/**/layout.{ts,tsx}',
    'src/app/**/not-found.{ts,tsx}',
    'src/app/**/route.{ts,tsx}',
    'src/app.module/middleware/middleware.ts',
    'next.config.{js,ts,mjs}',
    'postcss.config.{js,cjs,mjs}',
  ],
  project: ['src/**/*.{ts,tsx}'],

  // 런타임/빌드 체인에서 간접적으로 사용되지만 knip이 직접 참조를 찾을 수 없는 패키지
  ignoreDependencies: [
    // @1d1s/design-system 의 peer 로 사용되는 Radix UI primitives
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
    // Tiptap extension (에디터에서 동적 로드)
    '@tiptap/extension-image',
    // PostCSS / Tailwind 빌드 체인
    'autoprefixer',
    'postcss',
    // 디자인 시스템 내부에서 사용되는 보조 라이브러리
    'class-variance-authority',
    'cmdk',
    'react-day-picker',
    'react-intersection-observer',
    'react-resizable-panels',
    'vaul',
    // 훅/커밋/테스트 체인 (husky, jest 등)
    '@commitlint/cli',
    '@eslint/eslintrc',
    '@next/eslint-plugin-next',
    '@testing-library/react',
    '@testing-library/user-event',
    'eslint-plugin-react',
    'eslint-plugin-react-hooks',
    'jsdom',
    'lint-staged',
    'ts-node',
    // CSS 에서 `@import` 로 사용
    'tw-animate-css',
  ],

  // 현 시점 baseline (TECH_DEBT — Minor). 새로 추가된 것만 차단된다.
  // 정리 시 이 리스트에서 하나씩 제거.
  ignore: [
    'src/app.lib/prefetch.tsx',
    'src/app.component/ui/scroll-area.tsx',
    'src/app.constants/consts/mypage-data.ts',
    'src/app.feature/challenge/board/consts/challenge-board-data.ts',
    'src/app.feature/challenge/detail/components/challenge-goal-toggle.tsx',
    'src/app.feature/challenge/write/components/challenge-goal-buttons.tsx',
    'src/app.feature/challenge/write/components/challenge-toggle.tsx',
    'src/app.feature/challenge/write/components/step-progress.tsx',
    'src/app.feature/diary/detail/consts/diary-detail-data.ts',
    'src/app.feature/diary/shared/components/diary-list-item.tsx',
    'src/app.feature/diary/write/components/bottom-expandable-panel.tsx',
    'src/app.feature/diary/write/components/diary-content-field.tsx',
    'src/app.feature/diary/write/components/mood-toggle.tsx',
  ],

  // Next.js middleware 의 `export const config` 는 프레임워크 규약
  ignoreExportsUsedInFile: true,

  /**
   * 이슈 severity 정책 — 모두 CI 차단.
   * 신규 dead code / 미사용 export / 미사용 타입 유입을 방지한다.
   * 공개 API 로 유지하려는 export 가 있다면 파일 상단에 `// @public` 주석을 달고
   * `ignoreExportsUsedInFile` 또는 개별 파일 레벨 ignore 로 처리한다.
   */
  rules: {
    files: 'error',
    dependencies: 'error',
    devDependencies: 'error',
    unlisted: 'error',
    binaries: 'error',
    unresolved: 'error',
    exports: 'error',
    types: 'error',
    nsExports: 'error',
    nsTypes: 'error',
    enumMembers: 'error',
    duplicates: 'error',
  },
};

export default config;
