require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  // root: true,
  extends: ['@modern-js'],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
};
