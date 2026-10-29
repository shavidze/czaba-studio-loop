// C round 246: independent browser rows for B-R243-UNDO-MARKER-FOCUS (+ smoke/auth/budget).
// usage: node c246.cjs <base> <outDir> [rowRegex]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = process.argv[2];
const outDir = process.argv[3];
const filter = process.argv[4] ? new RegExp(process.argv[4]) : null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c246.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
R.base = BASE; R.started = new Date().toISOString();
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHA = '1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94';

const INIT = () => {
  window.__taps = [];
  const orig = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (target, ...rest) {
    const res = orig.call(this, target, ...rest);
    try {
      if (target instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext)) {
        const a = this.context.createAnalyser(); a.fftSize = 2048; orig.call(this, a); window.__taps.push(a);
      }
    } catch (e) {}
    return res;
  };
  window.__rms = () => window.__taps.map((a) => { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return Math.sqrt(s / d.length); });
};

const wavInfo = (buf) => {
  const ch = buf.readUInt16LE(22); const rate = buf.readUInt32LE(24); const ba = buf.readUInt16LE(32); const bits = buf.readUInt16LE(34);
  let off = 12; let dataOff = -1; let dataSize = 0;
  while (off < buf.length - 8) { const id = buf.toString('ascii', off, off + 4); const sz = buf.readUInt32LE(off + 4); if (id === 'data') { dataOff = off + 8; dataSize = sz; break; } off += 8 + sz; }
  const frames = dataSize / ba; const bps = bits / 8;
  let s = 0; let n = 0; let peak = 0; let nan = 0;
  for (let f = 0; f < frames; f += 1) for (let c = 0; c < ch; c += 1) {
    const o = dataOff + f * ba + c * bps; let x;
    if (bits === 24) { let v = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (v & 0x800000) v -= 0x1000000; x = v / 8388608; } else if (bits === 16) { x = buf.readInt16LE(o) / 32768; } else { x = buf.readFloatLE(o); }
    if (!Number.isFinite(x)) nan += 1;
    s += x * x; n += 1; const a = Math.abs(x); if (a > peak) peak = a;
  }
  return { bytes: buf.length, rate, bits, ch, frames, seconds: frames / rate, rmsDb: +(10 * Math.log10(s / n || 1e-20)).toFixed(2), peak: +peak.toFixed(4), nan, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
};

async function open(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); return s && s.textContent.startsWith('Demo collection ready'); }, undefined, { timeout: 120000 });
  await sleep(600);
  return { ctx, page, errors };
}
const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
async function addBtn(page, id) {
  await page.locator(`[data-source-id="${id}"]`).first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(800);
  await blur(page);
}
const act = (page) => page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return { el: 'BODY' }; const cs = getComputedStyle(a); return { el: a.getAttribute('data-testid') || a.tagName, markerId: a.getAttribute('data-marker-id'), time: a.getAttribute('data-marker-time'), label: (a.getAttribute('aria-label') || a.getAttribute('title') || a.textContent || '').trim().slice(0, 90), focusVisible: a.matches(':focus-visible'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor }; });
const flags = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => ({ id: m.getAttribute('data-marker-id'), time: m.getAttribute('data-marker-time'), label: m.getAttribute('aria-label') })));
const status = (page) => page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent);
const titles = (page) => page.evaluate(() => { const t = (p) => [...document.querySelectorAll('button')].find((b) => (b.getAttribute('title') || '').startsWith(p))?.getAttribute('title'); return { undo: t('Undo'), redo: t('Redo') }; });
async function addFlag(page) { await page.evaluate(() => document.body.focus()); await page.keyboard.press('KeyM'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400); }
async function nudge(page, n) { for (let i = 0; i < n; i += 1) { await page.keyboard.press('ArrowRight'); await sleep(60); } await sleep(300); }
const focusFlagAt = (page, time) => page.locator(`[data-testid="arrangement-marker"][data-marker-time="${time}"]`).focus();
const ringOk = (a) => a.focusVisible === true && a.outlineStyle !== 'none' && parseFloat(a.outlineWidth) >= 1;
async function snapshot(page, name, key_) { await page.screenshot({ path: path.join(outDir, `${name}-${key_}.png`) }); }
async function emptyLanePoints(page) {
  return page.evaluate(() => { const pts = []; for (const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')) { const r = body.getBoundingClientRect(); for (const fx of [0.9, 0.75, 0.6, 0.45, 0.3]) { const x = r.left + r.width * fx; const y = r.top + r.height / 2; if (x <= 0 || x >= innerWidth - 20 || y <= 0 || y >= innerHeight - 10) continue; if (document.elementFromPoint(x, y) === body) { pts.push({ x, y }); break; } } } return pts; });
}
const inventory = (page) => page.evaluate(() => {
  const rows = [];
  const vis = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false; } const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  for (const el of document.body.querySelectorAll('*')) {
    if (['SCRIPT', 'STYLE', 'svg', 'path', 'OPTION'].includes(el.tagName)) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
    if (!own || el.closest('.sr-only') || !vis(el)) continue;
    if (el.closest('[data-testid="arrangement-timeline-scroller"]')) continue;
    if (el.closest('[data-testid="arrangement-status"]')) continue;
    const region = el.closest('[data-testid]') ? el.closest('[data-testid]').getAttribute('data-testid') : el.tagName;
    rows.push(`${region}|${own.slice(0, 140)}`);
  }
  return rows;
});

const ROWS = {
  async addUndo(page, k) {
    const r = {}; await addFlag(page); r.before = await flags(page); r.focusBefore = await act(page);
    await page.keyboard.press('Control+z'); await sleep(500);
    r.after = await flags(page); r.focus = await act(page); r.status = await status(page); r.titles = await titles(page);
    r.pass = r.before.length === 1 && r.after.length === 0 && r.focus.el === 'arrangement-marker-add' && ringOk(r.focus);
    await snapshot(page, 'addUndo', k); return r;
  },
  async addUndoNeighbour(page, k) {
    const r = {}; await addFlag(page); await nudge(page, 1); await addFlag(page); r.before = await flags(page); r.focusBefore = await act(page);
    await page.keyboard.press('Control+z'); await sleep(500);
    r.after = await flags(page); r.focus = await act(page); r.status = await status(page);
    r.pass = r.after.length === 1 && r.focus.el === 'arrangement-marker' && r.focus.time === '0.100' && ringOk(r.focus);
    await snapshot(page, 'addUndoNeighbour', k); return r;
  },
  async addUndoPrevious(page, k) {
    // own case: A at 0, play ~1 s, pause, B at playhead (last in time), Ctrl+Z -> previous survivor A
    const r = {}; await addBtn(page, 'demo-stem-pulse'); await addFlag(page); await blur(page);
    await page.keyboard.press('Space'); await sleep(1100); await page.keyboard.press('Space'); await sleep(500);
    await addFlag(page); r.before = await flags(page); r.focusBefore = await act(page);
    await page.keyboard.press('Control+z'); await sleep(500);
    r.after = await flags(page); r.focus = await act(page); r.status = await status(page);
    r.pass = r.before.length === 2 && r.after.length === 1 && r.focus.el === 'arrangement-marker' && r.focus.time === '0.000' && ringOk(r.focus) && Number(r.before[1].time) > 0.5;
    await snapshot(page, 'addUndoPrevious', k); return r;
  },
  async addUndoMiddle(page, k) {
    // own case: flags at 0.5 and 1.0 exist; new flag at 0 (first in time) -> next survivor 0.5
    const r = {}; await addFlag(page); await nudge(page, 10); await blur(page);
    await addFlag(page); await nudge(page, 5); await blur(page);
    await addFlag(page); r.before = await flags(page); r.focusBefore = await act(page);
    await page.keyboard.press('Control+z'); await sleep(500);
    r.after = await flags(page); r.focus = await act(page); r.status = await status(page);
    r.pass = r.after.length === 2 && r.focus.el === 'arrangement-marker' && r.focus.time === '0.500' && ringOk(r.focus);
    await snapshot(page, 'addUndoMiddle', k); return r;
  },
  async deleteRedoZ(page, k) { return deleteRedo(page, k, 'Control+Shift+z', 'deleteRedoZ'); },
  async deleteRedoY(page, k) { return deleteRedo(page, k, 'Control+y', 'deleteRedoY'); },
  async noStealOtherFlag(page, k) {
    const r = {}; await addFlag(page); await nudge(page, 5); await blur(page); await addFlag(page);
    await focusFlagAt(page, '0.500'); await sleep(200); r.focusBefore = await act(page); r.before = await flags(page);
    await page.keyboard.press('Control+z'); await sleep(500);
    r.after = await flags(page); r.focus = await act(page);
    r.pass = r.before.length === 2 && r.after.length === 1 && r.focus.el === 'arrangement-marker' && r.focus.time === '0.500';
    await snapshot(page, 'noStealOtherFlag', k); return r;
  },
  async noStealOtherControl(page, k) {
    const r = {}; await addFlag(page); await nudge(page, 5); await blur(page); await addFlag(page);
    await page.evaluate(() => document.body.focus());
    // keyboard path: focus the flag, then Tab forward/backward to reach a non-flag control
    await focusFlagAt(page, '0.000'); await page.keyboard.press('Shift+Tab'); await sleep(200);
    r.focusBefore = await act(page); r.before = await flags(page);
    await page.keyboard.press('Control+z'); await sleep(500);
    r.after = await flags(page); r.focus = await act(page);
    r.pass = r.focusBefore.el !== 'arrangement-marker' && r.focusBefore.el !== 'BODY' && r.after.length === 1 && r.focus.el === r.focusBefore.el && r.focus.label === r.focusBefore.label;
    return r;
  },
  async noStealBody(page, k) {
    const r = {}; await addFlag(page);
    const box = await page.getByTestId('arrangement-status').boundingBox();
    await page.mouse.click(box.x + 4, box.y + box.height / 2); await sleep(300);
    r.focusBefore = await act(page); r.before = await flags(page);
    await page.keyboard.press('Control+z'); await sleep(500);
    r.after = await flags(page); r.focus = await act(page); r.status = await status(page);
    r.pass = r.focusBefore.el === 'BODY' && r.after.length === 0 && r.focus.el === 'BODY';
    return r;
  },
  async moveUndo(page, k) {
    const r = {}; await addFlag(page); await nudge(page, 1); r.before = await flags(page);
    await page.keyboard.press('Control+z'); await sleep(500);
    r.after = await flags(page); r.focus = await act(page); r.status = await status(page);
    r.pass = r.after.length === 1 && r.after[0].time === '0.000' && r.focus.el === 'arrangement-marker' && r.focus.markerId === r.after[0].id && ringOk(r.focus);
    return r;
  },
  async renameUndo(page, k) {
    const r = {}; await addFlag(page); r.created = await flags(page);
    await page.keyboard.press('F2'); await sleep(300); r.editor = await page.getByTestId('arrangement-marker-name-input').count();
    await page.keyboard.press('Control+a'); await page.keyboard.type('Hit'); await page.keyboard.press('Enter'); await sleep(400);
    r.renamed = await flags(page); r.focusRenamed = await act(page);
    await page.keyboard.press('Control+z'); await sleep(500);
    r.after = await flags(page); r.focus = await act(page); r.status = await status(page);
    r.pass = r.editor === 1 && /Hit/.test(r.renamed[0]?.label || '') && r.after.length === 1 && !/Hit/.test(r.after[0].label) && r.focus.el === 'arrangement-marker' && r.focus.markerId === r.created[0].id && ringOk(r.focus);
    return r;
  },
  async focusStability(page, k) {
    const r = {}; await addFlag(page); r.f0 = await act(page);
    await page.keyboard.press('Space'); await sleep(1500); r.playing = await act(page);
    await page.keyboard.press('Space'); await sleep(300);
    const b = await page.locator('[data-testid="arrangement-marker"]').first().boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 + 60, b.y + b.height / 2, { steps: 8 }); r.midDrag = await act(page);
    await page.mouse.up(); await sleep(400);
    r.afterDrag = await act(page); r.flags = await flags(page);
    r.pass = [r.playing, r.midDrag, r.afterDrag].every((a) => a.el === 'arrangement-marker' && a.markerId === r.f0.markerId);
    return r;
  },
  async cutTime(page, k) {
    const r = {};
    await addBtn(page, 'demo-stem-pulse');
    await addFlag(page); await nudge(page, 6); await blur(page);
    await addFlag(page); await nudge(page, 2); await blur(page);
    await addFlag(page); await blur(page);
    r.flags0 = await flags(page); if (process.env.DBG) console.log(JSON.stringify(r.flags0), await status(page));
    const geo = await page.evaluate(() => { const g = (t) => { const e = document.querySelector(`[data-testid="arrangement-marker"][data-marker-time="${t}"]`).getBoundingClientRect(); return e.left; }; const c = document.querySelector('[data-clip-kind="audio"]').getBoundingClientRect(); return { x0: g('0.000'), x3: g('6.000'), clip: { left: c.left, right: c.right, top: c.top, h: c.height } }; });
    const pps = (geo.x3 - geo.x0) / 6; const xt = (t) => geo.x0 + t * pps; const y = geo.clip.top + geo.clip.h * 0.65; r.geo = { ...geo, pps };
    const select = async (t0, t1) => { await page.keyboard.down('Alt'); await page.mouse.move(xt(t0), y); await page.mouse.down(); await page.mouse.move(xt(t1), y, { steps: 10 }); await page.mouse.up(); await page.keyboard.up('Alt'); await sleep(400); };
    await select(1, 3);
    await focusFlagAt(page, '2.000'); await sleep(200); r.focusBefore1 = await act(page);
    await page.keyboard.press('Control+Shift+x'); await sleep(600);
    r.flags1 = await flags(page); r.focus1 = await act(page); r.status1 = await status(page);
    await snapshot(page, 'cutTime-next', k);
    await page.keyboard.press('Control+z'); await sleep(600); r.flagsUndo = await flags(page); r.focusUndo = await act(page);
    await select(1, 7);
    await focusFlagAt(page, '2.000'); await sleep(200); r.focusBefore2 = await act(page);
    await page.keyboard.press('Control+Shift+x'); await sleep(600);
    r.flags2 = await flags(page); r.focus2 = await act(page); r.status2 = await status(page);
    await snapshot(page, 'cutTime-previous', k);
    r.pass1 = r.flags1.length === 2 && r.focus1.el === 'arrangement-marker' && r.focus1.time === '4.000' && ringOk(r.focus1) && /1 marker deleted/.test(r.status1 || '');
    r.pass2 = r.flags2.length === 1 && r.focus2.el === 'arrangement-marker' && r.focus2.time === '0.000' && ringOk(r.focus2) && /2 markers deleted/.test(r.status2 || '');
    r.pass = r.pass1 && r.pass2; return r;
  },
  async undoButton(page, k) {
    const r = {}; await addFlag(page);
    const undoBtn = page.locator('button[title^="Undo"]').first(); const redoBtn = page.locator('button[title^="Redo"]').first();
    await undoBtn.click(); await sleep(500);
    r.afterUndo = { flags: await flags(page), focus: await act(page), status: await status(page) };
    await redoBtn.click(); await sleep(500);
    r.afterRedo = { flags: await flags(page), focus: await act(page), status: await status(page) };
    const onHist = (a) => /^(Undo|Redo)/.test(a.label) && a.el === 'BUTTON';
    r.pass = r.afterUndo.flags.length === 0 && onHist(r.afterUndo.focus) && r.afterRedo.flags.length === 1 && r.afterRedo.focus.el !== 'BODY';
    await snapshot(page, 'undoButton', k); return r;
  },
  async menuDelete(page, k) {
    const r = {}; await addFlag(page); await nudge(page, 5); await blur(page); await addFlag(page); await blur(page);
    const f0 = page.locator('[data-testid="arrangement-marker"][data-marker-time="0.000"]');
    await f0.click({ button: 'right' }); await sleep(400);
    r.menu = await page.getByTestId('arrangement-marker-menu').count();
    r.items = await page.locator('[data-testid="arrangement-marker-menu"] [role="menuitem"]').allTextContents();
    await page.locator('[data-testid="arrangement-marker-menu"] [role="menuitem"]', { hasText: /Delete/ }).first().click(); await sleep(500);
    r.afterDelete = { flags: await flags(page), focus: await act(page), status: await status(page) };
    const f1 = page.locator('[data-testid="arrangement-marker"]').first();
    await f1.click({ button: 'right' }); await sleep(400); r.menu2 = await page.getByTestId('arrangement-marker-menu').count();
    await page.keyboard.press('Escape'); await sleep(400);
    r.afterEscape = { menu: await page.getByTestId('arrangement-marker-menu').count(), focus: await act(page) };
    r.pass = r.menu === 1 && r.afterDelete.flags.length === 1 && r.afterDelete.focus.el === 'arrangement-marker' && r.afterDelete.focus.time === '0.500' && r.afterEscape.menu === 0 && r.afterEscape.focus.el === 'arrangement-marker' && r.afterEscape.focus.time === '0.500';
    return r;
  },
  async editorReg(page, k) {
    const r = {};
    await page.evaluate(() => document.body.focus()); await page.keyboard.press('KeyM'); await sleep(500);
    r.editorOpen = await page.getByTestId('arrangement-marker-name-input').count();
    const pts = await emptyLanePoints(page);
    await page.mouse.click(pts[0].x, pts[0].y, { button: 'right' }); await sleep(400);
    r.gridMenu = await page.getByTestId('arrangement-grid-menu').count();
    await page.keyboard.press('Escape'); await sleep(450);
    r.flagsA = await flags(page); r.focusA = await act(page);
    r.passA = r.focusA.el === 'arrangement-marker' && r.flagsA.length === 1 && r.focusA.markerId === r.flagsA[0].id && r.focusA.focusVisible;
    r.pass = r.passA; return r;
  },
  async editorOrigin(page, k) {
    const r = {};
    // Escape inside the add editor restores the origin (origin = Next marker button), no marker at the playhead
    await page.getByTestId('arrangement-marker-next').focus(); await sleep(150); r.origin = await act(page);
    await page.keyboard.press('KeyM'); await sleep(450); r.editorOpen2 = await page.getByTestId('arrangement-marker-name-input').count();
    await page.keyboard.press('Escape'); await sleep(450);
    r.flagsB = await flags(page); r.focusB = await act(page);
    r.pass = r.editorOpen2 === 1 && r.flagsB.length === 0 && r.focusB.el === r.origin.el && r.focusB.label === r.origin.label && r.focusB.focusVisible; return r;
  },
  async groupUndo(page, k) {
    const r = {}; const sel = '[data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]';
    const names = page.locator(sel); await names.nth(1).click(); await sleep(300); await names.nth(2).click({ modifiers: ['Control'] }); await sleep(300);
    await page.keyboard.press('Control+g'); await sleep(600);
    await page.getByTestId('arrangement-group-name').focus(); await sleep(200); r.focusBefore = await act(page);
    r.groupsBefore = await page.getByTestId('arrangement-group-row').count();
    await page.keyboard.press('Control+z'); await sleep(600);
    r.groupsAfter = await page.getByTestId('arrangement-group-row').count(); r.focus = await act(page);
    return r;
  },
};
async function deleteRedo(page, k, key, name) {
  const r = {}; await addFlag(page); await page.keyboard.press('Delete'); await sleep(400);
  r.afterDelete = { flags: await flags(page), focus: await act(page) };
  await page.keyboard.press('Control+z'); await sleep(500);
  r.afterUndo = { flags: await flags(page), focus: await act(page) };
  await page.getByTestId('arrangement-marker').first().focus(); await sleep(200); r.focusBefore = await act(page);
  await page.keyboard.press(key); await sleep(500);
  r.after = await flags(page); r.focus = await act(page); r.status = await status(page);
  r.pass = r.afterUndo.flags.length === 1 && r.after.length === 0 && r.focus.el === 'arrangement-marker-add' && ringOk(r.focus) && /Redo: Delete Marker/.test(r.status || '');
  await snapshot(page, name, k); return r;
}

const STANDALONE = {
  async budget(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp);
    const empty = await inventory(page); await snapshot(page, 'budget-empty', k);
    await addBtn(page, 'demo-stem-pulse');
    const demo = await inventory(page); await snapshot(page, 'budget-demo', k);
    await ctx.close();
    const exp = k === '1440x900' ? [85, 101] : [69, 85];
    return { empty: empty.length, demo: demo.length, exp, pass: empty.length === exp[0] && demo.length === exp[1], errors };
  },
  async smoke(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = {}; r.clips = await page.locator('[data-clip-id]').count();
    const pos = () => page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')));
    r.pos0 = await pos();
    await page.keyboard.press('Space'); await sleep(900); r.posPlaying = await pos(); r.rms = await page.evaluate(() => Math.max(0, ...window.__rms()));
    await page.keyboard.press('Space'); await sleep(400); r.posPaused = await pos(); await sleep(500); r.posPaused2 = await pos();
    await page.getByRole('button', { name: 'Export', exact: true }).first().click();
    const dlg = page.getByRole('dialog'); await dlg.waitFor();
    const dlP = page.waitForEvent('download', { timeout: 90000 });
    await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const dl = await dlP; const file = path.join(outDir, `export-${k}.wav`); await dl.saveAs(file);
    r.wav = wavInfo(fs.readFileSync(file)); fs.unlinkSync(file);
    r.errors = errors;
    r.pass = r.posPlaying > r.pos0 && r.rms > 0.001 && r.posPaused === r.posPaused2 && r.wav.sha256 === SHA && r.wav.nan === 0 && errors.length === 0;
    await ctx.close(); return r;
  },
  async auth(browser, vp, k) {
    const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage(); const r = {};
    r.cookies0 = (await ctx.cookies()).length;
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' }); await page.waitForSelector('[data-testid="arrangement-ruler"]', { timeout: 120000 });
    r.labWorkspace = await page.locator('[data-testid="arrangement-timeline-scroller"]').count();
    r.labAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await sleep(3000);
    r.guard = await page.evaluate(() => ({ signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]') || !!document.querySelector('[data-testid=arrangement-timeline-scroller]') }));
    await snapshot(page, 'auth-guard', k);
    const api = `${BASE}/api/studio-token?product=middle-east&file=stem1.wav`;
    const a = await ctx.request.get(api, { failOnStatusCode: false }); r.tokenNoHeader = { status: a.status(), body: (await a.text()).slice(0, 160) };
    const b = await ctx.request.get(api, { failOnStatusCode: false, headers: { Authorization: 'Bearer fake.invalid.token' } }); r.tokenFake = { status: b.status(), body: (await b.text()).slice(0, 160) };
    r.pass = r.labWorkspace === 1 && r.labAuthUser === null && r.guard.signIn && r.guard.audioSrc === 0 && !r.guard.workspace && r.tokenNoHeader.status === 401 && r.tokenFake.status !== 200;
    await ctx.close(); return r;
  },
};

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  R.chromium = browser.version();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of Object.entries(ROWS)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now(); const key = `${name}@${k}`;
      try { const { ctx, page, errors } = await open(browser, vp); R.rows[key] = await fn(page, k); R.rows[key].errors = errors; await ctx.close(); } catch (e) { R.rows[key] = { error: String(e).slice(0, 800) }; }
      R.rows[key].ms = Date.now() - t0; save();
      console.log(key, 'pass=', R.rows[key].pass, R.rows[key].error ? R.rows[key].error.slice(0, 200) : '');
    }
    for (const [name, fn] of Object.entries(STANDALONE)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now(); const key = `${name}@${k}`;
      try { R.rows[key] = await fn(browser, vp, k); } catch (e) { R.rows[key] = { error: String(e).slice(0, 800) }; }
      R.rows[key].ms = Date.now() - t0; save();
      console.log(key, 'pass=', R.rows[key].pass, R.rows[key].error ? R.rows[key].error.slice(0, 200) : '');
    }
  }
  await browser.close(); R.finished = new Date().toISOString(); save();
})();
