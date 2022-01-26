import type { Compiler, MultiCompiler, Configuration } from '../src/cli';

describe('cli types', () => {
  it('default', () => {
    const a: Compiler = {} as any;
    const b: MultiCompiler = {} as any;
    const c: Configuration = {} as any;
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(c).toBeDefined();
  });
});
