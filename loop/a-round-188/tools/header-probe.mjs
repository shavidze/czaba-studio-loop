import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';

const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');

const label = process.argv[2] ?? 'probe';
const outDir = process.argv[3];
const base = 'http://127.0.0.1:5173';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const pageErrors = [];
const consoleErrors = [];
const remoteHosts = new Set();
let authHeaders = 0;
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('request', (r) => {
  const u = new URL(r.url());
  if (!['127.0.0.1', 'localhost'].includes(u.hostname) && u.protocol.startsWith('http')) remoteHosts.add(u.hostname);
  if (r.headers().authorization) authHeaders += 1;
});

await page.goto(`${base}/store`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.waitForSelector('header nav');
await page.waitForLoadState('networkidle');

const result = await page.evaluate(() => {
  const header = document.querySelector('header');
  const navs = header ? [...header.querySelectorAll('nav')] : [];
  const inventory = navs.map((n) =>
    [...n.querySelectorAll('a')].map((a) => [a.textContent?.trim() ?? '', a.getAttribute('href')]),
  );
  const home = header?.querySelector('a[href="/"]');
  const mark = home?.firstElementChild;
  const cs = mark ? getComputedStyle(mark) : null;
  const probe = document.createElement('span');
  probe.className = 'text-foreground';
  document.body.appendChild(probe);
  const foreground = getComputedStyle(probe).color;
  probe.remove();
  const rect = header?.getBoundingClientRect();
  const main = header?.nextElementSibling?.getBoundingClientRect();
  return {
    headerHeight: rect?.height,
    nextSiblingTop: main?.top,
    headingsInHeader: header ? header.querySelectorAll('h1,h2,h3,h4,h5,h6').length : -1,
    h1Total: document.querySelectorAll('h1').length,
    markTag: mark?.tagName,
    markText: mark?.textContent,
    markHeight: mark?.getBoundingClientRect().height,
    markFill: cs?.getPropertyValue('-webkit-text-fill-color'),
    markColor: cs?.color,
    markBgImage: cs?.backgroundImage,
    foregroundToken: foreground,
    homeAccessibleText: home?.textContent?.trim(),
    desktopNavVisible: navs[0] ? getComputedStyle(navs[0]).display : null,
    inventory,
    footerCopyright: [...document.querySelectorAll('footer p')].map((p) => p.textContent?.trim()).find((t) => t?.includes('©')),
  };
});

await page.locator('header').first().screenshot({ path: `${outDir}/${label}-header-1440.png` });
const out = { label, ...result, pageErrors, consoleErrors, remoteHosts: [...remoteHosts], authHeaders };
writeFileSync(`${outDir}/${label}-probe.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
