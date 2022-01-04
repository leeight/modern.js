// import { Import } from '@modern-js/utils';
import type { Command } from 'commander';
import type { IDevOption } from '../commands/dev';
import { i18n, localeKeys } from '../locale';
import { dev } from '../commands';

// const local: typeof import('../locale') = Import.lazy('../locale', require);
// const commands: typeof import('../commands') = Import.lazy(
//   '../commands',
//   require,
// );

export const devCli = (program: Command) => {
  program
    .command('dev')
    .usage('[options]')
    .description(i18n.t(localeKeys.command.dev.describe))
    .option(
      '--tsconfig [tsconfig]',
      i18n.t(localeKeys.command.build.tsconfig),
      './tsconfig.json',
    )
    .action(async (params: IDevOption) => {
      await dev(params);
    });
};
