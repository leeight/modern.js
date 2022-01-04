/* eslint-disable max-statements */
import * as path from 'path';
import * as os from 'os';
// import { Import } from '@modern-js/utils';
import type { NormalizedConfig } from '@modern-js/core';
import type { IBuildConfig, ITaskMapper } from '../../types';
import pMap from 'p-map';
import { LoggerManager } from './logger';
import { getCodeInitMapper, getCodeMapper, getDtsMapper } from './utils';
import execa from 'execa';
import { runBabelCompilerTitle, runTscTitle, runStyleCompilerTitle } from './constants';
import { useAppContext } from '@modern-js/core';
require('../../tasks/build-source-code');
require('../../tasks/build-style');
require('../../tasks/copy-assets');

// const pMap: typeof import('p-map') = Import.lazy('p-map', require);
// const utils: typeof import('./utils') = Import.lazy('./utils', require);
// const execa: typeof import('execa') = Import.lazy('execa', require);
// const lg: typeof import('./logger') = Import.lazy('./logger', require);
// const constants: typeof import('./constants') = Import.lazy(
//   './constants',
//   require,
// );
// const core: typeof import('@modern-js/core') = Import.lazy(
//   '@modern-js/core',
//   require,
// );

export const buildSourceCode = async (
  config: IBuildConfig,
  _: NormalizedConfig,
) => {
  const { sourceDir, enableTscCompiler } = config;
  const { appDirectory } = useAppContext();
  const concurrency = os.cpus().length;
  const srcRootDir = path.join(appDirectory, sourceDir);
  const lm = new LoggerManager();
  const codeLog = lm.createLoggerText({
    title: runBabelCompilerTitle,
  });
  const dtsLog = lm.createLoggerText({ title: runTscTitle });
  const styleLog = lm.createLoggerText({
    title: runStyleCompilerTitle,
  });
  const copyLog = lm.createLoggerText({ title: 'Copy Log:' });
  const initCodeMapper = getCodeInitMapper(config);
  const taskMapper: ITaskMapper[] = [
    ...getCodeMapper({
      logger: codeLog,
      taskPath: require.resolve('../../tasks/build-source-code'),
      config,
      willCompilerDirOrFile: sourceDir,
      initMapper: initCodeMapper,
      srcRootDir,
    }),
    ...(enableTscCompiler ? getDtsMapper(config, dtsLog) : []),
    {
      logger: styleLog,
      taskPath: require.resolve('../../tasks/build-style'),
    },
    {
      logger: copyLog,
      taskPath: require.resolve('../../tasks/copy-assets'),
    },
  ];

  lm.showCompiling();
  await pMap(
    taskMapper,
    async ({ logger, taskPath, params }) => {
      const childProcess = execa.node(taskPath, params, { stdio: 'pipe' });

      if (logger === codeLog || logger === copyLog) {
        lm.addStdout(logger, childProcess.stdout, {
          event: { data: true, error: true },
        });
        lm.addStderr(logger, childProcess.stderr);
      }

      if (logger === dtsLog) {
        lm.addStdout(dtsLog, childProcess.stdout, {
          event: { data: true, error: true },
        });
        lm.addStderr(dtsLog, childProcess.stderr);
      }
      if (logger === styleLog) {
        lm.addStdout(logger, childProcess.stdout, {
          event: { data: true, error: true },
        });
        lm.addStderr(logger, childProcess.stderr);
      }
      await childProcess;
    },
    { concurrency },
  );

  lm.disappearCompiling();
  enableTscCompiler && console.info(dtsLog.value);
  console.info(codeLog.value);
  if (styleLog.hasMessages()) {
    console.info(styleLog.value);
  }

  if (copyLog.hasMessages()) {
    console.info(copyLog.value);
  }

  if (
    dtsLog.hasErrorMessage ||
    codeLog.hasErrorMessage ||
    styleLog.hasErrorMessage ||
    copyLog.hasErrorMessage
  ) {
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
};

/* eslint-enable max-statements */
