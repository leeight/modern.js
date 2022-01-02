const path = require('path');

const kRootDir = __dirname;

function resolve(filepath) {
  return path.join(kRootDir, filepath);
}

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/packages/**/src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/fixtures/'],
  transform: {
    // '\\.[jt]sx?$': resolve(
    //   '/packages/review/testing/src/config/transformer/babelTransformer.ts',
    // ),
    '\\.[jt]sx?$': 'esbuild-jest',
  },
  moduleNameMapper: {
    // '\\.(css|less|scss|sass)$':
    //   '/Users/leeight/Workspaces/github.com/modern-js-dev/modern.js/node_modules/.pnpm/identity-obj-proxy@3.0.0/node_modules/identity-obj-proxy/src/index.js',
    // '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
    //   resolve('/packages/review/testing/src/config/patches/filemock.ts'),
  },
  globals: {},
  testEnvironment: 'jsdom',
  resolver: resolve('/packages/cli/plugin-testing/src/cli/resolver.ts'),
  rootDir: kRootDir,
  testMatch: [
    '<rootDir>/packages/**/src/**/*.test.[jt]s?(x)',
    '<rootDir>/packages/**/tests/**/*.test.[jt]s?(x)',
  ],
  // modulePathIgnorePatterns: ['plugin-nest'],
};
