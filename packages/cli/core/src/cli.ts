// 这个文件跟 bin/modern-js.js 基本一样
// 在开发阶段，因为 package.json 的 exports['./bin']['jsnext:source'] 配置
// 了这个文件，所以需要保留, 后续如果找到更好的方式之后会移除这个文件

import moduleToolsPlugin from '@modern-js/module-tools/cli';
import testingPlugin from '@modern-js/plugin-testing/cli';
import { cli } from '.';

const { version } = require('../package.json');

process.env.MODERN_JS_VERSION = version;
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV =
    // eslint-disable-next-line no-nested-ternary
    ['build', 'start', 'deploy'].includes(process.argv[2])
      ? 'production'
      : process.argv[2] === 'test'
      ? 'test'
      : 'development';
}

// 默认情况下，启用的 plugin 是这两个
// [
//  { cli: '@modern-js/module-tools/cli' },
//  { cli: '@modern-js/plugin-testing/cli' }
// ]
cli.run(process.argv.slice(2), {
  plugins: {
    '@modern-js/module-tools': {
      cliPluginInstance: moduleToolsPlugin
    },
    '@modern-js/plugin-testing': {
      cliPluginInstance: testingPlugin
    }
  }
});
