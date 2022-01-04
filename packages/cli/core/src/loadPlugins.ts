import {
  isDepExists,
  createDebugger,
  compatRequire,
  INTERNAL_PLUGINS,
} from '@modern-js/utils';

const debug = createDebugger('load-plugins');

export interface PluginConfigItem {
  cli?: string;
  // cliPluginInstance > cli
  cliPluginInstance?: any;

  server?: string;
  // serverPluginInstance > server
  serverPluginInstance?: any;
}

export type PluginConfig = Array<PluginConfigItem>;

/**
 * Try to resolve plugin entry file path.
 * @param appDirectory - Application root directory.
 * @param plugin - Plugin name or plugin name with options.
 * @returns Resolved file path.
 */
const resolvePlugin = (appDirectory: string, plugin: PluginConfigItem) => {
  const tryResolve = (name: string) => {
    let filePath = '';
    try {
      filePath = require.resolve(name, { paths: [appDirectory] });
      delete require.cache[filePath];
    } catch (err) {
      if ((err as any).code === 'MODULE_NOT_FOUND') {
        throw new Error(`Can not find plugin ${name}.`);
      }
      throw err;
    }
    return filePath;
  };

  const resolved: PluginConfigItem = {};

  if (typeof plugin === 'string' || plugin.cli) {
    resolved.cli =
      typeof plugin === 'string' ? tryResolve(plugin) : tryResolve(plugin.cli!);
  }

  if (plugin.server) {
    resolved.server = tryResolve(plugin.server);
  }

  return resolved;
};

/**
 * Load internal plugins which in @modern-js scope and user's custom plugins.
 * @param appDirectory - Application root directory.
 * @param pluginsConfig - Plugins declared in the user configuration.
 * @returns Plugin Objects has been required.
 */
export const loadPlugins = (
  appDirectory: string,
  pluginConfig: PluginConfig,
  internalPlugins?: typeof INTERNAL_PLUGINS,
) => {
  const plugins: PluginConfigItem[] = [
    ...Object.keys(internalPlugins || INTERNAL_PLUGINS)
      .filter(name => isDepExists(appDirectory, name))
      .map(name => (internalPlugins || INTERNAL_PLUGINS)[name]),
    ...pluginConfig,
  ];
  // console.log(plugins);

  return plugins.map(plugin => {
    let cliPlugin = plugin.cliPluginInstance;
    let serverPlugin = plugin.serverPluginInstance;
    let resolved;

    if (!cliPlugin) {
      if (!resolved) {
        resolved = resolvePlugin(appDirectory, plugin);
      }
      const { cli } = resolved;
      cliPlugin = cli && { ...compatRequire(cli), pluginPath: cli };
    }

    if (!serverPlugin) {
      if (!resolved) {
        resolved = resolvePlugin(appDirectory, plugin);
      }
      const { server } = resolved;

      serverPlugin = server && {
        ...compatRequire(server),
        pluginPath: server,
      };
    }

    return {
      cli: cliPlugin,
      cliPath: typeof plugin === 'string' ? plugin : plugin.cli,
      server: serverPlugin,
      serverPath: typeof plugin === 'string' ? undefined : plugin.server,
    };
  });
};
