import { chalk, logger } from '@modern-js/utils';
import type { IAppContext, NormalizedConfig } from '@modern-js/types';

export const startTimer = {
  start: 0,
  end: 0,
};

export const dev = async (
  config: NormalizedConfig,
  appContext: IAppContext,
) => {
  logger.log(chalk.cyanBright(`Starting the development server...\n`));

  startTimer.start = Date.now();

  const [{ startDevServer }, { createHtml }] = await Promise.all([
    import('./server'),
    import('./create-entry'),
  ]);

  // create html template for each js entry
  createHtml(config, appContext);

  await startDevServer(config, appContext);
};
