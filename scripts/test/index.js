/* eslint-disable node/no-unsupported-features/es-syntax */
// const {
//   suite,
//   test,
//   describe,
//   it,
//   expect,
//   assert,
//   vitest,
//   vi,
//   beforeAll,
//   afterAll,
//   beforeEach,
//   afterEach,
// } = require('vitest');

const sharedConfig = require('./jest.config');

function defineConfig(options) {
  return {
    ...sharedConfig,
    ...options,
  };
}

exports.defineConfig = defineConfig;
// exports.suite = suite;
// exports.test = test;
// exports.describe = describe;
// exports.it = it;
// exports.expect = expect;
// exports.assert = assert;
// exports.vitest = vitest;
// exports.vi = vi;
// exports.beforeAll = beforeAll;
// exports.afterAll = afterAll;
// exports.beforeEach = beforeEach;
// exports.afterEach = afterEach;

/* eslint-enable node/no-unsupported-features/es-syntax */
