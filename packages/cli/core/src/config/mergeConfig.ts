import mergeWith from 'lodash.mergewith';
import { isFunction } from '@modern-js/utils';
import type { UserConfig, NormalizedConfig } from '@modern-js/types';

/**
 * merge configuration from  modern.config.js and plugins.
 *
 * @param configs - Configuration from modern.config.ts or plugin's config hook.
 * @returns - normalized user config.
 */
export const mergeConfig = (
  configs: Array<UserConfig | NormalizedConfig>,
): NormalizedConfig =>
  mergeWith({}, ...configs, (target: any, source: any) => {
    if (Array.isArray(target) && Array.isArray(source)) {
      return [...target, ...source];
    }
    if (isFunction(source)) {
      return Array.isArray(target)
        ? [...target, source]
        : [target, source].filter(Boolean);
    }
    return undefined;
  });
