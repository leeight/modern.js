import { Import, fs } from '@modern-js/utils';
import type { NormalizedConfig, CoreOptions } from '@modern-js/core';
import type { ICompilerResult, IVirtualDist } from '@modern-js/babel-compiler';
import type { ITsconfig } from '../types';
import { initEnv } from './build-source-code';
import { BuildWatchEvent, compiler } from '@modern-js/babel-compiler';
import { clearFlag } from '../features/build/logger';
import { readTsConfig } from '../utils/tsconfig';
import { resolveBabelConfig } from '../utils/babel';
import { cli, manager } from '@modern-js/core';
import moduleToolsPlugin from '../index';
import testingPlugin from '@modern-js/plugin-testing/cli';

// const babelCompiler: typeof import('@modern-js/babel-compiler') = Import.lazy(
//   '@modern-js/babel-compiler',
//   require,
// );
// const logger: typeof import('../features/build/logger') = Import.lazy(
//   '../features/build/logger',
//   require,
// );
// const ts: typeof import('../utils/tsconfig') = Import.lazy(
//   '../utils/tsconfig',
//   require,
// );
// const babel: typeof import('../utils/babel') = Import.lazy(
//   '../utils/babel',
//   require,
// );
// const core: typeof import('@modern-js/core') = Import.lazy(
//   '@modern-js/core',
//   require,
// );
const argv: typeof import('process.argv').default = Import.lazy(
  'process.argv',
  require,
);

const generatorRealFiles = (virtualDists: IVirtualDist[]) => {
  for (const virtualDist of virtualDists) {
    const { distPath, code, sourcemap, sourceMapPath } = virtualDist;
    fs.ensureFileSync(distPath);
    fs.writeFileSync(distPath, code);
    if (sourcemap.length > 0) {
      fs.ensureFileSync(sourceMapPath);
      fs.writeFileSync(sourceMapPath, sourcemap);
    }
  }
};

const runBabelCompiler = async (
  config: ITaskConfig,
  modernConfig: NormalizedConfig,
) => {
  const { tsconfigPath } = config;
  const babelConfig = resolveBabelConfig(
    config.appDirectory,
    modernConfig,
    {
      sourceAbsDir: config.srcRootDir,
      tsconfigPath,
      syntax: config.syntax,
      type: config.type,
    },
  );
  const tsconfig = readTsConfig<ITsconfig>(tsconfigPath || '', {});
  const isTs = Boolean(tsconfig);

  const getExts = (isTsProject: boolean) => {
    // TODO: 是否受控tsconfig.json 里的jsx配置
    let exts = [];
    if (isTsProject) {
      exts = tsconfig?.compilerOptions?.allowJs
        ? ['.ts', '.tsx', '.js', '.jsx']
        : ['.ts', '.tsx'];
    } else {
      exts = ['.js', '.jsx'];
    }

    return exts;
  };
  const emitter = await compiler(
    {
      enableVirtualDist: true,
      quiet: true,
      enableWatch: true,
      rootDir: config.srcRootDir,
      distDir: config.distDir,
      watchDir: config.srcRootDir,
      extensions: getExts(isTs),
    },
    babelConfig,
  );
  emitter.on(BuildWatchEvent.compiling, () => {
    console.info(clearFlag, `Compiling...`);
  });
  emitter.on(
    BuildWatchEvent.firstCompiler,
    (result: ICompilerResult) => {
      if (result.code === 1) {
        console.error(clearFlag);
        console.error(result.message);
        for (const detail of result.messageDetails || []) {
          console.error(detail.content);
        }
      } else {
        generatorRealFiles(result.virtualDists!);
        console.info(clearFlag, '[Babel Compiler]: Successfully');
      }
    },
  );

  emitter.on(
    BuildWatchEvent.watchingCompiler,
    (result: ICompilerResult) => {
      if (result.code === 1) {
        console.error(clearFlag);
        console.error(result.message);
        for (const detail of result.messageDetails || []) {
          console.error(detail.content);
        }
        if (
          Array.isArray(result.virtualDists) &&
          result.virtualDists?.length > 0
        ) {
          generatorRealFiles(result.virtualDists);
        }
      } else {
        generatorRealFiles(result.virtualDists!);
        console.info(result.message);
      }
    },
  );
  await emitter.watch();
};

const buildSourceCode = async (
  config: ITaskConfig,
  modernConfig: NormalizedConfig,
) => {
  const { compiler } = config;
  if (compiler === 'babel') {
    await runBabelCompiler(config, modernConfig);
  }
};

interface ITaskConfig {
  srcRootDir: string; // 源码的根目录
  distDir: string;
  appDirectory: string;
  sourceMaps: boolean;
  syntax: 'es5' | 'es6+';
  type: 'module' | 'commonjs';
  tsconfigPath: string;
  copyDirs?: string;
  compiler?: 'babel' | 'esbuild' | 'swc';
}

const taskMain = async ({
  modernConfig,
}: {
  modernConfig: NormalizedConfig;
}) => {
  const processArgv = argv(process.argv.slice(2));
  const config = processArgv<ITaskConfig>({
    srcRootDir: `${process.cwd()}/src`,
    distDir: '',
    compiler: 'babel',
    appDirectory: '',
    sourceMaps: false,
    tsconfigPath: '',
    syntax: 'es5',
    type: 'module',
  });
  process.env.BUILD_FORMAT = initEnv(config);

  await buildSourceCode(config, modernConfig);
};

(async () => {
  let options: CoreOptions | undefined;
  if (process.env.CORE_INIT_OPTION_FILE) {
    ({ options } = require(process.env.CORE_INIT_OPTION_FILE));
  }
  const { resolved } = await cli.init([], {
    plugins: {
      '@modern-js/module-tools': {
        cliPluginInstance: moduleToolsPlugin
      },
      '@modern-js/plugin-testing': {
        cliPluginInstance: testingPlugin
      }
    },
    ...options
  });
  await manager.run(async () => {
    try {
      await taskMain({ modernConfig: resolved });
    } catch (e) {
      console.error(e);
    }
  });
})();
