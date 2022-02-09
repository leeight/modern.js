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

describe('test build', () => {
  it(`should get right alias build!`, async () => {
    const buildRes = await modernBuild(appDir);
    expect(buildRes.code === 0).toBe(true);
    expect(existsSync('asset-manifest.json')).toBe(true);
    expect(existsSync('route.json')).toBe(true);
    expect(existsSync('html/main/index.html')).toBe(true);
  });

  it(`should render page correctly`, async () => {
    const appPort = await getPort();
    const app = await launchApp(
      appDir,
      appPort,
      {},
      {
        // FIXME: disable the fast refresh plugin to avoid the `require` not found issue.
        FAST_REFRESH: 'false',
      },
    );
    const logs: string[] = [];
    const errors: string[] = [];

    const browser = await puppeteer.launch({ headless: true, dumpio: true });
    const page = await browser.newPage();
    page.on('console', msg => logs.push(msg.text()));
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://localhost:${appPort}`, {
      waitUntil: ['networkidle0'],
    });

    const root = await page.$('#root');
    const targetText = await page.evaluate(el => el.textContent, root);
    expect(targetText.trim()).toEqual('Hello Modern.js! 1');
    expect(errors.length).toEqual(0);
    expect(logs[0]).toEqual('[HMR] Waiting for update signal from WDS...');

    browser.close();
    await killApp(app);
  });
});
