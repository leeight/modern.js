import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { describe, it, expect } from 'vitest';
import {
  launchApp,
  killApp,
  getPort,
  modernBuild,
} from '@integration-test/shared/utils/modernTestUtils';

const appDir = path.resolve(__dirname, '../');

function existsSync(filePath: string) {
  return fs.existsSync(path.join(appDir, 'dist', filePath));
}

describe('test dev', () => {
  it(`should render page correctly`, async () => {
    const appPort = await getPort();
    const app = await launchApp(appDir, appPort, {}, {});
    const logs: string[] = [];
    const errors: string[] = [];

    page.on('console', msg => {
      logs.push(msg.text());
    });
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    await page.goto(`http://localhost:${appPort}`, {
      waitUntil: ['networkidle0'],
    });

    const root = await page.$('.description');
    const targetText = await page.evaluate(el => el.textContent, root);
    expect(targetText.trim()).toEqual('Get started by editing src/App.tsx');
    expect(errors.length).toEqual(0);
    expect(logs).toEqual(['[HMR] Waiting for update signal from WDS...']);

    await killApp(app);
  });
});

describe('test build', () => {
  let port = 8080;
  let buildRes, app;
  beforeAll(async () => {
    port = await getPort();

    buildRes = await modernBuild(appDir);

    app = await modernStart(appDir, port, {
      cwd: appDir,
    });
  });

  afterAll(async () => {
    await killApp(app);
  });

  it(`should get right alias build!`, async () => {
    expect(buildRes.code === 0).toBe(true);
    expect(existsSync('asset-manifest.json')).toBe(true);
    expect(existsSync('route.json')).toBe(true);
    expect(existsSync('html/main/index.html')).toBe(true);
  });

  it('should support enableInlineScripts', async () => {
    const host = `http://localhost`;
    expect(buildRes.code === 0).toBe(true);
    await page.goto(`${host}:${port}`);

    const description = await page.$('.description');
    const targetText = await page.evaluate(el => el.textContent, description);
    expect(targetText.trim()).toEqual('Get started by editing src/App.tsx');
  });
});
