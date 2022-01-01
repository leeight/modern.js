import { NormalizedConfig } from '@modern-js/core';

const allowedFeatures = ['router', 'state'];

export default function resolvePlugins(features: NormalizedConfig['runtime']) {
  const plugins: any[] = [];

  if (!features) {
    return plugins;
  }

  Object.keys(features).forEach(feature => {
    if (allowedFeatures.includes(feature)) {
      // FIXME: @modern-js/runtime 这个依赖没有在 package.json 里面声明
      const curPluginRes = require(`@modern-js/runtime/plugins`)[feature]({
        ...features[feature],
      });

      plugins.push(curPluginRes);
    }
  });

  return plugins;
}
