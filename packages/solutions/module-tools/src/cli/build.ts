// import { Import } from '@modern-js/utils';
import type { Command } from 'commander';
import type { IBuildOption } from '../commands/build';
import { i18n, localeKeys } from '../locale/index';
import { build } from '../commands';

// const local: typeof import('../locale') = Import.lazy(
//   '../locale/index',
//   require,
// );
// const commands: typeof import('../commands') = Import.lazy(
//   '../commands',
//   require,
// );

export const buildCli = (program: Command) => {
  // TODO: 初始化环境变量
  program
    .command('build')
    .usage('[options]')
    .description(i18n.t(localeKeys.command.build.describe))
    .option('-w, --watch', i18n.t(localeKeys.command.build.watch))
    .option(
      '--tsconfig [tsconfig]',
      i18n.t(localeKeys.command.build.tsconfig),
      './tsconfig.json',
    )
    .option(
      '--style-only',
      i18n.t(localeKeys.command.build.style_only),
    )
    .option(
      '--platform [platform]',
      i18n.t(localeKeys.command.build.platform),
    )
    .option('--no-tsc', i18n.t(localeKeys.command.build.no_tsc))
    .option('--no-clear', i18n.t(localeKeys.command.build.no_clear))
    .action(async (subCommand: IBuildOption) => {
      await build(subCommand);
    });
};
