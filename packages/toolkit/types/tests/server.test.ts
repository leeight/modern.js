import type { BaseSSRServerContext } from '../src/server';

describe('cli types', () => {
  it('default', () => {
    const a: BaseSSRServerContext = {} as any;
    expect(a).toBeDefined();
  });
});
