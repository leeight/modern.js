import '@modern-js/types';

declare module '@modern-js/types' {
  interface ToolsConfig {
    tailwind?:
      | Record<string, any>
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      | ((options: Record<string, any>) => Record<string, any> | void);
  }
}
