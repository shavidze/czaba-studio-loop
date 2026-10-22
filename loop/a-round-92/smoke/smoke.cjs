const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-92/smoke';
const STATE = '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json';
const BASE = 'http://127.0.0.1:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|net::ERR|localhost:5199|firebase|React DevTools/i;
(async () => {
  const browser = await chromium.launch({ headless: true });
  const out = { errors: [], noise: 0, requests: [], auth: 0 };
  try {
    const warm = await browser.newContext({ storageState: STATE });
    const wp = await warm.newPage(); await wp.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 120000 }); await sleep(3000); await warm.close();
    const ctx = await browser.newContext({ storageState: STATE, viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    const p = await ctx.newPage();
    p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') { if (NOISE.test(m.text())) out.noise++; else out.errors.push(m.text().slice(0, 300)); } });
    p.on('pageerror', (e) => out.errors.push('pageerror ' + String(e).slice(0, 300)));
    p.on('request', (q) => { const u = q.url(); if (q.headers().authorization) out.auth++; if (/studio-token|r2\.|workers\.dev|\/api\/download|recording-|\.mp3|\.wav/.test(u)) out.requests.push(u); });
    await p.goto(BASE + '/studio-lab', { waitUntil: 'domcontentloaded' });
    out.loadingSeen = await p.evaluate(() => document.querySelector('[data-testid=arrangement-status]')?.textContent?.trim() ?? null);
    await p.waitForFunction(() => /მზადაა|ვერ ჩაიტვირთა/.test(document.querySelector('[data-testid=arrangement-status]')?.textContent ?? ''), null, { timeout: 120000 });
    Object.assign(out, await p.evaluate(() => ({
      title: document.title,
      h1: document.querySelector('header h1')?.textContent,
      badge: document.querySelector('header span.border-accent')?.textContent?.trim(),
      status: document.querySelector('[data-testid=arrangement-status]')?.textContent?.trim(),
    })));
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
    await p.screenshot({ path: DIR + '/a92-1440-ready.png' });
    const opt = p.locator('[role=option][data-source-id="demo-soft-impact"]');
    const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await opt.getAttribute('draggable')) !== 'true') await sleep(200);
    await opt.click(); await p.keyboard.press('Enter'); await sleep(800);
    out.clips = await p.locator('[data-clip-id]').count();
    await p.evaluate(() => document.activeElement?.blur?.());
    await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title');
    const dl = p.waitForEvent('download', { timeout: 120000 });
    await p.getByRole('button', { name: 'WAV-ის ექსპორტი', exact: true }).click();
    const d = await dl; out.download = d.suggestedFilename(); const f = DIR + '/' + out.download; await d.saveAs(f);
    const b = fs.readFileSync(f); out.wav = { riff: b.toString('ascii', 0, 4), wave: b.toString('ascii', 8, 12), ch: b.readUInt16LE(22), rate: b.readUInt32LE(24), bits: b.readUInt16LE(34), size: b.length };
    await sleep(500);
    out.done = await p.evaluate(() => document.querySelector('[data-testid=arrangement-export-footer] [role=status]')?.textContent ?? null);
    await p.screenshot({ path: DIR + '/a92-1440-export-done.png' });
    await ctx.close();
  } catch (e) { out.fatal = String(e); }
  await browser.close();
  fs.writeFileSync(DIR + '/smoke.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
