import { loadConfig } from '@modern-js/load-config';
import Ajv, { ErrorObject } from 'ajv';
import ajvKeywords from 'ajv-keywords';
import logger from 'signale';
import {
  createDebugger,
  getPort,
  isDev,
  // MetaOptions,
  PLUGIN_SCHEMAS,
  chalk,
} from '@modern-js/utils';
import mergeWith from 'lodash.mergewith';
import betterAjvErrors from 'better-ajv-errors';
import { codeFrameColumns } from '@babel/code-frame';
import type {
  NormalizedConfig,
  ConfigParam,
  LoadedConfig,
  UserConfig,
} from '@modern-js/types';
// import { PluginConfig } from '../loadPlugins';
import { repeatKeyWarning } from '../utils/repeatKeyWarning';
import { defaults } from './defaults';
import { mergeConfig } from './mergeConfig';
import { patchSchema, PluginValidateSchema } from './schema';

export type { NormalizedConfig, ConfigParam, LoadedConfig, UserConfig };
export type {
  SourceConfig,
  OutputConfig,
  ServerConfig,
  DevConfig,
  DeployConfig,
  ToolsConfig,
  RuntimeConfig,
  RuntimeByEntriesConfig,
} from '@modern-js/types';

const debug = createDebugger('resolve-config');

export { defaults as defaultsConfig };
export { mergeConfig };

export const defineConfig = (config: ConfigParam): ConfigParam => config;

export const loadUserConfig = async (
  appDirectory: string,
  filePath?: string,
  packageJsonConfig?: string,
): Promise<LoadedConfig> => {
  const loaded = await loadConfig<ConfigParam>(
    appDirectory,
    filePath,
    packageJsonConfig,
  );

  const config = !loaded
    ? {}
    : await (typeof loaded.config === 'function'
        ? loaded.config(0)
        : loaded.config);

  return {
    config: mergeWith({}, config || {}, loaded?.pkgConfig || {}),
    jsConfig: config || {},
    pkgConfig: (loaded?.pkgConfig || {}) as UserConfig,
    filePath: loaded?.path,
    dependencies: loaded?.dependencies || [],
  };
};

const showAdditionalPropertiesError = (error: ErrorObject) => {
  if (
    error.keyword === 'additionalProperties' &&
    error.instancePath &&
    error.params.additionalProperty
  ) {
    const target = `${error.instancePath.substr(1)}.${
      error.params.additionalProperty
    }`;

    const name = Object.keys(PLUGIN_SCHEMAS).find(key =>
      (PLUGIN_SCHEMAS as Record<string, any>)[key].some(
        (schemaItem: any) => schemaItem.target === target,
      ),
    );

    if (name) {
      logger.warn(
        `The configuration of ${chalk.bold(
          target,
        )} is provided by plugin ${chalk.bold(name)}. Please use ${chalk.bold(
          'yarn new',
        )} to enable the corresponding capability.\n`,
      );
    }
  }
};

/* eslint-disable max-statements, max-params */
export const resolveConfig = async (
  loaded: LoadedConfig,
  configs: UserConfig[],
  schemas: PluginValidateSchema[],
  restartWithExistingPort: number,
  argv: string[],
): Promise<NormalizedConfig> => {
  const { config: userConfig, jsConfig, pkgConfig } = loaded;

  const ajv = new Ajv({ $data: true, strict: false });

  ajvKeywords(ajv);

  const validateSchema = patchSchema(schemas);

  const validate = ajv.compile(validateSchema);

  repeatKeyWarning(validateSchema, jsConfig, pkgConfig);

  // validate user config.
  const valid = validate(userConfig);

  if (!valid && validate.errors?.length) {
    showAdditionalPropertiesError(validate?.errors[0]);
    const errors = betterAjvErrors(
      validateSchema,
      userConfig,
      validate.errors?.map(e => ({
        ...e,
        dataPath: e.instancePath,
      })),
      {
        format: 'js',
        indent: 2,
      },
    );

    logger.log(
      codeFrameColumns(
        JSON.stringify(userConfig, null, 2),
        {
          start: errors?.[0].start as any,
          end: errors?.[0].end as any,
        },
        {
          highlightCode: true,
          message: errors?.[0].error,
        },
      ),
    );
    throw new Error(`Validate configuration error`);
  }

  // validate config from plugins.
  for (const config of configs) {
    if (!validate(config)) {
      logger.error(validate.errors);
      throw new Error(`Validate configuration error.`);
    }
  }
  const resolved = mergeConfig([defaults as any, ...configs, userConfig]);

  resolved._raw = loaded.config;

  if (isDev() && argv[0] === 'dev') {
    if (restartWithExistingPort > 0) {
      // dev server is restarted, should use existing port number
      resolved.server.port = restartWithExistingPort;
    } else {
      // get port for new dev server
      resolved.server.port = await getPort(resolved.server.port!);
    }
  }

  debug('resolved %o', resolved);

  return resolved;
};
/* eslint-enable max-statements, max-params */
