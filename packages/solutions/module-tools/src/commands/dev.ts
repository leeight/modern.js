import * as path from 'path';
import { Import } from '@modern-js/utils';
import { showMenu, devStorybook } from '../features/dev';
import { useAppContext, useResolvedConfigContext } from '@modern-js/core';
import dotenv from 'dotenv';
import { existTsConfigFile } from '../utils/tsconfig';
import { valideBeforeTask } from '../utils/valide';

// const devFeature: typeof import('../features/dev') = Import.lazy(
//   '../features/dev',
//   require,
// );
// const core: typeof import('@modern-js/core') = Import.lazy(
//   '@modern-js/core',
//   require,
// );
// const dotenv: typeof import('dotenv') = Import.lazy('dotenv', require);
// const tsConfigutils: typeof import('../utils/tsconfig') = Import.lazy(
//   '../utils/tsconfig',
//   require,
// );
// const valid: typeof import('../utils/valide') = Import.lazy(
//   '../utils/valide',
//   require,
// );

export interface IDevOption {
  tsconfig: string;
}

export const dev = async (option: IDevOption) => {
  const { tsconfig: tsconfigName } = option;
  const appContext = useAppContext();
  const modernConfig = useResolvedConfigContext();
  const { appDirectory } = appContext;
  const tsconfigPath = path.join(appDirectory, tsconfigName);

  dotenv.config();

  valideBeforeTask({ modernConfig, tsconfigPath });

  const isTsProject = existTsConfigFile(tsconfigPath);
  if (process.env.RUN_PLATFORM) {
    await showMenu({ isTsProject, appDirectory });
  } else {
    await devStorybook({ isTsProject, appDirectory });
  }
};
