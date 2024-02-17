/* eslint-env node */
module.exports = {
  env: {
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'testing-library', 'jest-dom'],
  extends: [
    'eslint:recommended',
  ],
  rules: {
    'no-case-declarations': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['**/*.test.tsx'],
      env: {
       'jest/globals': true,
        jest: true,
      },
      rules: {
        'no-redeclare': 'off', // テストの際にはre-declaring variablesを許可する
      }
    }
  ]
};