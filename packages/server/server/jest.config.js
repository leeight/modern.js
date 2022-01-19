const sharedConfig = require('@scripts/test');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  ...sharedConfig,
  testEnvironment: 'node',
  rootDir: __dirname,
};
