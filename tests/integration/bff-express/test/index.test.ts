import path from 'path';
import puppeteer from 'puppeteer';
import { describe, beforeAll, test, expect, afterAll } from 'vitest';
import {
  getPort,
  launchApp,
  killApp,
  sleep,
  modernBuild,
  modernStart,
} from '@integration-test/shared/utils/modernTestUtils';

describe('bff in dev', () => {
  let port = 8080;
  const SSR_PAGE = 'ssr';
  const BASE_PAGE = 'base';
  const host = `http://localhost`;
  const appPath = path.resolve(__dirname, '../');
  let app: any;

  beforeAll(async () => {
    port = await getPort();
    app = await launchApp(appPath, port, {
      cwd: appPath,
    });
  });

  test('basic usage', async () => {
    const browser = await puppeteer.launch({ headless: true, dumpio: true });
    const page = await browser.newPage();
    await page.goto(`${host}:${port}/${BASE_PAGE}`);
    const text1 = await page.$eval('.hello', el => el.textContent);
    expect(text1).toBe('bff-express');
    await sleep(1000);
    const text2 = await page.$eval('.hello', el => el.textContent);
    expect(text2).toBe('Hello Modern.js');
    browser.close();
  });

  test('basic usage with ssr', async () => {
    const browser = await puppeteer.launch({ headless: true, dumpio: true });
    const page = await browser.newPage();
    await page.goto(`${host}:${port}/${SSR_PAGE}`);
    const text1 = await page.$eval('.hello', el => el.textContent);
    expect(text1).toBe('Hello Modern.js');
    browser.close();
  });

  afterAll(async () => {
    await killApp(app);
  });
});

describe('bff in prod', () => {
  let port = 8080;
  const SSR_PAGE = 'ssr';
  const BASE_PAGE = 'base';
  const host = `http://localhost`;
  const appPath = path.resolve(__dirname, '../');
  let app: any;

  beforeAll(async () => {
    port = await getPort();

    await modernBuild(appPath, [], {
      cwd: appPath,
    });

    app = await modernStart(appPath, port, {
      cwd: appPath,
    });
  });

  test('basic usage', async () => {
    const browser = await puppeteer.launch({ headless: true, dumpio: true });
    const page = await browser.newPage();
    await page.goto(`${host}:${port}/${BASE_PAGE}`);
    const text1 = await page.$eval('.hello', el => el.textContent);
    expect(text1).toBe('bff-express');
    await sleep(1000);
    const text2 = await page.$eval('.hello', el => el.textContent);
    expect(text2).toBe('Hello Modern.js');
    browser.close();
  });

  test('basic usage with ssr', async () => {
    const browser = await puppeteer.launch({ headless: true, dumpio: true });
    const page = await browser.newPage();
    await page.goto(`${host}:${port}/${SSR_PAGE}`);
    const text1 = await page.$eval('.hello', el => el.textContent);
    expect(text1).toBe('Hello Modern.js');
    browser.close();
  });

  afterAll(async () => {
    await killApp(app);
  });
});
