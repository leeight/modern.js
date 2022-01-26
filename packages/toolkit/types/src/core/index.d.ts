export interface SourceConfig {
  entries?: Record<
    string,
    | string
    | {
        entry: string;
        enableFileSystemRoutes?: boolean;
        disableMount?: boolean;
      }
  >;
  disableDefaultEntries?: boolean;
  entriesDir?: string;
  configDir?: string;
  apiDir?: string;
  envVars?: Array<string>;
  globalVars?: Record<string, string>;
  alias?:
    | Record<string, string>
    | ((aliases: Record<string, string>) => Record<string, unknown>);
  moduleScopes?:
    | Array<string | RegExp>
    | ((scopes: Array<string | RegExp>) => Array<string | RegExp>);
  include?: Array<string | RegExp>;
}

export interface OutputConfig {
  assetPrefix?: string;
  htmlPath?: string;
  jsPath?: string;
  cssPath?: string;
  mediaPath?: string;
  path?: string;
  title?: string;
  titleByEntries?: Record<string, string>;
  meta?: MetaOptions;
  metaByEntries?: Record<string, MetaOptions>;
  inject?: 'body' | 'head' | boolean;
  injectByEntries?: Record<string, 'body' | 'head' | boolean>;
  mountId?: string;
  favicon?: string;
  faviconByEntries?: Record<string, string | undefined>;
  copy?: Record<string, unknown>;
  scriptExt?: Record<string, unknown>;
  disableHtmlFolder?: boolean;
  disableCssModuleExtension?: boolean;
  disableCssExtract?: boolean;
  enableCssModuleTSDeclaration?: boolean;
  disableMinimize?: boolean;
  enableInlineStyles?: boolean;
  enableInlineScripts?: boolean;
  disableSourceMap?: boolean;
  disableInlineRuntimeChunk?: boolean;
  disableAssetsCache?: boolean;
  enableLatestDecorators?: boolean;
  polyfill?: 'off' | 'usage' | 'entry' | 'ua';
  dataUriLimit?: number;
  templateParameters?: Record<string, unknown>;
  templateParametersByEntries?: Record<
    string,
    Record<string, unknown> | undefined
  >;
  cssModuleLocalIdentName?: string;
  enableModernMode?: boolean;
  federation?: boolean;
  disableNodePolyfill?: boolean;
  enableTsLoader?: boolean;
}

export interface ServerConfig {
  routes?: Record<
    string,
    | string
    | {
        route: string | string[];
        disableSpa?: boolean;
      }
  >;
  publicRoutes?: { [filepath: string]: string };
  ssr?: boolean | Record<string, unknown>;
  ssrByEntries?: Record<string, boolean | Record<string, unknown>>;
  baseUrl?: string | Array<string>;
  port?: number;
  logger?: Record<string, any>;
  metrics?: Record<string, any>;
  enableMicroFrontendDebug?: boolean;
}

export interface DevConfig {
  assetPrefix?: string | boolean;
  https?: boolean;
}

export interface DeployConfig {
  microFrontend?: boolean & Record<string, unknown>;
  domain?: string | Array<string>;
  domainByEntries?: Record<string, string | Array<string>>;
}

export interface ToolsConfig {
  webpack?: ConfigFunction;
  babel?: ConfigFunction;
  autoprefixer?: ConfigFunction;
  postcss?: ConfigFunction;
  lodash?: ConfigFunction;
  devServer?: Record<string, unknown>;
  tsLoader?: ConfigFunction;
  terser?: ConfigFunction;
  minifyCss?: ConfigFunction;
  esbuild?: Record<string, unknown>;
}

export interface RuntimeByEntriesConfig {
  [name: string]: RuntimeConfig;
}

export interface UserConfig {
  source?: SourceConfig;
  output?: OutputConfig;
  server?: ServerConfig;
  dev?: DevConfig;
  deploy?: DeployConfig;
  tools?: ToolsConfig;
  plugins?: PluginConfig;
  runtime?: RuntimeConfig;
  runtimeByEntries?: RuntimeByEntriesConfig;
}

export interface LoadedConfig {
  config: UserConfig;
  filePath: string | false;
  dependencies: string[];
  pkgConfig: UserConfig;
  jsConfig: UserConfig;
}

export interface NormalizedSourceConfig
  extends Omit<SourceConfig, 'alias' | 'moduleScopes'> {
  alias: SourceConfig['alias'] | Array<SourceConfig['alias']>;
  moduleScopes:
    | SourceConfig['moduleScopes']
    | Array<SourceConfig['moduleScopes']>;
}

export interface NormalizedToolsConfig
  extends Omit<
    ToolsConfig,
    | 'webpack'
    | 'babel'
    | 'postcss'
    | 'autoprefixer'
    | 'lodash'
    | 'tsLoader'
    | 'terser'
    | 'minifyCss'
    | 'esbuild'
  > {
  webpack: ToolsConfig['webpack'] | Array<NonNullable<ToolsConfig['webpack']>>;
  babel: ToolsConfig['babel'] | Array<NonNullable<ToolsConfig['babel']>>;
  postcss: ToolsConfig['postcss'] | Array<NonNullable<ToolsConfig['postcss']>>;
  autoprefixer:
    | ToolsConfig['autoprefixer']
    | Array<NonNullable<ToolsConfig['autoprefixer']>>;
  lodash: ToolsConfig['lodash'] | Array<ToolsConfig['lodash']>;
  tsLoader:
    | ToolsConfig['tsLoader']
    | Array<NonNullable<ToolsConfig['tsLoader']>>;
  terser: ToolsConfig['terser'] | Array<NonNullable<ToolsConfig['terser']>>;
  minifyCss:
    | ToolsConfig['minifyCss']
    | Array<NonNullable<ToolsConfig['minifyCss']>>;
  esbuild: ToolsConfig['esbuild'] | Array<NonNullable<ToolsConfig['esbuild']>>;
}

export interface NormalizedConfig
  extends Omit<Required<UserConfig>, 'source' | 'tools'> {
  source: NormalizedSourceConfig;
  tools: NormalizedToolsConfig;
  cliOptions?: Record<string, any>;
  _raw: UserConfig;
}
export interface CoreOptions {
  configFile?: string;
  packageJsonConfig?: string;
  plugins?: typeof INTERNAL_PLUGINS;
  beforeUsePlugins?: (
    plugins: any,
    config: any,
  ) => { cli: any; cliPath: any; server: any; serverPath: any }[];
  options?: {
    srcDir?: string;
    distDir?: string;
    sharedDir?: string;
    internalDir?: string;
  };
}

export type ConfigFunction =
  | Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | ((config: Record<string, unknown>) => Record<string, unknown> | void);

export type RuntimeConfig = Record<string, any>;

export type ConfigParam =
  | UserConfig
  | Promise<UserConfig>
  | ((env: any) => UserConfig | Promise<UserConfig>);
