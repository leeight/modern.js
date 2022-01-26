import { isProd } from '@modern-js/utils';
import type { NormalizedConfig } from '@modern-js/types';

export const shouldUseSourceMap = (config: NormalizedConfig) =>
  isProd() && !config.output.disableSourceMap;
