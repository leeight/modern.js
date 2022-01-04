import { createPlugin, usePlugins, defineConfig } from '@modern-js/core';
import changesetPlugin from '@modern-js/plugin-changeset/cli';
import { i18n } from './locale';
import { newCli, deployCli, clearCli } from './cli';
import { getLocaleLanguage } from './utils/language';

export { defineConfig };

// eslint-disable-next-line react-hooks/rules-of-hooks
usePlugins([changesetPlugin]);

export default createPlugin(
  () => {
    const locale = getLocaleLanguage();
    i18n.changeLanguage({ locale });

    return {
      commands({ program }: any) {
        clearCli(program);
        deployCli(program);
        newCli(program, locale);
      },
    };
  },
  { post: ['@modern-js/plugin-changeset'] },
) as any;
