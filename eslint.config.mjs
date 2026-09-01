import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import tailwindcssPlugin from 'eslint-plugin-tailwindcss';
import tseslint from 'typescript-eslint';

const eslintConfig = [
  {
    ignores: ['dev-server.js'],
  },
  ...nextConfig,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      tailwindcss: tailwindcssPlugin,
    },
    settings: {
      tailwindcss: {
        callees: ['cn', 'clsx', 'cva'],
        config: {},
      },
    },
    rules: {
      'max-len': [
        'error',
        {
          code: 80,
          tabWidth: 2,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignorePattern: '^\\s*import\\s.+$',
        },
      ],
      'import/first': 'error',
      'import/newline-after-import': ['error', { count: 1 }],
      'import/no-duplicates': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-contradicting-classname': 'error',
      'tailwindcss/enforces-shorthand': 'warn',
      'tailwindcss/no-custom-classname': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
      'one-var': ['error', 'never'],
      'no-use-before-define': 'error',
      'no-array-constructor': 'error',
      'prefer-destructuring': [
        'warn',
        {
          array: true,
          object: false,
        },
      ],
      'no-object-constructor': 'error',
      'guard-for-in': 'error',
      'lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: true },
      ],
      '@typescript-eslint/method-signature-style': ['error', 'method'],
      'new-parens': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'no-public' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'PropertyDefinition[key.type="PrivateIdentifier"]',
          message:
            'Avoid using #private fields. Use TypeScript visibility modifiers instead.',
        },
      ],
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
      'arrow-body-style': ['error', 'as-needed'],
      'no-invalid-this': 'error',
      'no-extra-bind': 'error',
      'prefer-rest-params': 'error',
      'rest-spread-spacing': ['error', 'never'],
      'padded-blocks': ['error', { blocks: 'never' }],
      quotes: ['error', 'single', { avoidEscape: true }],
      'no-multi-str': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': ['error', 'never'],
      'unicode-bom': 'off',
      'no-octal-escape': 'error',
      'no-loss-of-precision': 'error',
      'no-implicit-coercion': [
        'error',
        {
          boolean: true,
          number: true,
          string: false,
          allow: [],
        },
      ],
      'no-restricted-globals': ['error', 'parseInt', 'parseFloat'],
      'no-extra-boolean-cast': 'error',
      curly: ['error', 'all'],
      'no-extra-parens': ['error', 'functions'],
      'default-case': 'error',
      'default-case-last': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-throw-literal': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
      'no-new-wrappers': 'error',
      'no-debugger': 'error',
      'no-with': 'error',
      'no-eval': 'error',
      'no-new-func': 'error',
      semi: ['error', 'always'],
      'no-extend-native': 'error',
      'no-global-assign': 'error',
      'id-length': [
        'warn',
        { min: 2, exceptions: ['i', 'j', 'k', 'x', 'y', '_'] },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array-simple',
          readonly: 'array-simple',
        },
      ],
      '@typescript-eslint/no-explicit-any': [
        'warn',
        {
          fixToUnknown: true,
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-ignore': 'allow-with-description',
          minimumDescriptionLength: 5,
        },
      ],
      'react/jsx-no-useless-fragment': 'warn',
    },
  },
  // 레이어 경계 — 공용(app.component)·코어(app.module)는 기능(app.feature)에
  // 의존하지 않는다. 반대로 의존하면 기능 하나를 고칠 때 전역 셸이 흔들린다.
  //
  // 지금 위반이 9개 파일에 남아 있어 아래 예외 목록으로 막아 두었다.
  // **새 위반만 차단**하는 것이 목적이고, 예외는 계획서 P4(레이어 경계 정리)
  // 에서 하나씩 지운다. 새 파일을 예외에 추가하지 말 것.
  {
    files: ['src/app.component/**/*.{ts,tsx}', 'src/app.module/**/*.{ts,tsx}'],
    rules: {
      // 기본 규칙 대신 TS 판을 쓴다 — allowTypeImports 가 필요하다.
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@feature/*', '@/app.feature/*', '**/app.feature/*'],
              // `import type` 은 빌드 시 사라져 런타임 결합이 없다. 도메인
              // 타입을 공용 레이어로 끌어올리면 오히려 타입의 주인이
              // 흐려지므로, 값 import 만 막는다.
              allowTypeImports: true,
              message:
                'app.component/app.module 은 app.feature 에 의존할 수 없습니다(값 import). 공용으로 올리거나 호출부에서 주입하세요.',
            },
          ],
        },
      ],
    },
  },
  {
    // 전역 셸의 알려진 결합 — 보류 중(추가 금지).
    //
    // 아래 4개는 전역 셸이 feature 의 훅·컴포넌트를 직접 부른다:
    //   AppBottomNav       → useSidebar
    //   AppLayoutShell     → usePhoneNumberMissing, 설치/투표 위젯, 알림 딥링크
    //   AppTopNav          → ChatEntryButton, NotificationBellButton
    //   useAuthLayoutState → useSidebar, useUnreadCount
    //
    // 파일 이동으로는 풀리지 않는다. member 훅을 코어 레이어로 "승격"하는
    // 것도 해결이 아니다 — member API·타입이 통째로 따라와 결합만 옮긴다.
    // 제대로 된 해법은 의존성 역전이다: 루트 레이아웃(합성 루트)이 feature
    // 위젯을 만들어 셸에 슬롯으로 주입하고, 셸은 자리만 갖는 구조.
    //
    // 지금 하지 않는 이유: 전역 셸 조립 방식을 바꾸는 변경이라 전 페이지와
    // 네이티브 셸에 영향이 가는데, 실기기 확인 수단이 없다. 확인이 가능해질
    // 때 한 번에 처리한다. 그때까지 새 위반은 위 규칙이 계속 막는다.
    files: [
      'src/app.component/layout/AppBottomNav.tsx',
      'src/app.component/layout/AppLayoutShell.tsx',
      'src/app.component/layout/AppTopNav.tsx',
      'src/app.component/layout/useAuthLayoutState.ts',
    ],
    rules: {
      '@typescript-eslint/no-restricted-imports': 'off',
    },
  },
];

export default eslintConfig;
