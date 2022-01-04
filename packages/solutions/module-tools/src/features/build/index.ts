import path from 'path';
import { fs } from '@modern-js/utils';
import type { NormalizedConfig } from '@modern-js/core';
import type { IBuildConfig } from '../../types';
import { buildSourceCode } from './build';
import { buildInWatchMode } from './build-watch';
import { buildPlatform } from './build-platform';

// const buildFeature: typeof import('./build') = Import.lazy('./build', require);
// const buildWatchFeature: typeof import('./build-watch') = Import.lazy(
//   './build-watch',
//   require,
// );
// const bp: typeof import('./build-platform') = Import.lazy(
//   './build-platform',
//   require,
// );

export const build = async (
  config: IBuildConfig,
  modernConfig: NormalizedConfig,
) => {
  const {
    appDirectory,
    enableWatchMode,
    platform,
    clear = true,
    isTsProject,
  } = config;
  const {
    output: { path: outputPath = 'dist' },
  } = modernConfig;
  // TODO: maybe need watch mode in build platform
  if (typeof platform === 'boolean' && platform) {
    if (process.env.RUN_PLATFORM) {
      await buildPlatform({ platform: 'all', isTsProject });
    }
    return;
  }

  if (typeof platform === 'string') {
    if (process.env.RUN_PLATFORM) {
      await buildPlatform({ platform, isTsProject });
    }
    return;
  }

  if (clear) {
    fs.removeSync(path.join(appDirectory, outputPath));
  }

  if (enableWatchMode) {
    await buildInWatchMode(config, modernConfig);
  } else {
    await buildSourceCode(config, modernConfig);
  }
};
