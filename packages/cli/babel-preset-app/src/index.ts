import { createBabelChain } from '@modern-js/babel-chain';
import { generate } from './generate';
import type { Options } from './type';

export type { Options };

const defaultOptions = {
  target: 'client',
  modules: false,
  useBuiltIns: 'entry',
  useModern: false,
  useLegacyDecorators: true,
  useTsLoader: false,
  lodash: {},
  styledCompontents: {},
};

/* eslint-disable  no-param-reassign */
export default function (
  api: any,
  options: Options = { appDirectory: process.cwd() },
) {
  api.cache(true);

  options = { ...(defaultOptions as Options), ...options };

  const z = generate(options, options.chain || createBabelChain()).toJSON();
  // console.log(JSON.stringify(z, null, 2));
  return z;
}
/* eslint-enable  no-param-reassign */
