const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-93/smoke';
const STATE = '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json';
const BASE = 'http://127.0.0.1:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|net::ERR|localhost:5199|firebase|React DevTools/i;
async function ax(p, cdp, testid) {
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-testid="${testid}"]` });
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
  const n = nodes[0];
  return { role: n.role?.value, name: n.name?.value, description: n.description?.value ?? null };
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  const out = { errors: [], noise: 0, requests: [], auth: 0 };
  try {
    const warm = await browser.newContext({ storageState: STATE });
    const wp = await warm.newPage(); await wp.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 120000 }); await sleep(3000); await warm.close();
    const ctx = await browser.newContext({ storageState: STATE, viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') { if (NOISE.test(m.text())) out.noise++; else out.errors.push(m.text().slice(0, 300)); } });
    p.on('pageerror', (e) => out.errors.push('pageerror ' + String(e).slice(0, 300)));
    p.on('request', (q) => { const u = q.url(); if (q.headers().authorization) out.auth++; if (/studio-token|r2\.|workers\.dev|\/api\/download|recording-|unpkg/.test(u)) out.requests.push(u); });
    await p.goto(BASE + '/studio-lab', { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => /მზადაა|ვერ ჩაიტვირთა/.test(document.querySelector('[data-testid=arrangement-status]')?.textContent ?? ''), null, { timeout: 120000 });
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
    const opt = p.locator('[role=option][data-source-id="demo-soft-impact"]');
    const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await opt.getAttribute('draggable')) !== 'true') await sleep(200);
    await opt.click(); await p.keyboard.press('Enter'); await sleep(800);
    out.clips = await p.locator('[data-clip-id]').count();
    await p.getByRole('button', { name: 'Master Mute' }).click();
    await p.evaluate(() => document.activeElement?.blur?.());
    await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title');
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('DOM.enable'); await cdp.send('Accessibility.enable');
    out.axMp3 = await ax(p, cdp, 'arrangement-export-format-mp3');
    out.axWav = await ax(p, cdp, 'arrangement-export-format-wav');
    out.axBoth = await ax(p, cdp, 'arrangement-export-format-both');
    out.axRange = await ax(p, cdp, 'arrangement-export-scope-range');
    out.leakCount = await p.getByRole('radio', { name: /LAME|ან ორივე|graph|ვიდეოს რენდერი|მონიშნე დროის/ }).count();
    out.muteWav = await p.getByTestId('arrangement-export-master-mute').textContent();
    await p.getByText('MP3 · 48 kHz · stereo', { exact: true }).click();
    out.mp3Checked = await p.getByTestId('arrangement-export-format-mp3').isChecked();
    out.muteMp3 = await p.getByTestId('arrangement-export-master-mute').textContent();
    out.exportButton = await p.locator('[data-testid=arrangement-export-footer] button').last().textContent();
    await p.screenshot({ path: DIR + '/a93-1440-mute-mp3.png' });
    await ctx.close();
  } catch (e) { out.fatal = String(e); }
  await browser.close();
  fs.writeFileSync(DIR + '/smoke.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
