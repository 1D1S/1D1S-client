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
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@feature/*', '@/app.feature/*', '**/app.feature/*'],
              message:
                'app.component/app.module 은 app.feature 에 의존할 수 없습니다. 공용으로 올리거나 호출부에서 주입하세요.',
            },
          ],
        },
      ],
    },
  },
  {
    // P4 에서 제거할 기존 위반(추가 금지).
    files: [
      'src/app.component/cards/DiaryCard.tsx',
      'src/app.component/layout/AppBottomNav.tsx',
      'src/app.component/layout/AppLayoutShell.tsx',
      'src/app.component/layout/AppTopNav.tsx',
      'src/app.component/layout/useAuthLayoutState.ts',
      'src/app.component/skeletons/ChallengeBoardSkeleton.tsx',
      'src/app.component/skeletons/ChallengeDetailSkeleton.tsx',
      'src/app.module/api/serverApi.ts',
      'src/app.module/hooks/useMarkReadFromDeepLink.ts',
      'src/app.module/providers/PostHogProvider.tsx',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
];

export default eslintConfig;
