const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-89/pw/';
const STATE = '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json';
const URL = 'http://127.0.0.1:5173/studio-lab';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let PPS = 40, RL = 512;
const blur = (p) => p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
const st = (p) => p.evaluate(() => ({ snap: document.querySelector('[data-testid=arrangement-grid-control]')?.dataset.snap }));
async function geo(p) { const g = await p.evaluate(() => ({ rl: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left, z: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent })); RL = g.rl; PPS = +/([\d.]+)/.exec(g.z)[1]; }
const tx = (t) => Math.round(RL + t * PPS);
const laneBox = (p, t) => p.evaluate((t) => { const l = document.querySelector(`[data-track-id="${t}"]`); const b = l.querySelector('[data-grid-seconds]') || l; const r = b.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, t);
async function setSnapOff(p) { await blur(p); if ((await st(p)).snap === 'on') { await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(150); } await blur(p); }
async function libDrop(p, src, lane, t) {
  const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const ob = await o.boundingBox(); const lb = await laneBox(p, lane);
  const ox = Math.round(ob.x + ob.width / 2), oy = Math.round(ob.y + ob.height / 2);
  await p.mouse.move(ox, oy); await p.mouse.down(); await p.mouse.move(ox + 12, oy, { steps: 3 });
  await p.mouse.move(tx(t), Math.round(lb.y + lb.h / 2), { steps: 14 }); await sleep(300); await p.mouse.up(); await sleep(900);
}
async function decline(p) { await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); }); await sleep(200); }
async function fiveMinuteProject(p, DUPS = 2) {
  await p.goto(URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(4000);
  await decline(p); await geo(p); await setSnapOff(p);
  await libDrop(p, 'demo-middle-east', 'music', 0.35); await libDrop(p, 'demo-stem-pulse', 'stems', 2); await libDrop(p, 'demo-soft-impact', 'sfx', 4); await blur(p);
  const el = await p.$$eval('[data-clip-id]', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { lane: e.closest('[data-track-id]').getAttribute('data-track-id'), x: r.x, y: r.y, w: r.width, h: r.height }; }));
  const music = el.find((c) => c.lane === 'music');
  await p.mouse.click(Math.round(music.x + Math.min(music.w / 2, 20)), Math.round(music.y + music.h - 8)); await sleep(150);
  for (let i = 0; i < DUPS; i++) { await p.keyboard.press('Control+d'); await sleep(600); }
  await blur(p);
  await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title'); await sleep(400);
  return p.evaluate(() => document.querySelector('[data-testid=arrangement-export-scope-project]').closest('label').innerText);
}
const probe = () => {
  const a = document.activeElement;
  const dlg = document.querySelector('#arrangement-export-title')?.closest('[role=dialog]');
  const busy = !!dlg && [...dlg.querySelectorAll('button')].some((b) => b.textContent.trim() === 'მიმდინარეობს…');
  const el = a ? a.getAttribute('aria-label') || a.dataset.testid || (a.tagName === 'BODY' ? 'BODY' : a.textContent.trim().slice(0, 24)) || a.tagName : 'null';
  return { el, inDialog: !!dlg && !!a && dlg.contains(a), busy };
};
async function trapRun(browser, vp, fmt) {
  const r = { vp: vp.width, fmt, errors: [], presses: [] };
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true, storageState: STATE });
  const page = await ctx.newPage();
  page.on('console', (m) => { const t = m.text(); if ((m.type() === 'error' || m.type() === 'warning') && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed/.test(t)) r.errors.push(`[${m.type()}] ${t.slice(0, 200)}`); });
  page.on('pageerror', (e) => r.errors.push('pageerror ' + String(e).slice(0, 200)));
  await fiveMinuteProject(page, 2);
  if (fmt === 'mp3') { await page.getByTestId('arrangement-export-format-mp3').focus(); await page.keyboard.press('ArrowDown'); await sleep(0); }
  const fmtNow = await page.evaluate(() => ['wav', 'mp3', 'both'].find((f) => document.querySelector(`[data-testid=arrangement-export-format-${f}]`).checked));
  if (fmtNow !== fmt) { await page.getByTestId(`arrangement-export-format-${fmt}`).check(); }
  r.checked = await page.evaluate(() => ['wav', 'mp3', 'both'].find((f) => document.querySelector(`[data-testid=arrangement-export-format-${f}]`).checked));
  const btn = fmt === 'wav' ? 'WAV-ის ექსპორტი' : 'MP3-ის ექსპორტი';
  const dl = page.waitForEvent('download', { timeout: 300000 });
  await page.getByRole('button', { name: btn }).focus();
  const masterBefore = await page.evaluate(() => location.href);
  await page.keyboard.press('Enter');
  const t0 = Date.now(); while (Date.now() - t0 < 10000 && !(await page.evaluate(probe)).busy) await sleep(20);
  r.afterStart = await page.evaluate(probe);
  const keys = ['Tab', 'Tab', 'Tab', 'Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab'];
  for (const k of keys) {
    const before = await page.evaluate(probe);
    await page.keyboard.press(k);
    const after = await page.evaluate(probe);
    r.presses.push({ k, from: before.el, to: after.el, inDialog: after.inDialog, valid: before.busy && after.busy });
  }
  const d = await dl; r.file = d.suggestedFilename(); await d.delete();
  r.urlSame = (await page.evaluate(() => location.href)) === masterBefore;
  r.escapes = r.presses.filter((p) => !p.inDialog).length;
  r.validPresses = r.presses.filter((p) => p.valid).length;
  await ctx.close();
  return r;
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  const warm = await browser.newContext(); const wp = await warm.newPage(); await wp.goto(URL, { waitUntil: 'networkidle' }); await sleep(2000); await warm.storageState({ path: STATE }); await warm.close();
  const res = [];
  for (const vp of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }]) for (const fmt of ['wav', 'mp3']) { const r = await trapRun(browser, vp, fmt); res.push(r); console.log(JSON.stringify(r)); }
  fs.writeFileSync(OUT + 'smoke-output.json', JSON.stringify(res, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
