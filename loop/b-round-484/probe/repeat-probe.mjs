// RA-REPEAT pair: anonymous client nav /account -> /account/downloads -> /account. Usage: node repeat-probe.mjs <base> <out.json>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [base, out] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(base + '/', { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForFunction(() => !!window.__remixRouter, null, { timeout: 60000 }); await p.evaluate(() => window.__remixRouter.navigate('/account')); await p.waitForTimeout(2500);
const steps = [];
for (const to of ['/account/downloads', '/account', '/faq']) {
  await p.evaluate((x) => window.__remixRouter.navigate(x), to); await p.waitForTimeout(2000);
  steps.push(await p.evaluate(() => ({ path: location.pathname, title: document.title, ann: document.querySelector('[data-route-announcer]')?.textContent ?? null, annCodes: [...(document.querySelector('[data-route-announcer]')?.textContent ?? '')].slice(-1).map((c) => c.charCodeAt(0)) })));
}
fs.writeFileSync(out, JSON.stringify(steps, null, 1)); console.log(JSON.stringify(steps)); await b.close();
