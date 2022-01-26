import { prettyInstructions, logger, isDev, chalk } from '@modern-js/utils';
import { mountHook } from '@modern-js/core';
import type { IAppContext, NormalizedConfig } from '@modern-js/types';

export const printInstructions = async (
  appContext: IAppContext,
  config: NormalizedConfig,
) => {
  let message = prettyInstructions(appContext, config);
  const { existSrc } = appContext;

  if (isDev() && existSrc) {
    message += `\n${chalk.cyanBright(
      [
        `Note that the development build is not optimized.`,
        `To create a production build, execute build command.`,
      ].join('\n'),
    )}`;
  }

  // call beforePrintInstructions hook.
  const { instructions } = await (mountHook() as any).beforePrintInstructions({
    instructions: message,
  });

  logger.log(instructions);
};
