import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import tailwindcssPlugin from 'eslint-plugin-tailwindcss';
import tseslint from 'typescript-eslint';

const eslintConfig = [
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
];

export default eslintConfig;
