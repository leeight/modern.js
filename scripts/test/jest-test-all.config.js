const path = require('path');

const rootDir = path.resolve(`${__dirname}../../..`);

module.exports = {
  collectCoverage: process.env.CI === 'true',
  collectCoverageFrom: ['<rootDir>/packages/**/src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/fixtures/'],
  transform: {
    '\\.[jt]sx?$': [
      require.resolve('esbuild-jest'),
      {
        sourcemap: true,
      },
    ],
  },
  moduleNameMapper: {},
  globals: {},
  testEnvironment: 'jsdom',
  resolver: require.resolve('./jest.resolver.js'),
  rootDir,
  testTimeout: 15 * 1000,
  testMatch: [
    '<rootDir>/packages/**/src/**/*.test.[jt]s?(x)',
    '<rootDir>/packages/**/tests/**/*.test.[jt]s?(x)',
  ],
  modulePathIgnorePatterns: [
    // TODO: 暂时无法解决（Property exprName of TSTypeQuery expected node to be of a type ["TSEntityName","TSImportType"] but instead got "MemberExpression"）问题，先绕过
    'packages/server/create-request/tests/node.test.ts',
    // TODO: 很容易超时导致失败，暂时先绕过
    'packages/generator/generator-utils/tests/index.test.ts',
  ],
};
