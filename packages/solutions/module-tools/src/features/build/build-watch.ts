import * as path from 'path';
import * as os from 'os';
// import { Import } from '@modern-js/utils';
import type { NormalizedConfig } from '@modern-js/core';
import type { IBuildConfig, ITaskMapper } from '../../types';
import { useAppContext } from '@modern-js/core';
import execa from 'execa';
import { LoggerManager } from './logger';
import pMap from 'p-map';
import { getCodeInitMapper, getCodeMapper, getDtsMapper } from './utils';
import { clearFlag, runBabelCompilerTitle, runStyleCompilerTitle, runTscWatchTitle } from './constants';

// const core: typeof import('@modern-js/core') = Import.lazy(
//   '@modern-js/core',
//   require,
// );
// const execa: typeof import('execa') = Import.lazy('execa', require);
// const lg: typeof import('./logger') = Import.lazy('./logger', require);
// const pMap: typeof import('p-map') = Import.lazy('p-map', require);
// const utils: typeof import('./utils') = Import.lazy('./utils', require);
// const constants: typeof import('./constants') = Import.lazy(
//   './constants',
//   require,
// );

export const buildInWatchMode = async (
  config: IBuildConfig,
  _: NormalizedConfig,
) => {
  const { appDirectory } = useAppContext();
  const { sourceDir, enableTscCompiler } = config;
  const srcRootDir = path.join(appDirectory, sourceDir);
  const concurrency = os.cpus().length;
  const lm = new LoggerManager();
  const codeLog = lm.createLoggerText({
    title: runBabelCompilerTitle,
  });
  const dtsLog = lm.createLoggerText({ title: runTscWatchTitle });
  const styleLog = lm.createLoggerText({
    title: runStyleCompilerTitle,
  });
  const copyLog = lm.createLoggerText({ title: 'Copy Log:' });
  const initCodeMapper = getCodeInitMapper(config);
  const taskMapper: ITaskMapper[] = [
    ...getCodeMapper({
      logger: codeLog,
      taskPath: require.resolve('../../tasks/build-watch-source-code'),
      config,
      willCompilerDirOrFile: sourceDir,
      initMapper: initCodeMapper,
      srcRootDir,
    }),
    ...(enableTscCompiler ? getDtsMapper(config, dtsLog) : []),
    {
      logger: styleLog,
      taskPath: require.resolve('../../tasks/build-watch-style'),
    },
    {
      logger: copyLog,
      taskPath: require.resolve('../../tasks/copy-assets'),
      params: ['--watch'],
    },
  ];
  lm.on('data', () => {
    console.info(clearFlag);
    enableTscCompiler && console.info(dtsLog.value);
    console.info(codeLog.value);
    console.info(styleLog.value);
  });
  await pMap(
    taskMapper,
    async ({ logger, taskPath, params }) => {
      const childProcess = execa.node(taskPath, params, { stdio: 'pipe' });
      if (logger === codeLog) {
        lm.addStdout(logger, childProcess.stdout, {
          event: { error: true, data: true },
          // colors: { data: s => s },
        });
        lm.addStderr(logger, childProcess.stderr);
      }

      if (logger === dtsLog) {
        lm.addStdout(logger, childProcess.stdout, {
          event: { data: true, error: true },
          colors: {
            // tsc 的log信息无论是错误还是正确都是从 data event 中获取到的
            data: s => s,
          },
        });
      }

      if (logger === styleLog || logger === copyLog) {
        lm.addStdout(logger, childProcess.stdout, {
          event: { error: true, data: true },
          // colors: { data: s => s },
        });
        lm.addStderr(logger, childProcess.stderr);
      }

      await childProcess;
    },
    { concurrency },
  );
};
