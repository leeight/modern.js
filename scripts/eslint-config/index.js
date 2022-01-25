// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

const fs = require('fs');

function defineConfig(options) {
  const { rootDir } = options;

  const parserOptions = {
    tsconfigRootDir: rootDir,
  };

  const project = `${rootDir}/tsconfig.json`;
  if (fs.existsSync(project)) {
    parserOptions.project = project;
  }

  return {
    root: true,
    extends: [require.resolve('./foo/index.js')],
    parserOptions,
  };
}

exports.defineConfig = defineConfig;
