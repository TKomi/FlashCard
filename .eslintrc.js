/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    'jest/globals': true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'testing-library', 'jest-dom'],
  extends: [
    'eslint:recommended',
  ],
  rules: {
    'no-case-declarations': 'off',
    'no-unused-vars': 'warn',
  },
  overrides: [
    {
      files: ['**/*.test.tsx'],
      rules: {
        'no-redeclare': 'off', // テストの際にはre-declaring variablesを許可する
      }
    }
  ]
};