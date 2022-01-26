import type { NormalizedConfig } from '@modern-js/types';
import { shouldUseSourceMap } from '../src/util';

describe('css-config#util', () => {
  const e = process.env.NODE_ENV;

  afterAll(() => {
    // restore the process.env
    process.env.NODE_ENV = e;
  });

  it('shouldUseSourceMap', () => {
    const config: NormalizedConfig = {
      output: {
        disableSourceMap: false,
      },
    } as any;
    process.env.NODE_ENV = 'production';
    expect(shouldUseSourceMap(config)).toBeTruthy();

    process.env.NODE_ENV = 'development';
    expect(shouldUseSourceMap(config)).toBeFalsy();
  });
});
