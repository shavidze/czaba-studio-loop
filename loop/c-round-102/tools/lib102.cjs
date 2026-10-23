// C round 102 helper (copy of lib101) (copy of lib100) (copy of lib99) (copy of lib98) (copy of lib90) library (standalone Playwright, installed Chromium, fresh incognito contexts, no credentials)
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-102/out';
const SHOTS = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-102/shots';
const BASE = 'http://127.0.0.1:5173';
const URL = BASE + '/studio-lab';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|firebase|Download the React DevTools/i;
const MSG = {
  cancel: 'ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.',
  cancelEnc: 'ექსპორტი გაუქმდა — ფაილი არ შეიქმნა. MP3 encoder შემდეგ MP3 ექსპორტზე თავიდან ჩაიტვირთება.',
};
const blur = (p) => p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());

async function launch() { return chromium.launch({ headless: true }); }

async function newCtx(browser, vp, tag) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  const page = await ctx.newPage();
  const S = { tag, vp: `${vp.width}x${vp.height}`, errors: [], noise: 0, downloads: [], unpkg: [], forbidden: [], authHeaders: [], workers: [], thirdParty: [] };
  page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' || m.type() === 'warning') { if (NOISE.test(t)) S.noise++; else S.errors.push(`[${m.type()}] ${t.slice(0, 300)}`); } });
  page.on('pageerror', (e) => S.errors.push('pageerror ' + String(e).slice(0, 300)));
  page.on('download', async (d) => {
    const name = d.suggestedFilename(); const rec = { t: Date.now(), name, file: null };
    S.downloads.push(rec);
    try { const f = path.join(OUT, `${tag}-${S.downloads.length}-${name}`); await d.saveAs(f); rec.file = f; rec.size = fs.statSync(f).size; } catch (e) { rec.err = String(e); }
  });
  page.on('request', (q) => {
    const u = q.url(); const h = q.headers();
    if (/unpkg\.com/.test(u)) S.unpkg.push({ t: Date.now(), f: u.split('/').pop() });
    if (/studio-token|recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev/.test(u)) S.forbidden.push(u);
    if (h.authorization) S.authHeaders.push(u);
    if (!/^(http:\/\/127\.0\.0\.1:5173|data:|blob:)/.test(u) && !/unpkg\.com/.test(u)) S.thirdParty.push(u.slice(0, 120));
  });
  page.on('worker', (w) => { const rec = { url: w.url().split('/').pop().slice(0, 60), t: Date.now(), closed: null }; S.workers.push(rec); w.on('close', () => { rec.closed = Date.now(); }); });
  page.S = S;
  return { ctx, page, S };
}

async function decline(p) { await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); }); await sleep(200); }
let PPS = 40, RL = 512;
async function geo(p) { const g = await p.evaluate(() => ({ rl: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left, z: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent })); RL = g.rl; PPS = +/([\d.]+)/.exec(g.z)[1]; }
const tx = (t) => Math.round(RL + t * PPS);
const laneBox = (p, t) => p.evaluate((t) => { const l = document.querySelector(`[data-track-id="${t}"]`); const b = l.querySelector('[data-grid-seconds]') || l; const r = b.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, t);
async function setSnapOff(p) { await blur(p); const s = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]')?.dataset.snap); if (s === 'on') { await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(150); } await blur(p); }
async function libDrop(p, src, lane, t) {
  const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const ob = await o.boundingBox(); const lb = await laneBox(p, lane);
  const ox = Math.round(ob.x + ob.width / 2), oy = Math.round(ob.y + ob.height / 2);
  await p.mouse.move(ox, oy); await p.mouse.down(); await p.mouse.move(ox + 12, oy, { steps: 3 });
  await p.mouse.move(tx(t), Math.round(lb.y + lb.h / 2), { steps: 14 }); await sleep(300); await p.mouse.up(); await sleep(900);
}
// 5M: three demo sources, then the music clip Ctrl+D x dups (2 -> 05:04.406)
async function setup(p, dups = 2) {
  await p.goto(URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(4000);
  await decline(p); await geo(p); await setSnapOff(p);
  await libDrop(p, 'demo-middle-east', 'music', 0.35); await libDrop(p, 'demo-stem-pulse', 'stems', 2); await libDrop(p, 'demo-soft-impact', 'sfx', 4); await blur(p);
  const el = await p.$$eval('[data-clip-id]', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { lane: e.closest('[data-track-id]').getAttribute('data-track-id'), x: r.x, y: r.y, w: r.width, h: r.height }; }));
  const music = el.find((c) => c.lane === 'music');
  await p.mouse.click(Math.round(music.x + Math.min(music.w / 2, 20)), Math.round(music.y + music.h - 8)); await sleep(150);
  for (let i = 0; i < dups; i++) { await p.keyboard.press('Control+d'); await sleep(600); }
  await blur(p);
  return openDlg(p);
}
async function openDlg(p) {
  await blur(p);
  await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title'); await sleep(400);
  await installClickProbe(p);
  return p.evaluate(() => document.querySelector('[data-testid=arrangement-export-scope-project]').closest('label').innerText);
}
// in-page: label at the moment of the real pointerdown on Cancel + MutationObserver label/status timeline
async function installClickProbe(p) {
  await p.evaluate(() => {
    window.__c90 = { clicks: [], tl: [], t0: performance.now() };
    const lab = () => document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null;
    document.addEventListener('pointerdown', (e) => { const c = e.target.closest && e.target.closest('[data-testid=arrangement-export-cancel]'); if (c) window.__c90.clicks.push({ t: Math.round(performance.now() - window.__c90.t0), label: lab(), trusted: e.isTrusted }); }, true);
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && document.activeElement?.dataset?.testid === 'arrangement-export-cancel') window.__c90.clicks.push({ t: Math.round(performance.now() - window.__c90.t0), label: lab(), key: 'Enter', trusted: e.isTrusted }); }, true);
    const snap = () => { const f = document.querySelector('[data-testid=arrangement-export-footer]'); const s = f?.querySelector('[role=status],[role=alert]'); const r = { t: Math.round(performance.now() - window.__c90.t0), label: lab(), status: s?.textContent ?? null, cancel: !!document.querySelector('[data-testid=arrangement-export-cancel]') }; const l = window.__c90.tl.at(-1); if (!l || l.label !== r.label || l.status !== r.status || l.cancel !== r.cancel) window.__c90.tl.push(r); };
    const mo = new MutationObserver(snap); mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['value', 'disabled'] }); snap();
  });
}
const footerProbe = () => {
  const d = document.querySelector('#arrangement-export-title')?.closest('[role=dialog]');
  const f = document.querySelector('[data-testid=arrangement-export-footer]');
  const a = document.activeElement;
  const s = f?.querySelector('[role=status]'); const al = d?.querySelector('[role=alert]');
  const btns = f ? [...f.querySelectorAll('button')] : [];
  const close = btns.find((b) => b.textContent.trim() === 'დახურვა');
  return {
    open: !!d,
    label: document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null,
    hasProgress: !!document.querySelector('[data-testid=arrangement-export-progress]'),
    status: s?.textContent ?? null, statusClass: s?.className ?? null, alert: al?.textContent ?? null,
    cancel: !!document.querySelector('[data-testid=arrangement-export-cancel]'),
    closeDisabled: close ? close.disabled : null,
    buttons: btns.map((b) => `${b.textContent.trim()}${b.disabled ? '(disabled)' : ''}`),
    active: a ? (a.getAttribute('aria-label') || a.dataset.testid || a.textContent.trim().slice(0, 24) || a.tagName) : null,
    activeInDialog: !!(d && d.contains(a)),
  };
};
const probe = (p) => p.evaluate(footerProbe);
const label = (p) => p.evaluate(() => document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null);
const phaseOf = (l) => !l ? null : /^რენდერი · /.test(l) ? 'render' : /^WAV-ის ჩაწერა · /.test(l) ? 'wav' : l === 'MP3 encoder-ის ჩატვირთვა…' ? 'load' : /^MP3-ის შექმნა · /.test(l) ? 'mp3' : 'UNKNOWN:' + l;
async function selectFormat(p, f) { await p.click(`[data-testid=arrangement-export-format-${f}]`); await sleep(200); }
async function exportBtnBox(p) {
  return p.evaluate(() => { const b = [...document.querySelectorAll('[data-testid=arrangement-export-footer] button')].find((x) => /ექსპორტი$/.test(x.textContent.trim())); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: b.textContent.trim(), disabled: b.disabled }; });
}
// click Export (real mouse), wait until the label matches phase (and pct < maxPct), then real-mouse click Cancel
async function exportAndCancel(p, phase, { timeout = 240000, maxPct = 100, minPct = 0, gate = null } = {}) {
  const S = p.S; const dl0 = S.downloads.length; const un0 = S.unpkg.length;
  const eb = await exportBtnBox(p);
  await p.mouse.click(eb.x, eb.y);
  const t0 = Date.now(); let l = null; let seen = [];
  // wait for the Cancel button and its box
  let cb = null;
  while (Date.now() - t0 < timeout) {
    l = await label(p);
    if (l && seen.at(-1) !== l) seen.push(l);
    const ph = phaseOf(l); const pct = l && /(\d+)%$/.exec(l) ? +/(\d+)%$/.exec(l)[1] : null;
    if (ph === phase && (pct === null || (pct < maxPct && pct >= minPct)) && (!gate || gate())) {
      cb = cb || await p.evaluate(() => { const c = document.querySelector('[data-testid=arrangement-export-cancel]'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      if (cb) break;
    }
    const pr = await probe(p); if (!pr.cancel && pr.status && !/^რენდერი და|იტვირთება/.test(pr.status) && Date.now() - t0 > 300) break;
    await sleep(5);
  }
  if (!cb) { const pr = await probe(p); return { valid: false, reason: 'phase not seen before end', seen, after: pr }; }
  const before = await probe(p);
  const c0 = Date.now();
  await p.mouse.click(cb.x, cb.y);
  let after = await probe(p);
  while (Date.now() - c0 < 2000 && !/გაუქმდა/.test(after.status || '')) { await sleep(10); after = await probe(p); }
  const ms = Date.now() - c0;
  const clicks = await p.evaluate(() => window.__c90.clicks.slice());
  const lastClick = clicks.at(-1) || null;
  const valid = !!lastClick && phaseOf(lastClick.label) === phase && (() => { const m = /(\d+)%$/.exec(lastClick.label || ''); return !m || +m[1] < maxPct; })();
  await sleep(15000);
  const final = await probe(p);
  const downloadsIn15s = S.downloads.slice(dl0).map((d) => d.name);
  return { valid, phase, labelBeforeClick: before.label, clickProbe: lastClick, msToCancelled: ms, after, final, downloadsIn15s, unpkgDuring: S.unpkg.slice(un0).map((x) => x.f), seen };
}
// full export to completion, return status + file
async function exportFull(p, { timeout = 300000 } = {}) {
  const S = p.S; const dl0 = S.downloads.length; const un0 = S.unpkg.length;
  const eb = await exportBtnBox(p); await p.mouse.click(eb.x, eb.y);
  const t0 = Date.now(); let pr;
  await sleep(300);
  while (Date.now() - t0 < timeout) { pr = await probe(p); if (!pr.cancel && pr.status && !/^რენდერი და|იტვირთება/.test(pr.status)) break; await sleep(100); }
  await sleep(2500);
  pr = await probe(p);
  return { ms: Date.now() - t0, final: pr, files: S.downloads.slice(dl0), unpkgDuring: S.unpkg.slice(un0).map((x) => x.f), exportText: eb.text };
}
function wavInfo(file) {
  const W = require('./wav.cjs'); const buf = fs.readFileSync(file); const w = W.parse(buf);
  const st = W.stats(w);
  return { riff: w.riff, wave: buf.toString('ascii', 8, 12), tag: w.fmt.tag, ch: w.fmt.ch, sr: w.fmt.sr, bits: w.fmt.bits, frames: w.frames, seconds: w.seconds, ...st };
}
// decode an mp3 in a page via Web Audio
async function mp3Decode(p, file) {
  const b64 = fs.readFileSync(file).toString('base64');
  return p.evaluate(async (b64) => { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); const ac = new OfflineAudioContext(2, 48000, 48000); const a = await ac.decodeAudioData(u.buffer); let peak = 0; const d = a.getChannelData(0); for (let i = 0; i < d.length; i += 7) peak = Math.max(peak, Math.abs(d[i])); return { sr: a.sampleRate, ch: a.numberOfChannels, dur: +a.duration.toFixed(4), peak: +peak.toFixed(4) }; }, b64);
}
function save(name, obj) { fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj, null, 1)); }
module.exports = { launch, newCtx, setup, openDlg, installClickProbe, probe, label, phaseOf, selectFormat, exportBtnBox, exportAndCancel, exportFull, wavInfo, mp3Decode, save, sleep, blur, MSG, URL, BASE, OUT, SHOTS, footerProbe };
