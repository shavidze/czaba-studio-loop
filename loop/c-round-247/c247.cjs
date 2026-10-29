// C round 247: independent browser rows for B-R245-UNDO-GROUP-FOCUS (+ smoke/auth/budget/marker reg).
// usage: node c247.cjs <base> <outDir> [rowRegex] [onlyVp 1440|1280]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = process.argv[2];
const outDir = process.argv[3];
const filter = process.argv[4] ? new RegExp(process.argv[4]) : null;
const onlyVp = process.argv[5] || null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c247.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
R.base = BASE; R.started = new Date().toISOString();
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHA = '1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94';
const NAME = '[data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]';
const MUSIC = 'Music — set as the active track';

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
const act = (page) => page.evaluate(() => {
  const a = document.activeElement;
  if (!a || a === document.body) return { el: 'BODY' };
  const cs = getComputedStyle(a);
  const row = a.closest('[data-track-id], [data-group-id]');
  return { el: a.getAttribute('data-testid') || a.tagName, label: (a.getAttribute('aria-label') || a.getAttribute('title') || a.textContent || '').trim().slice(0, 90), row: row ? (row.dataset.groupId ? 'group:' + row.dataset.groupId : 'track:' + row.dataset.trackId) : null, focusVisible: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth };
});
const status = (page) => page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent);
const titles = (page) => page.evaluate(() => { const t = (p) => [...document.querySelectorAll('button')].find((b) => (b.getAttribute('title') || '').startsWith(p)); return { undo: t('Undo')?.getAttribute('title'), redo: t('Redo')?.getAttribute('title'), undoDisabled: t('Undo')?.disabled, redoDisabled: t('Redo')?.disabled }; });
const groups = (page) => page.getByTestId('arrangement-group-row').count();
const groupNames = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-group-name]')].map((b) => b.textContent.trim()));
const rowOrder = (page) => page.evaluate(() => [...document.querySelectorAll('[data-track-id], [data-group-id]')].filter((e) => e.matches('[data-testid=arrangement-group-row]') || e.querySelector('[data-testid=arrangement-track-header]')).map((e) => (e.dataset.groupId ? 'G:' + e.dataset.groupId : 'T:' + e.dataset.trackId)));
const selection = (page) => page.evaluate(() => ({ groups: [...document.querySelectorAll('[data-group-selected=true]')].length, tracks: [...document.querySelectorAll('[data-track-selected=true], [aria-pressed=true][aria-label*="set as the active track"]')].length }));
const ringOk = (a) => a.focusVisible === true && a.outlineStyle !== 'none' && parseFloat(a.outlineWidth) >= 1;
const isMusic = (a) => typeof a.label === 'string' && a.label.startsWith(MUSIC);
async function shot(page, name, k) { await page.screenshot({ path: path.join(outDir, `${name}-${k}.png`) }); }
async function group(page, a, b) {
  const names = page.locator(NAME);
  await names.nth(a).click(); await sleep(300);
  await names.nth(b).click({ modifiers: ['Control'] }); await sleep(300);
  await page.keyboard.press('Control+g'); await sleep(600);
}
async function nest(page) {
  await group(page, 1, 2);
  await page.locator(NAME).nth(3).click({ modifiers: ['Control'] }); await sleep(300);
  await page.keyboard.press('Control+g'); await sleep(600);
}
async function snap(page) { return { focus: await act(page), groups: await groups(page), names: await groupNames(page), order: await rowOrder(page), status: await status(page), titles: await titles(page) }; }
async function step(page, key, wait = 700) { if (key.startsWith('BUTTON:')) { await page.getByRole('button', { name: new RegExp('^' + key.slice(7)) }).click(); } else { await page.keyboard.press(key); } await sleep(wait); return snap(page); }

// Origins: a focused control inside the group row; one history step removes the row.
const ORIGIN = (prep, key, expect = isMusic) => async (page, k, name) => {
  const r = {}; r.prep = await prep(page, r); r.before = await snap(page);
  r.after = await step(page, key); await shot(page, name, k);
  r.pass = r.before.groups > r.after.groups && r.before.focus.row && r.before.focus.row.startsWith('group:') && expect(r.after.focus);
  return r;
};

const ROWS = {
  groupUndo: ORIGIN(async (p) => { await group(p, 1, 2); await p.getByTestId('arrangement-group-name').focus(); }, 'Control+z'),
  groupUndoNatural: ORIGIN(async (p) => { await group(p, 1, 2); }, 'Control+z'),
  groupUndoTab: async (page, k, name) => {
    const r = {}; await group(page, 1, 2);
    r.afterGroup = await act(page);
    await page.keyboard.press('Shift+Tab'); await sleep(300); r.afterShiftTab = await act(page);
    await page.keyboard.press('Tab'); await sleep(300); r.before = await snap(page);
    r.after = await step(page, 'Control+z'); await shot(page, name, k);
    r.pass = r.afterShiftTab.el === 'arrangement-group-fold' && r.before.focus.el === 'arrangement-group-name' && r.before.focus.focusVisible === true && isMusic(r.after.focus) && ringOk(r.after.focus) && r.after.groups === 0 && /Undo: Group Tracks/.test(r.after.status || '');
    return r;
  },
  ungroupRedo: ORIGIN(async (p, r) => { await group(p, 1, 2); await p.getByTestId('arrangement-group-name').focus(); await p.keyboard.press('Control+Shift+g'); await sleep(600); await p.keyboard.press('Control+z'); await sleep(600); r.restored = await snap(p); await p.getByTestId('arrangement-group-name').focus(); }, 'Control+Shift+z'),
  groupUndoY: ORIGIN(async (p, r) => { await group(p, 1, 2); await p.getByTestId('arrangement-group-name').focus(); await p.keyboard.press('Control+Shift+g'); await sleep(600); await p.keyboard.press('Control+z'); await sleep(600); r.restored = await snap(p); await p.getByTestId('arrangement-group-name').focus(); }, 'Control+y'),
  foldFocusUndo: ORIGIN(async (p) => { await group(p, 1, 2); await p.getByTestId('arrangement-group-fold').focus(); }, 'Control+z'),
  muteFocusUndo: ORIGIN(async (p) => { await group(p, 1, 2); await p.getByTestId('arrangement-group-mute').focus(); }, 'Control+z'),
  soloFocusUndo: ORIGIN(async (p) => { await group(p, 1, 2); await p.getByTestId('arrangement-group-solo').focus(); }, 'Control+z'),
  volumeFocusUndo: ORIGIN(async (p) => { await group(p, 1, 2); await p.getByTestId('arrangement-group-volume').focus(); }, 'Control+z'),
  collapsedUndo: ORIGIN(async (p, r) => { await group(p, 1, 2); await p.getByTestId('arrangement-group-fold').click(); await sleep(700); r.collapsedOrder = await rowOrder(p); await p.getByTestId('arrangement-group-name').focus(); }, 'Control+z'),
  nestedOuterUndo: ORIGIN(async (p, r) => { await nest(p); r.nested = await rowOrder(p); await p.getByTestId('arrangement-group-name').first().focus(); }, 'Control+z', (a) => a.el === 'arrangement-group-name'),
  // C's own extras
  bottomGroupUndo: ORIGIN(async (p) => { await group(p, 2, 3); await p.getByTestId('arrangement-group-name').focus(); }, 'Control+z', (a) => (a.label || '').startsWith('Stems — set as the active track')),
  playingUndo: async (page, k, name) => {
    const r = {}; await addBtn(page, 'demo-stem-pulse'); await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus();
    await page.keyboard.press('Space'); await sleep(900);
    r.playingBefore = await page.evaluate(() => Math.max(0, ...window.__rms()));
    r.before = await snap(page);
    r.after = await step(page, 'Control+z', 600);
    r.rmsAfter = await page.evaluate(() => Math.max(0, ...window.__rms()));
    await page.keyboard.press('Escape'); await shot(page, name, k);
    r.pass = r.before.focus.el === 'arrangement-group-name' && isMusic(r.after.focus) && r.after.groups === 0;
    return r;
  },
  // precedence
  ungroupPrecedence: async (page, k, name) => {
    const r = {}; await nest(page);
    await page.getByTestId('arrangement-group-name').nth(1).click({ modifiers: ['Control'] }); await sleep(300);
    r.sel = await selection(page);
    await page.getByTestId('arrangement-group-name').nth(1).focus();
    r.before = await snap(page); r.after = await step(page, 'Control+Shift+g'); await shot(page, name, k);
    r.pass = r.after.groups === 0 && isMusic(r.after.focus);
    return r;
  },
  plainUngroup: async (page, k, name) => {
    const r = {}; await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus();
    r.before = await snap(page); r.after = await step(page, 'Control+Shift+g'); await shot(page, name, k);
    r.pass = r.after.groups === 0 && isMusic(r.after.focus) && /Ungroup/.test(r.after.titles.undo || '');
    return r;
  },
  // no steal
  noStealVideo: ORIGIN(async (p) => { await group(p, 1, 2); await p.locator(NAME).nth(0).focus(); }, 'Control+z', (a) => (a.label || '').startsWith('Video — set as the active track')),
  noStealMember: ORIGIN(async (p) => { await group(p, 1, 2); await p.locator(NAME).nth(2).focus(); }, 'Control+z', (a) => (a.label || '').startsWith('Stems — set as the active track')),
  noStealBody: async (page, k, name) => {
    const r = {}; await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus(); await sleep(150);
    await page.getByTestId('arrangement-status').click(); await sleep(200);
    r.before = await snap(page); r.after = await step(page, 'Control+z'); await shot(page, name, k);
    r.pass = r.before.focus.el === 'BODY' && r.after.focus.el === 'BODY' && r.after.groups === 0;
    return r;
  },
  // keep
  nestedInnerUndo: async (page, k, name) => {
    const r = {}; await nest(page); await page.getByTestId('arrangement-group-name').nth(1).focus();
    r.before = await snap(page); r.after = await step(page, 'Control+z'); await shot(page, name, k);
    r.pass = r.after.groups === 1 && r.after.focus.el === 'arrangement-group-name' && r.after.focus.row === r.before.focus.row;
    return r;
  },
  ungroupUndo: async (page, k, name) => {
    const r = {}; await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus(); await page.keyboard.press('Control+Shift+g'); await sleep(600);
    r.before = await snap(page); r.after = await step(page, 'Control+z'); await shot(page, name, k);
    r.pass = isMusic(r.before.focus) && r.after.groups === 1 && isMusic(r.after.focus);
    return r;
  },
  groupRedoMember: async (page, k, name) => {
    const r = {}; await group(page, 1, 2); await page.keyboard.press('Control+z'); await sleep(600); await page.locator(NAME).nth(1).focus();
    r.before = await snap(page); r.after = await step(page, 'Control+Shift+z'); await shot(page, name, k);
    r.pass = r.after.groups === 1 && isMusic(r.after.focus);
    return r;
  },
  renameUndo: async (page, k, name) => {
    const r = {}; await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus();
    await page.keyboard.press('F2'); await sleep(300); await page.keyboard.press('Control+a'); await page.keyboard.type('Bus'); await page.keyboard.press('Enter'); await sleep(500);
    r.renamed = await snap(page);
    r.after = await step(page, 'Control+z'); await shot(page, name, k);
    r.pass = r.renamed.names[0] === 'Bus' && r.after.names[0] === 'Group 1' && r.after.focus.el === 'arrangement-group-name' && /Undo: Rename Group/.test(r.after.status || '');
    return r;
  },
  undoButton: async (page, k, name) => {
    const r = {}; await group(page, 1, 2); r.before = await snap(page);
    r.afterUndo = await step(page, 'BUTTON:Undo'); r.afterRedo = await step(page, 'BUTTON:Redo'); await shot(page, name, k);
    r.pass = r.afterUndo.groups === 0 && /^Redo: Group Tracks/.test(r.afterUndo.focus.label) && r.afterRedo.groups === 1;
    return r;
  },
  volumeRemoval: async (page, k, name) => {
    const r = {}; await group(page, 1, 2); const v = page.getByTestId('arrangement-group-volume'); await v.focus();
    r.start = { ...(await snap(page)), value: await v.inputValue(), title: await v.getAttribute('title') };
    await page.keyboard.press('ArrowDown'); await sleep(200); await page.keyboard.press('ArrowDown'); await sleep(500);
    r.steps = { ...(await snap(page)), value: await v.inputValue(), title: await v.getAttribute('title') };
    r.z1 = await step(page, 'Control+z'); r.z1.value = await v.inputValue().catch(() => null);
    r.z2 = await step(page, 'Control+z'); r.z2.value = await v.inputValue().catch(() => null);
    r.z3 = await step(page, 'Control+z'); await shot(page, name, k);
    r.pass = r.z1.groups === 1 && /Undo: Volume/.test(r.z1.status) && r.z1.focus.el === 'arrangement-group-volume' && r.z2.groups === 1 && /Undo: Volume/.test(r.z2.status) && r.z2.focus.el === 'arrangement-group-volume' && r.z3.groups === 0 && /Undo: Group Tracks/.test(r.z3.status) && isMusic(r.z3.focus);
    return r;
  },
  collapseReg: async (page, k, name) => {
    const r = {}; await group(page, 1, 2); await page.getByTestId('arrangement-group-name').click(); await sleep(300);
    await page.locator(NAME).nth(1).focus(); r.member = await act(page);
    await page.keyboard.press('KeyU'); await sleep(700); r.afterU = await snap(page); await shot(page, name, k);
    r.pass = r.afterU.focus.el === 'arrangement-group-name' && ringOk(r.afterU.focus) && r.afterU.order.length === 3;
    return r;
  },
  groupFocusFollow: async (page, k, name) => {
    const r = {}; await group(page, 1, 2); r.afterG = await snap(page);
    r.afterUngroup = await step(page, 'Control+Shift+g'); await shot(page, name, k);
    r.pass = r.afterG.focus.el === 'arrangement-group-name' && isMusic(r.afterUngroup.focus);
    return r;
  },
  markerReg: async (page, k, name) => {
    const r = {}; await page.evaluate(() => document.body.focus()); await page.keyboard.press('KeyM'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400);
    r.flags = await page.getByTestId('arrangement-marker').count();
    r.after = await step(page, 'Control+z'); r.flagsAfter = await page.getByTestId('arrangement-marker').count(); await shot(page, name, k);
    r.pass = r.flags === 1 && r.flagsAfter === 0 && r.after.focus.el === 'arrangement-marker-add' && ringOk(r.after.focus);
    return r;
  },
  // §6 neighbours
  focusStability: async (page, k, name) => {
    const r = {}; await addBtn(page, 'demo-stem-pulse'); await group(page, 1, 2);
    await page.keyboard.press('Shift+Tab'); await sleep(200); await page.keyboard.press('Tab'); await sleep(200);
    r.start = await act(page);
    await page.keyboard.press('Space'); r.samples = [];
    for (let i = 0; i < 6; i += 1) { await sleep(250); r.samples.push((await act(page)).el); }
    r.rms = await page.evaluate(() => Math.max(0, ...window.__rms()));
    await page.keyboard.press('Space'); await sleep(300);
    r.afterPlay = await act(page);
    const v = page.getByTestId('arrangement-group-volume'); const b = await v.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
    r.dragSamples = [];
    for (let i = 1; i <= 6; i += 1) { await page.mouse.move(b.x + b.width / 2 - i * 6, b.y + b.height / 2); await sleep(80); r.dragSamples.push((await act(page)).el); }
    await page.mouse.up(); await sleep(400);
    r.afterDrag = await snap(page); r.volTitle = await v.getAttribute('title'); await shot(page, name, k);
    r.pass = r.start.el === 'arrangement-group-name' && r.samples.every((s) => s === 'arrangement-group-name') && r.afterPlay.el === 'arrangement-group-name' && r.dragSamples.every((s) => s === 'arrangement-group-volume') && r.afterDrag.focus.el === 'arrangement-group-volume' && r.afterDrag.groups === 1;
    return r;
  },
  gridMenuInfo: async (page, k, name) => {
    const r = {}; await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus(); r.f0 = await act(page);
    const pts = await page.evaluate(() => { const pts = []; for (const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')) { const rr = body.getBoundingClientRect(); for (const fx of [0.9, 0.75, 0.6, 0.45, 0.3]) { const x = rr.left + rr.width * fx; const y = rr.top + rr.height / 2; if (x <= 0 || x >= innerWidth - 20 || y <= 0 || y >= innerHeight - 10) continue; if (document.elementFromPoint(x, y) === body) { pts.push({ x, y }); break; } } } return pts; });
    r.pts = pts.length;
    if (pts.length) { await page.mouse.click(pts[pts.length - 1].x, pts[pts.length - 1].y, { button: 'right' }); await sleep(500); }
    r.menuOpen = await page.locator('[role=menu]').count(); r.inMenu = await act(page);
    r.before = await snap(page); r.after = await step(page, 'Control+z'); r.menuAfter = await page.locator('[role=menu]').count();
    await page.keyboard.press('Escape'); await sleep(400); r.afterEsc = await snap(page); await shot(page, name, k);
    r.pass = 'info'; return r;
  },
  nestedCollapseInfo: async (page, k, name) => {
    const r = {}; await nest(page);
    await page.getByTestId('arrangement-group-name').first().click(); await sleep(300);
    await page.getByTestId('arrangement-group-name').nth(1).focus(); r.f0 = await act(page);
    r.afterU = await step(page, 'KeyU'); await shot(page, name, k);
    r.pass = 'info'; return r;
  },
};

const STANDALONE = {
  async budget(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp);
    const inv = () => page.evaluate(() => {
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
    const empty = await inv(); await shot(page, 'budget-empty', k);
    await addBtn(page, 'demo-stem-pulse');
    const demo = await inv(); await shot(page, 'budget-demo', k);
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
    await shot(page, 'auth-guard', k);
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
  const vps = [{ width: 1440, height: 900 }, { width: 1280, height: 720 }].filter((v) => !onlyVp || String(v.width) === onlyVp);
  for (const vp of vps) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of Object.entries(ROWS)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now(); const key = `${name}@${k}`;
      try { const { ctx, page, errors } = await open(browser, vp); R.rows[key] = await fn(page, k, name); R.rows[key].errors = errors; await ctx.close(); } catch (e) { R.rows[key] = { error: String(e).slice(0, 800) }; }
      R.rows[key].ms = Date.now() - t0; save();
      const x = R.rows[key];
      console.log(key, 'pass=', x.pass, x.error ? x.error.slice(0, 200) : '', x.after ? `${x.after.focus.el}|${x.after.focus.label}|g${x.after.groups}|${x.after.status}` : '', 'err', (x.errors || []).length);
    }
    for (const [name, fn] of Object.entries(STANDALONE)) {
      if (!filter || !filter.test(name)) continue;
      const t0 = Date.now(); const key = `${name}@${k}`;
      try { R.rows[key] = await fn(browser, vp, k); } catch (e) { R.rows[key] = { error: String(e).slice(0, 800) }; }
      R.rows[key].ms = Date.now() - t0; save();
      console.log(key, 'pass=', R.rows[key].pass, R.rows[key].error ? R.rows[key].error.slice(0, 200) : '');
    }
  }
  await browser.close(); R.finished = new Date().toISOString(); save();
})();
