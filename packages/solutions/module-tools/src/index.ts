// import { Import } from '@modern-js/utils';
import changesetPlugin from '@modern-js/plugin-changeset/cli';
import analyzePlugin from '@modern-js/plugin-analyze/cli';
import { usePlugins, createPlugin, defineConfig } from '@modern-js/core';
import { lifecycle } from '@modern-js/module-tools-hooks';
import { devCli, buildCli, newCli } from './cli';
import { i18n } from './locale';
import { addSchema } from './schema';
import { getLocaleLanguage } from './utils/language';

// const core: typeof import('@modern-js/core') = Import.lazy(
//   '@modern-js/core',
//   require,
// );
// const { createPlugin, usePlugins, defineConfig } = core;
// const hooks: typeof import('@modern-js/module-tools-hooks') = Import.lazy(
//   '@modern-js/module-tools-hooks',
//   require,
// );
// const cli: typeof import('./cli') = Import.lazy('./cli', require);
// const local: typeof import('./locale') = Import.lazy('./locale', require);
// const schema: typeof import('./schema') = Import.lazy('./schema', require);
// const lang: typeof import('./utils/language') = Import.lazy(
//   './utils/language',
//   require,
// );

export { defineConfig };

usePlugins([changesetPlugin, analyzePlugin]);

export default createPlugin(
  (() => {
    const locale = getLocaleLanguage();
    i18n.changeLanguage({ locale });
    lifecycle();

    return {
      validateSchema() {
        return addSchema();
      },
      config() {
        return {
          output: {
            enableSourceMap: false,
            jsPath: 'js',
          },
        };
      },
      commands({ program }: any) {
        devCli(program);
        buildCli(program);
        newCli(program, locale);
        // 便于其他插件辨别
        program.$$libraryName = 'module-tools';
      },
    };
  }) as any,
  { post: ['@modern-js/plugin-analyze', '@modern-js/plugin-changeset'] },
);
