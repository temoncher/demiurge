/* eslint-disable @typescript-eslint/naming-convention */

/** @type {import('eslint').Linter.Config} */
// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:prettier/recommended',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'airbnb-typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['import', 'prettier', 'react', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-implicit-any-catch': 0, // we already use tsconfig strict mode
    'react/no-unused-prop-types': 1,
    'react/jsx-sort-props': [
      1,
      {
        callbacksLast: true,
        shorthandFirst: true,
        noSortAlphabetically: true,
        reservedFirst: true,
      },
    ],
    'import/order': [
      1,
      {
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
        pathGroupsExcludedImportTypes: ['constants'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
        warnOnUnassignedImports: true,
        pathGroups: [
          {
            pattern: '@/**',
            group: 'parent',
            position: 'before',
          },
        ],
      },
    ],
    'import/prefer-default-export': 1,
    'import/extensions': 0,
    'no-self-compare': 2,
    'arrow-body-style': 1,
    'no-restricted-imports': [
      1,
      {
        paths: [
          {
            name: 'lodash',
            message:
              'Please use individual imports to reduce bundle size. `import groupBy from "lodash/groupBy"`, for information https://www.blazemeter.com/blog/the-correct-way-to-import-lodash-libraries-a-benchmark',
          },
        ],
      },
    ],
    complexity: [2, 6],
    'no-param-reassign': 2,
    'array-bracket-newline': [1, 'consistent'],
    'function-call-argument-newline': [1, 'consistent'],
    'func-style': [1, 'expression'],
    'id-denylist': [
      2,
      'data',
      'err',
      'e',
      'cb',
      'i',
      'idx',
      'ndx',
      'index',
      'callback',
      'handleChange',
      'handleClick',
      'handleSubmit',
      'handleInput',
    ],
    'prefer-exponentiation-operator': 2,
    'padding-line-between-statements': [
      1,
      {
        blankLine: 'always',
        prev: ['const', 'let', 'var'],
        next: '*',
      },
      {
        blankLine: 'always',
        prev: '*',
        next: ['if', 'try', 'class', 'export'],
      },
      {
        blankLine: 'always',
        prev: ['if', 'try', 'class', 'export'],
        next: '*',
      },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var', 'export'],
        next: ['const', 'let', 'var', 'export'],
      },
      {
        blankLine: 'always',
        prev: ['expression'],
        next: ['const', 'let', 'var'],
      },
      {
        blankLine: 'always',
        prev: '*',
        next: ['return'],
      },
    ],
    'arrow-spacing': 1,
    'no-restricted-exports': [
      1,
      {
        restrictedNamedExports: ['default', 'then'],
      },
    ],
    '@typescript-eslint/array-type': 1,
    '@typescript-eslint/consistent-indexed-object-style': [1, 'record'],
    '@typescript-eslint/consistent-type-assertions': [
      2,
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'never',
      },
    ],
    '@typescript-eslint/member-delimiter-style': [
      1,
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
      },
    ],
    '@typescript-eslint/member-ordering': 2,
    '@typescript-eslint/method-signature-style': [2, 'property'],
    '@typescript-eslint/naming-convention': [
      2,
      {
        selector: 'default',
        format: ['camelCase', 'PascalCase'],
        leadingUnderscore: 'forbid',
        trailingUnderscore: 'forbid',
      },
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE'],
      },
    ],
    '@typescript-eslint/no-base-to-string': 1,
    '@typescript-eslint/no-confusing-non-null-assertion': 1,
    '@typescript-eslint/no-confusing-void-expression': 1,
    '@typescript-eslint/no-dynamic-delete': 1,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-invalid-void-type': 2,
    '@typescript-eslint/no-parameter-properties': [
      2,
      {
        allows: ['private readonly'],
      },
    ],
    '@typescript-eslint/no-unnecessary-condition': 1,
    '@typescript-eslint/no-unnecessary-qualifier': 1,
    '@typescript-eslint/no-unnecessary-type-constraint': 1,
    '@typescript-eslint/prefer-for-of': 1,
    '@typescript-eslint/prefer-reduce-type-parameter': 1,
    '@typescript-eslint/prefer-string-starts-ends-with': 1,
    '@typescript-eslint/promise-function-async': 1,
    '@typescript-eslint/switch-exhaustiveness-check': 2,
    '@typescript-eslint/type-annotation-spacing': 1,
    '@typescript-eslint/default-param-last': 2,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/lines-between-class-members': 0,
    '@typescript-eslint/no-unsafe-argument': 2,
    '@typescript-eslint/no-unsafe-assignment': 2,
    '@typescript-eslint/no-unsafe-member-access': 2,
    '@typescript-eslint/no-unsafe-call': 2,
    '@typescript-eslint/no-unsafe-return': 2,
    '@typescript-eslint/restrict-template-expressions': 2,
    '@typescript-eslint/no-shadow': 2,
    '@typescript-eslint/restrict-plus-operands': 2,
    '@typescript-eslint/no-use-before-define': 2,
    '@typescript-eslint/no-unused-expressions': 2,
    '@typescript-eslint/no-floating-promises': 2,
    '@typescript-eslint/no-unused-vars': 2,
    '@typescript-eslint/no-loop-func': 2,
    '@typescript-eslint/unbound-method': 2,
    '@typescript-eslint/no-this-alias': 2,
    '@typescript-eslint/no-var-requires': 2,
    'no-duplicate-imports': 0,
    '@typescript-eslint/no-duplicate-imports': 2,
    'no-invalid-this': 0,
    '@typescript-eslint/no-invalid-this': 2,
    'no-loss-of-precision': 0,
    '@typescript-eslint/no-loss-of-precision': 2,
    'no-return-await': 0,
    '@typescript-eslint/return-await': 2,
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-case-declarations': 2,
    'no-irregular-whitespace': 2,

    'object-curly-newline': 0, // conflicts with Prettier
    'function-paren-newline': 0, // conflicts with Prettier
    '@typescript-eslint/indent': 0, // conflicts with Prettier
    '@typescript-eslint/comma-dangle': 0, // conflicts with Prettier
    '@typescript-eslint/space-before-function-paren': 0, // conflicts with Prettier

    'react/jsx-props-no-spreading': 0, // conflicts with react-hook-form props
    'react/react-in-jsx-scope': 0,
  },
  overrides: [
    {
      files: ['vite.config.ts', '.eslintrc.js', '.prettierrc.js'],
      parserOptions: {
        project: './tsconfig.node.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  ],
};
