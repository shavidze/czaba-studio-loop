const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-88/pw/';
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

const geomFn = () => {
  const dlg = document.querySelector('#arrangement-export-title').closest('[role=dialog]');
  const panel = dlg.querySelector('button[aria-label="Close"]').parentElement;
  const footer = dlg.querySelector('[data-testid=arrangement-export-footer]');
  const pr = panel.getBoundingClientRect();
  const vTop = pr.top + panel.clientTop, vBot = pr.top + panel.clientTop + panel.clientHeight;
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const hitEl = document.elementFromPoint(cx, cy); return { top: Math.round(r.top), bottom: Math.round(r.bottom), inBox: r.top >= vTop - 0.5 && r.bottom <= vBot + 0.5, hit: !!hitEl && (hitEl === e || e.contains(hitEl)) }; };
  const btns = [...footer.querySelectorAll('button')];
  const status = footer.querySelector('[role=status],[role=alert]');
  return { scrollTop: panel.scrollTop, clientHeight: panel.clientHeight, scrollHeight: panel.scrollHeight, panel: { top: Math.round(pr.top), bottom: Math.round(pr.bottom), vTop: Math.round(vTop), vBot: Math.round(vBot) }, footer: R(footer),
    label: R(dlg.querySelector('[data-testid=arrangement-export-progress-label]')), labelText: dlg.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null,
    bar: R(dlg.querySelector('[data-testid=arrangement-export-progress]')), status: R(status), statusText: status?.textContent ?? null, overload: R(dlg.querySelector('[data-testid=arrangement-export-overload]')),
    close: R(btns[0]), action: R(btns[1]), actionText: btns[1]?.textContent ?? null };
};
async function sampler(p) {
  await p.evaluate((g) => { const geom = eval('(' + g + ')'); window.__s = []; window.__keys = new Set(); const dlg = document.querySelector('#arrangement-export-title').closest('[role=dialog]');
    const snap = () => { const s = geom(); const k = (s.labelText || '').replace(/ · \d+%$/, '') + '|' + (s.actionText || ''); const bad = [s.label, s.bar, s.action, s.status].some((x) => x && !(x.inBox && x.hit)); if (!window.__keys.has(k) || bad) { window.__keys.add(k); window.__s.push(s); } };
    window.__mo = new MutationObserver(snap); window.__mo.observe(dlg, { attributes: true, childList: true, characterData: true, subtree: true }); snap(); }, geomFn.toString());
}
const stopSampler = (p) => p.evaluate(() => { window.__mo.disconnect(); return window.__s; });
async function tabCycle(p) {
  const n = await p.evaluate(() => document.querySelector('#arrangement-export-title').closest('[role=dialog]').querySelectorAll('button:not(:disabled),input:not(:disabled)').length);
  const out = [];
  for (let i = 0; i < n + 1; i++) {
    await p.keyboard.press('Tab'); await sleep(120);
    out.push(await p.evaluate(() => { const a = document.activeElement; const dlg = document.querySelector('#arrangement-export-title').closest('[role=dialog]'); const panel = dlg.querySelector('button[aria-label="Close"]').parentElement; const footer = dlg.querySelector('[data-testid=arrangement-export-footer]'); const r = a.getBoundingClientRect(); const ft = footer.getBoundingClientRect().top; const inFooter = footer.contains(a);
      return { el: a.getAttribute('aria-label') || a.dataset.testid || a.textContent.trim().slice(0, 20) || a.tagName, inDialog: dlg.contains(a), inFooter, bottom: Math.round(r.bottom), footerTop: Math.round(ft), covered: !inFooter && r.bottom > ft + 0.5, scrollTop: panel.scrollTop }; }));
  }
  return out;
}
async function runViewport(browser, vp) {
  const r = { vp, errors: [] };
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true, storageState: STATE });
  const page = await ctx.newPage();
  page.on('console', (m) => { const t = m.text(); if ((m.type() === 'error' || m.type() === 'warning') && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed/.test(t)) r.errors.push(`[${m.type()}] ${t.slice(0, 200)}`); });
  page.on('pageerror', (e) => r.errors.push('pageerror ' + String(e).slice(0, 200)));
  await fiveMinuteProject(page, 2);
  r.idle5M = await page.evaluate(geomFn); await page.screenshot({ path: OUT + `idle-5m-${vp.width}.png` });
  for (const fmt of ['wav', 'mp3']) {
    if (fmt === 'mp3') { await page.getByTestId('arrangement-export-format-mp3').check(); await sleep(200); }
    const before = await page.evaluate(geomFn);
    await sampler(page);
    const btn = fmt === 'wav' ? 'WAV-ის ექსპორტი' : 'MP3-ის ექსპორტი';
    let shot = false;
    const dl = page.waitForEvent('download', { timeout: 300000 });
    await page.getByRole('button', { name: btn }).click();
    await sleep(300); if (!shot) { await page.screenshot({ path: OUT + `render-${fmt}-${vp.width}.png` }); shot = true; }
    const d = await dl; await sleep(600);
    const samples = await stopSampler(page);
    r[fmt] = { scrollBefore: before.scrollTop, file: d.suggestedFilename(), samples, allVisible: samples.filter((s) => s.labelText).every((s) => [s.label, s.bar, s.action, s.status].every((x) => x && x.inBox && x.hit)), scrollTops: [...new Set(samples.map((s) => s.scrollTop))], phases: [...new Set(samples.map((s) => (s.labelText || '').replace(/ · \d+%$/, '')))] };
    await d.delete();
  }
  await ctx.close();
  const ctx2 = await browser.newContext({ viewport: vp, acceptDownloads: true, storageState: STATE });
  const p2 = await ctx2.newPage();
  await fiveMinuteProject(p2, 0);
  r.idle101 = await p2.evaluate(geomFn);
  r.tabIdle = await tabCycle(p2);
  const dl2 = p2.waitForEvent('download', { timeout: 300000 });
  await p2.getByRole('button', { name: 'WAV-ის ექსპორტი' }).click();
  const d2 = await dl2; await sleep(800); await d2.delete();
  r.done101 = await p2.evaluate(geomFn); await p2.screenshot({ path: OUT + `done-101-${vp.width}.png` });
  r.tabDone = await tabCycle(p2);
  r.tabCoveredCount = [...r.tabIdle, ...r.tabDone].filter((t) => t.covered || !t.inDialog).length;
  await ctx2.close();
  return r;
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  const warm = await browser.newContext(); const wp = await warm.newPage(); await wp.goto(URL, { waitUntil: 'networkidle' }); await sleep(2000); await warm.storageState({ path: STATE }); await warm.close();
  const res = [];
  for (const vp of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }]) res.push(await runViewport(browser, vp));
  fs.writeFileSync(OUT + 'smoke-output.json', JSON.stringify(res, null, 1));
  for (const r of res) console.log(JSON.stringify({ vp: r.vp.width, idle5M: { st: r.idle5M.scrollTop, ch: r.idle5M.clientHeight, sh: r.idle5M.scrollHeight, close: r.idle5M.close, action: r.idle5M.action }, wav: { allVisible: r.wav.allVisible, phases: r.wav.phases, scrollBefore: r.wav.scrollBefore, scrollTops: r.wav.scrollTops, n: r.wav.samples.length }, mp3: { allVisible: r.mp3.allVisible, phases: r.mp3.phases, scrollBefore: r.mp3.scrollBefore, scrollTops: r.mp3.scrollTops, n: r.mp3.samples.length }, done101: { status: r.done101.status, overload: r.done101.overload, st: r.done101.scrollTop }, tabCovered: r.tabCoveredCount, errors: r.errors }));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
