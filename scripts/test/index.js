const sharedConfig = require('./jest.config');

function defineConfig(options) {
  return {
    ...sharedConfig,
    ...options,
  };
}

exports.defineConfig = defineConfig;
