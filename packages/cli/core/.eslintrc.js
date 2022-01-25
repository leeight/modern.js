// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

const a = 10;

module.exports = {
  extends: ['@modern-js'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: require.resolve('./tsconfig.json'),
  }
};
