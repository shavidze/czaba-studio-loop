// usage: BASE=http://127.0.0.1:5173 node nav-501.mjs <outdir> <tag>   (mock-api on :5199)
// Journey (L54) at 1440x900: home -> Subscribe (POST held) -> header/footer "Free Samples" -> /free-downloads
// -> keyboard Download (Enter) -> form -> Send Download Link (POST held) -> /hire-us (direct load: no Hire Us link is rendered on /free-downloads at HEAD) -> Send Message (POST held).
// A held POST is never answered: after the busy read the page is reloaded (the request is cancelled), so no action error page appears.
// Each step: screenshot + JSON. One retry per step on a thrown navigation/evaluate error (C round 500 forB).
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const tag = process.argv[3] || 'head';
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const EXPECTED_ENV_ERRORS = /Failed to load cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL_CONNECTION_FAILED|net::ERR_FAILED|Failed to load resource/;
const steps = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); } catch {} });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' && !EXPECTED_ENV_ERRORS.test(m.text())) errors.push(m.text().slice(0, 160)); });
let release = () => {};
await page.route('**/*', async (r) => {
  if (r.request().method() === 'POST' && new URL(r.request().url()).origin === new URL(BASE).origin) {
    await new Promise((res) => { release = res; });
    try { await r.abort(); } catch {}
  } else await r.continue();
});
async function step(name, fn) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const data = await fn();
      await page.screenshot({ path: `${out}/${tag}-journey-${steps.length + 1}-${name}.png` });
      steps.push({ step: name, attempt, path: new URL(page.url()).pathname, ...data });
      return;
    } catch (e) {
      if (attempt === 2) steps.push({ step: name, attempt, error: String(e).slice(0, 200) });
    }
  }
}
const btn = (name) => page.getByRole('button', { name, exact: true });
const state = (loc) => loc.first().evaluate((n) => ({ text: n.textContent.trim(), disabled: n.disabled, type: n.getAttribute('type'), expanded: n.getAttribute('aria-expanded'), opacity: getComputedStyle(n).opacity }));
await step('home-subscribe-busy', async () => {
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 45000 }); await page.waitForTimeout(2500);
  const field = page.locator('input[name="email"][placeholder="Enter your email"]').first();
  await field.scrollIntoViewIfNeeded(); await field.fill('journey@example.invalid');
  await btn('Subscribe').click(); await page.waitForTimeout(600);
  const busy = await state(btn('Subscribing...'));
  await page.goto(page.url(), { waitUntil: 'load', timeout: 45000 }); release(); await page.waitForTimeout(1500);
  return { busy };
});
await step('nav-free-samples', async () => {
  await page.getByRole('link', { name: 'Free Samples' }).first().click();
  await page.waitForURL('**/free-downloads', { timeout: 15000 }); await page.waitForTimeout(1500);
  return { downloads: await btn('Download').count() };
});
await step('download-keyboard-open', async () => {
  const first = btn('Download').first(); await first.scrollIntoViewIfNeeded();
  await first.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  return { first: await state(first), sendLink: await btn('Send Download Link').count(), active: await page.evaluate(() => document.activeElement?.textContent?.trim() ?? null) };
});
await step('send-link-busy', async () => {
  await page.locator('input[name="email"][placeholder="Enter your email"]').first().fill('journey@example.invalid');
  await btn('Send Download Link').click(); await page.waitForTimeout(600);
  const busy = await state(btn('Sending...'));
  const downloads = await btn('Download').evaluateAll((ns) => ns.map((n) => n.disabled));
  await page.goto(page.url(), { waitUntil: 'load', timeout: 45000 }); release(); await page.waitForTimeout(1500);
  return { busy, downloadsDisabled: downloads };
});
await step('nav-hire-us', async () => {
  await page.goto(BASE + '/hire-us', { waitUntil: 'load', timeout: 45000 }); await page.waitForTimeout(1500);
  return { send: await btn('Send Message').count() };
});
await step('hire-us-busy', async () => {
  await page.fill('#name', 'Journey'); await page.fill('#email', 'journey@example.invalid'); await page.fill('#message', 'Journey message');
  await btn('Send Message').click(); await page.waitForTimeout(600);
  const busy = await state(btn('Sending...'));
  await page.goto(page.url(), { waitUntil: 'load', timeout: 45000 }); release(); await page.waitForTimeout(1500);
  return { busy };
});
await browser.close();
fs.writeFileSync(`${out}/${tag}-journey.json`, JSON.stringify({ steps, errors }, null, 1));
for (const s of steps) console.log(JSON.stringify(s));
console.log('errors', JSON.stringify(errors));
