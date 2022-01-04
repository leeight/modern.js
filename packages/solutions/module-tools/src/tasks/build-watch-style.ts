/* eslint-disable max-statements */
import * as path from 'path';
import type {
  NormalizedConfig,
  IAppContext,
  CoreOptions,
} from '@modern-js/core';
import type { ICompilerResult, PostcssOption } from '@modern-js/style-compiler';
import { fs, watch, WatchChangeType } from '@modern-js/utils';
import type { ModuleToolsOutput } from '../types';
import { clearFlag } from '../features/build/logger';
import { getPostcssConfig } from '@modern-js/css-config';
import { buildLifeCycle } from '@modern-js/module-tools-hooks';
import { cli, manager, mountHook } from '@modern-js/core';
import { styleCompiler, BuildWatchEvent } from '@modern-js/style-compiler';
import glob from 'glob';

// const logger: typeof import('../features/build/logger') = Import.lazy(
//   '../features/build/logger',
//   require,
// );
// const cssConfig: typeof import('@modern-js/css-config') = Import.lazy(
//   '@modern-js/css-config',
//   require,
// );
// const hooks: typeof import('@modern-js/module-tools-hooks') = Import.lazy(
//   '@modern-js/module-tools-hooks',
//   require,
// );
// const core: typeof import('@modern-js/core') = Import.lazy(
//   '@modern-js/core',
//   require,
// );
// const compiler: typeof import('@modern-js/style-compiler') = Import.lazy(
//   '@modern-js/style-compiler',
//   require,
// );
// const glob: typeof import('glob') = Import.lazy('glob', require);

const STYLE_DIRS = 'styles';
const SRC_STYLE_DIRS = 'src';

const checkStylesDirExist = (option: { appDirectory: string }) => {
  const { appDirectory } = option;
  return fs.existsSync(path.join(appDirectory, STYLE_DIRS));
};

const generatorFileAndReturnLog = (
  result: ICompilerResult,
  successMessage = '',
) => {
  if (result.code === 0) {
    for (const file of result.dists) {
      fs.ensureFileSync(file.filename);
      fs.writeFileSync(file.filename, file.content);
    }
    return successMessage;
  } else {
    return result.errors.join('\n');
  }
};

const getPostcssOption = (
  appDirectory: string,
  modernConfig: NormalizedConfig,
): PostcssOption => {
  const postcssOption = getPostcssConfig(
    appDirectory,
    modernConfig,
    false,
  );
  return {
    plugins: postcssOption?.postcssOptions?.plugins || [],
    enableSourceMap: (postcssOption as any)?.sourceMap || false,
    options: {},
  } as any;
};

const copyOriginStyleFiles = ({
  targetDir,
  outputDir,
}: {
  targetDir: string;
  outputDir: string;
}) => {
  const styleFiles = glob.sync(`${targetDir}/**/*.{css,sass,scss,less}`);
  if (styleFiles.length > 0) {
    fs.ensureDirSync(outputDir);
  }
  for (const styleFile of styleFiles) {
    const file = path.relative(targetDir, styleFile);
    fs.ensureFileSync(path.join(outputDir, file));
    fs.copyFileSync(styleFile, path.join(outputDir, file));
  }
};

const logCompilerMessage = (compilerMessage: {
  src: string;
  styles: string;
}) => {
  console.info(clearFlag);
  console.info(compilerMessage.src);
  console.info(compilerMessage.styles);
};

const taskMain = async ({
  modernConfig,
  appContext,
}: {
  modernConfig: NormalizedConfig;
  appContext: IAppContext;
}) => {
  const {
    assetsPath = 'styles',
    path: outputPath = 'dist',
    jsPath = 'js',
    importStyle,
  } = modernConfig.output as ModuleToolsOutput;
  const { appDirectory } = appContext;

  const lessOption = await (mountHook() as any).moduleLessConfig(
    { modernConfig },
    {
      onLast: async (_: any) => null as any,
    },
  );
  const sassOption = await (mountHook() as any).moduleSassConfig(
    { modernConfig },
    {
      onLast: async (_: any) => null as any,
    },
  );
  const postcssOption = getPostcssOption(appDirectory, modernConfig);
  const existStylesDir = checkStylesDirExist({ appDirectory });
  const compilerMessage = {
    src: '',
    styles: '',
  };

  // 编译 styles 目录样式
  let styleEmitter = null;
  if (existStylesDir) {
    styleEmitter = styleCompiler({
      watch: true,
      projectDir: appDirectory,
      stylesDir: path.resolve(appDirectory, STYLE_DIRS),
      outDir: path.join(appDirectory, outputPath, assetsPath),
      enableVirtualDist: true,
      compilerOption: {
        less: lessOption,
        sass: sassOption,
        postcss: postcssOption,
      },
    });
    styleEmitter.on(
      BuildWatchEvent.firstCompiler,
      (styleResult: ICompilerResult) => {
        compilerMessage.styles = generatorFileAndReturnLog(
          styleResult,
          `[Style Compiler] Successfully for 'styles' dir`,
        );
        logCompilerMessage(compilerMessage);
      },
    );
    styleEmitter.on(BuildWatchEvent.compilering, () => {
      compilerMessage.styles = `[${assetsPath}] Compiling...`;
      logCompilerMessage(compilerMessage);
    });
    styleEmitter.on(
      BuildWatchEvent.watchingCompiler,
      (styleResult: ICompilerResult) => {
        compilerMessage.styles = generatorFileAndReturnLog(
          styleResult,
          `[Style Compiler] Successfully for 'styles' dir`,
        );
        logCompilerMessage(compilerMessage);
      },
    );
    // await styleEmitter.watch();
  }
  // 编译 src 内的样式代码
  const srcDir = path.resolve(appDirectory, SRC_STYLE_DIRS);
  const outputDirToSrc = path.join(
    appDirectory,
    outputPath,
    jsPath,
    assetsPath,
  );
  if (importStyle === 'compiled-code') {
    compilerMessage.src = `[src] Compiling`;
    const srcStyleEmitter = styleCompiler({
      watch: true,
      projectDir: appDirectory,
      stylesDir: srcDir,
      outDir: outputDirToSrc,
      enableVirtualDist: true,
      compilerOption: {
        less: lessOption,
        sass: sassOption,
        postcss: postcssOption,
      },
    });
    srcStyleEmitter.on(
      BuildWatchEvent.firstCompiler,
      (srcStyleResult: ICompilerResult) => {
        compilerMessage.src = generatorFileAndReturnLog(
          srcStyleResult,
          `[Style Compiler] Successfully for 'src' dir`,
        );
        logCompilerMessage(compilerMessage);
      },
    );
    srcStyleEmitter.on(BuildWatchEvent.compilering, () => {
      compilerMessage.src = `[src] Compiling`;
      logCompilerMessage(compilerMessage);
    });
    srcStyleEmitter.on(
      BuildWatchEvent.watchingCompiler,
      (srcStyleResult: ICompilerResult) => {
        compilerMessage.src = generatorFileAndReturnLog(
          srcStyleResult,
          `[Style Compiler] Successfully for 'src' dir`,
        );
        logCompilerMessage(compilerMessage);
      },
    );
    styleEmitter && (await styleEmitter.watch());
    await srcStyleEmitter.watch();
  } else {
    compilerMessage.src = `['src' dir] Copying in progress`;
    styleEmitter && (await styleEmitter.watch());
    logCompilerMessage(compilerMessage);
    copyOriginStyleFiles({ targetDir: srcDir, outputDir: outputDirToSrc });
    compilerMessage.src = `[Style Compiler] Successfully for 'src' dir`;
    logCompilerMessage(compilerMessage);
    watch(
      `${srcDir}/**/*.{css,less,sass,scss}`,
      ({ changeType, changedFilePath }) => {
        compilerMessage.src = `['src' dir] Copying in progress`;
        logCompilerMessage(compilerMessage);
        if (changeType === WatchChangeType.UNLINK) {
          const removeFile = path.normalize(
            `${outputDirToSrc}/${path.relative(srcDir, changedFilePath)}`,
          );
          fs.removeSync(removeFile);
        } else {
          copyOriginStyleFiles({
            targetDir: srcDir,
            outputDir: outputDirToSrc,
          });
        }
        compilerMessage.src = `[Style Compiler] Successfully for 'src' dir`;
        logCompilerMessage(compilerMessage);
      },
    );
  }
};

(async () => {
  let options: CoreOptions | undefined;
  if (process.env.CORE_INIT_OPTION_FILE) {
    ({ options } = require(process.env.CORE_INIT_OPTION_FILE));
  }
  buildLifeCycle();
  const { resolved: modernConfig, appContext } = await cli.init(
    [],
    options,
  );
  await manager.run(async () => {
    try {
      await taskMain({ modernConfig, appContext });
    } catch (e: any) {
      console.error(e);
    }
  });
})();
/* eslint-enable max-statements */
