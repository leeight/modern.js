const sharedConfig = require('@scripts/test');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...sharedConfig,
  rootDir: __dirname,
};
