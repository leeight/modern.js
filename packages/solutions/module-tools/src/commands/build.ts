import * as path from 'path';
import { fs } from '@modern-js/utils';
import type { Platform } from '../types';
import { useAppContext, useResolvedConfigContext } from '@modern-js/core';
import { existTsConfigFile } from '../utils/tsconfig';
import { valideBeforeTask } from '../utils/valide';
import { build as buildFeature } from '../features/build';
import dotenv from 'dotenv';

// const tsConfigutils: typeof import('../utils/tsconfig') = Import.lazy(
//   '../utils/tsconfig',
//   require,
// );

// const valid: typeof import('../utils/valide') = Import.lazy(
//   '../utils/valide',
//   require,
// );
// const buildFeature: typeof import('../features/build') = Import.lazy(
//   '../features/build',
//   require,
// );
// const core: typeof import('@modern-js/core') = Import.lazy(
//   '@modern-js/core',
//   require,
// );
// const dotenv: typeof import('dotenv') = Import.lazy('dotenv', require);

export interface IBuildOption {
  watch: boolean;
  tsconfig: string;
  platform: boolean | Exclude<Platform, 'all'>;
  styleOnly: boolean;
  tsc: boolean;
  clear: boolean;
}

export const build = async ({
  watch = false,
  tsconfig: tsconfigName,
  tsc,
  clear = true,
  platform,
}: IBuildOption) => {
  const { appDirectory } = useAppContext();
  const modernConfig = useResolvedConfigContext();
  const tsconfigPath = path.join(appDirectory, tsconfigName);
  dotenv.config();
  const isTsProject = existTsConfigFile(tsconfigPath);
  const enableTscCompiler = isTsProject && tsc;

  valideBeforeTask({ modernConfig, tsconfigPath });

  // TODO: 一些配置只需要从modernConfig中获取
  await buildFeature(
    {
      appDirectory,
      enableWatchMode: watch,
      isTsProject,
      platform,
      sourceDir: 'src',
      tsconfigName,
      enableTscCompiler,
      clear,
    },
    modernConfig,
  );

  process.on('SIGBREAK', () => {
    console.info('exit');
    const tempTsconfigFilePath = path.join(
      appDirectory,
      './tsconfig.temp.json',
    );
    if (fs.existsSync(tempTsconfigFilePath)) {
      fs.removeSync(tempTsconfigFilePath);
    }
  });
};
