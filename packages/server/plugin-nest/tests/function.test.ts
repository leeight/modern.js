import * as path from 'path';
import request from 'supertest';
import { serverManager } from '@modern-js/server-plugin';
import { gather } from '@modern-js/server-utils';
import plugin from '../src/server';
import { APIPlugin } from './helpers';

const pwd = path.join(__dirname, './fixtures/function');

describe('function-mode', () => {
  const id = '666';
  const name = 'foo';
  const foo = { id, name };
  let apiHandler: any;

  beforeAll(async () => {
    const runner = await serverManager
      .clone()
      .usePlugin(APIPlugin, plugin)
      .init();

    const result = gather(pwd);
    apiHandler = await runner.prepareApiServer({
      pwd,
      mode: 'function',
      config: { middleware: result.api },
    });
  });

  it('should works', async () => {
    const res = await request(apiHandler).get('/hello');
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ name: 'kjc' });
  });

  it('should works with string result', async () => {
    const res = await request(apiHandler).post('/hello');
    expect(res.status).toBe(200);
    expect(res.body).toBe('kjc');
  });

  it('should works with body', async () => {
    const res = await request(apiHandler)
      .post('/nest/user?test=true')
      .send(foo);
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      data: foo,
      query: { test: 'true' },
    });
  });

  it('should works with schema', async () => {
    const res = await request(apiHandler).patch('/nest/user').send({
      id: 777,
      name: 'xxx',
    });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(777);
  });

  // TODO: 因为 esbuild-jest & esbuild 是不支持 decorator 的，但是 ts-jest 是支持的，所以目前使用 esbuild-jest 的时候，这个 case 是无法通过测试的
  // 后续可以再改改配置，把 plugin-nest 这个模块的测试都走 ts-jest 可能就没有问题了
  // https://github.com/evanw/esbuild/issues/257#issuecomment-658053616
  xit('should works with middleware', async () => {
    const res = await request(apiHandler).get('/cats');
    expect(res.status).toBe(200);
  });
});
