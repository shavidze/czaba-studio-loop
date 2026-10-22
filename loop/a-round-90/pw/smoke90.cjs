const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-90/pw/';
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
const footerProbe = () => {
  const f = document.querySelector('[data-testid=arrangement-export-footer]');
  const a = document.activeElement;
  const s = f?.querySelector('[role=status]');
  const al = f?.querySelector('[role=alert]');
  const btns = f ? [...f.querySelectorAll('button')] : [];
  const close = btns.find((b) => b.textContent.trim() === 'დახურვა');
  return {
    label: document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null,
    hasProgress: !!document.querySelector('[data-testid=arrangement-export-progress]'),
    status: s?.textContent ?? null, statusClass: s?.className ?? null, alert: al?.textContent ?? null,
    cancel: !!document.querySelector('[data-testid=arrangement-export-cancel]'),
    closeDisabled: close ? close.disabled : null,
    buttons: btns.map((b) => `${b.textContent.trim()}${b.disabled ? '(disabled)' : ''}`),
    active: a ? (a.getAttribute('aria-label') || a.dataset.testid || a.textContent.trim().slice(0, 24) || a.tagName) : null,
  };
};
async function cancelIn(page, phaseRe, timeout) {
  const t0 = Date.now();
  let label = null;
  while (Date.now() - t0 < timeout) {
    label = await page.evaluate(() => document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null);
    if (label && phaseRe.test(label)) break;
    await sleep(25);
  }
  const before = await page.evaluate(footerProbe);
  const c0 = Date.now();
  await page.getByTestId('arrangement-export-cancel').click();
  let after = await page.evaluate(footerProbe);
  while (Date.now() - c0 < 2000 && !/გაუქმდა/.test(after.status || '')) { await sleep(10); after = await page.evaluate(footerProbe); }
  return { labelAtClick: before.label, before, after, ms: Date.now() - c0 };
}
async function run(browser, vp) {
  const r = { vp: vp.width, errors: [], downloads: [], unpkg: [] };
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true, storageState: STATE });
  const page = await ctx.newPage();
  page.on('console', (m) => { const t = m.text(); if ((m.type() === 'error' || m.type() === 'warning') && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed/.test(t)) r.errors.push(`[${m.type()}] ${t.slice(0, 200)}`); });
  page.on('pageerror', (e) => r.errors.push('pageerror ' + String(e).slice(0, 200)));
  page.on('download', async (d) => { r.downloads.push({ t: Date.now(), name: d.suggestedFilename() }); await d.delete().catch(() => {}); });
  page.on('request', (q) => { if (/unpkg\.com/.test(q.url())) r.unpkg.push(q.url().split('/').pop()); });
  r.scope = await fiveMinuteProject(page, 2);
  await page.getByRole('button', { name: 'WAV-ის ექსპორტი' }).click();
  r.wav = await cancelIn(page, /^რენდერი · (\d|[1-9]\d)%$/, 60000);
  const n0 = r.downloads.length; await sleep(15000); r.wav.downloadsIn15s = r.downloads.length - n0;
  r.wav.final = await page.evaluate(footerProbe);
  await page.getByTestId('arrangement-export-format-mp3').check();
  await page.getByRole('button', { name: 'MP3-ის ექსპორტი' }).click();
  r.mp3 = await cancelIn(page, /^MP3-ის შექმნა · \d+%$/, 240000);
  const n1 = r.downloads.length; await sleep(15000); r.mp3.downloadsIn15s = r.downloads.length - n1;
  r.mp3.final = await page.evaluate(footerProbe);
  await page.screenshot({ path: OUT + `cancel-mp3-${vp.width}.png` });
  await ctx.close();
  return r;
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  const warm = await browser.newContext(); const wp = await warm.newPage(); await wp.goto(URL, { waitUntil: 'networkidle' }); await sleep(2000); await warm.storageState({ path: STATE }); await warm.close();
  const res = [];
  for (const vp of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }]) { const r = await run(browser, vp); res.push(r); console.log(JSON.stringify(r)); }
  fs.writeFileSync(OUT + 'smoke-output.json', JSON.stringify(res, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
