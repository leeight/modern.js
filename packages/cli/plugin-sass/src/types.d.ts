import { Options } from 'sass';
import '@modern-js/types';

declare module '@modern-js/types' {
  interface ToolsConfig {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    sass?: Options | ((options: Options) => Options | void);
  }
}
