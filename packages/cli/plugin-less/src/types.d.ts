import Less from 'less';
import { LoaderContext } from 'webpack';
import '@modern-js/types';

type Options = {
  lessOptions?: Less.Options;
  additionalData?:
    | string
    | ((content: string, loaderContext: LoaderContext<Options>) => string);
  sourceMap?: boolean;
  webpackImporter?: boolean;
  implementation?: boolean;
};

declare module '@modern-js/types' {
  interface ToolsConfig {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    less?: Options | ((options: Options) => Options | void);
  }
}
