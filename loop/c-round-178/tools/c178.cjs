// C round 178 — DUX-R-5b-3a browser rows: CC-TEXT, NO-BRASS-TEXT, CONTRAST-TEXT, REFUSAL, EXPORT-STATES, FUNC-SMOKE-TEXT, PX-NET.
// node c178.cjs <1440|1280> <attempt>   (DPR 2, fresh context, --disable-lcd-text). Built on the c177 helpers.
const X = require('./lib122.cjs'); const { L, sleep } = X;
const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const TAG = `c178-${W}-${ATT}`;
const SHD = path.join(L.SHOTS, TAG); fs.mkdirSync(SHD, { recursive: true });
const net = []; const res = { W, ATT, utc: new Date().toISOString(), sites: {}, func: {}, exp: {}, refusal: {}, shots: {}, errors: [] };
const save = () => L.save(L.OUT, `${TAG}.json`, { ...res, net });
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { if (!a || !b) return null; const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const rgb = (s) => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(s || ''); return m ? [+m[1], +m[2], +m[3]] : null; };
const brass = (c) => c[0] - c[2] >= 45;
const D = 2; let img = null; let r_thr = 0;
async function snap(p, name) { const f = path.join(SHD, `${name}.png`); const buf = await p.screenshot({ path: f }); img = decode(buf); res.shots[name] = path.relative(L.ROOT, f); return img; }
function scan(rect, excl = []) {
  const [x, y, w, h] = rect; let n = 0, b = 0; const samples = [];
  for (let Y = Math.ceil(y * D); Y < Math.floor((y + h) * D); Y++) for (let Xp = Math.ceil(x * D); Xp < Math.floor((x + w) * D); Xp++) {
    const cx = Xp / D, cy = Y / D; if (excl.some(([ex, ey, ew, eh]) => cx >= ex && cx < ex + ew && cy >= ey && cy < ey + eh)) continue;
    if (Xp < 0 || Y < 0 || Xp >= img.w || Y >= img.h) continue;
    const c = img.px(Xp, Y); n++; if (brass(c)) { b++; if (samples.length < 6) samples.push({ x: +cx.toFixed(1), y: +cy.toFixed(1), c }); }
  }
  return { rect: rect.map((v) => +v.toFixed(2)), n, brass: b, samples };
}
const inset = ([x, y, w, h], d) => [x + d, y + d, w - 2 * d, h - 2 * d];
// computed colour + composite backdrop (same stack method as c177)
const info = (el) => {
  if (!el) return null;
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const g = cv.getContext('2d');
  const mix = (layers) => { g.clearRect(0, 0, 1, 1); for (const l of layers) { g.fillStyle = '#000'; g.fillStyle = l; g.fillRect(0, 0, 1, 1); } return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const stackOf = (e) => { const layers = []; let n = e; while (n && n.nodeType === 1) { const b = getComputedStyle(n).backgroundColor; layers.unshift(b); const m = /rgba\([^)]*,\s*([\d.]+)\)$/.exec(b); const transparent = b === 'transparent' || (m && +m[1] === 0); if (!transparent && (!m || +m[1] === 1) && !/color\(|oklab|oklch/.test(b)) break; if (!transparent && /color\(|oklab|oklch/.test(b) && !/\/\s*0?\.\d|\/\s*0\b/.test(b)) break; n = n.parentElement; } if (!n) layers.unshift('rgb(0,0,0)'); return layers; };
  const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
  return { box: [r.x, r.y, r.width, r.height], bg: cs.backgroundColor, border: cs.borderTopColor, borderWidth: cs.borderTopWidth, color: cs.color, accentColor: cs.accentColor, cls: el.getAttribute('class'), disabled: !!el.disabled, text: (el.textContent || '').trim().slice(0, 80), hover: el.matches(':hover'), focus: el.matches(':focus-visible'), composite: mix(stackOf(el)), under: el.parentElement ? mix(stackOf(el.parentElement)) : null };
};
const infoLoc = async (p, loc) => { if (!(await loc.count())) return null; const h = await loc.first().elementHandle(); return p.evaluate(info, h); };
const phBox = (p) => p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-playhead]'); if (!e) return []; const r = e.getBoundingClientRect(); return [[r.x - 3, -10, r.width + 6, 5000]]; });
async function rest(p) { await L.blur(p); await p.mouse.move(2, 2); await sleep(450); }
const sig = (p) => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((e) => `${e.closest('[data-track-id]').dataset.trackId}:${e.dataset.clipKind}@${e.getAttribute('data-clip-start')}:${e.getBoundingClientRect().width.toFixed(1)}`).sort().join('|'));
// read a site: computed, contrast vs its backdrop, pixel scan of its inset box
async function site(p, name, loc, { hover = false, excl = [], noRest = false } = {}) {
  const r = { name };
  try {
    if (!noRest) await rest(p);
    let i = await infoLoc(p, loc); if (!i) { r.error = 'not found'; res.sites[name] = r; save(); return r; }
    if (hover) { r.restRead = { color: i.color, bg: i.bg, composite: i.composite }; await p.mouse.move(i.box[0] + i.box[2] / 2, i.box[1] + i.box[3] / 2, { steps: 3 }); await sleep(500); i = await infoLoc(p, loc); }
    r.read = i; r.textRgb = rgb(i.color); r.crText = cr(r.textRgb, i.composite);
    if (i.borderWidth && i.borderWidth !== '0px') { r.borderRgb = rgb(i.border); r.crBorder = cr(r.borderRgb, i.under || i.composite); }
    await snap(p, name); r.scan = scan(inset(i.box, 1), [...(await phBox(p)), ...excl]);
    if (hover) await p.mouse.move(2, 2);
  } catch (e) { r.error = String(e).slice(0, 300); }
  res.sites[name] = r; save(); return r;
}
const hdrPt = async (p, id) => { const b = await p.locator(`[data-clip-id="${id}"] > div`).first().boundingBox(); return { x: b.x + Math.min(30, b.width / 2), y: b.y + b.height / 2 }; };
const step = async (k, fn) => { try { res.func[k] = await fn(); } catch (e) { res.func[k] = { error: String(e).slice(0, 400) }; res.errors.push(`${k}: ${String(e).slice(0, 200)}`); } save(); };

(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-lcd-text'] });
  try {
    const o = await L.openStudio(b, X.VPS[W], TAG, net, { deviceScaleFactor: 2 }); const p = o.page; res.fonts = o.log.fontsReady && o.log.fontsReady.ok;
    res.anon = await p.evaluate(() => ({ auth: localStorage.getItem('auth_user'), cookie: document.cookie }));
    res.anonCookies = (await o.ctx.cookies()).length;
    // header: badge (by text) and exit link
    const badge = p.locator('header span', { hasText: /^Demo collection — no sign-in required$/ });
    res.badgeCount = await badge.count();
    await site(p, 'badge', badge);
    const exit = p.locator('[data-testid=arrangement-exit]'); res.exitHref = await exit.getAttribute('href');
    await site(p, 'exit-rest', exit); await site(p, 'exit-hover', exit, { hover: true });
    // EXPORT (a): empty arrangement
    await step('exportEmpty', async () => {
      await L.blur(p); await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title', { timeout: 10000 }); await sleep(600);
      const note = p.locator('[role=dialog] p[role=note]', { hasText: 'the project is empty' });
      const r = await site(p, 'export-empty-note', note, { noRest: true });
      const exportBtnDisabled = await p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /^Export/ }).first().isDisabled().catch(() => null);
      await p.keyboard.press('Escape'); await sleep(500);
      return { found: !r.error, exportBtnDisabled, dialogClosed: !(await p.locator('#arrangement-export-title').count()) };
    });
    // S1 setup
    res.snap0 = await L.setSnapOff(p);
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
    res.adds = [await L.addAt(p, 'demo-middle-east', 'music', 1), await L.addAt(p, 'demo-soft-impact', 'sfx', 3)];
    await sleep(800); await L.blur(p);
    const ti = p.locator('[data-testid=arrangement-tempo-input]'); await ti.click(); await ti.fill('120'); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
    res.detailWas = await X.openDetail(p);
    await p.keyboard.press('Home'); await sleep(300);
    let clips = await L.clipsDom(p); res.clips = clips;
    const music = clips.find((c) => c.lane === 'music'); const sfx = clips.find((c) => c.lane === 'sfx');
    // Library filter
    await step('libraryFilter', async () => {
      const nodes = p.locator('[data-testid=arrangement-library] button[aria-current], [data-testid=arrangement-library] button').filter({ hasNot: p.locator('svg.lucide-chevron-right, svg.lucide-chevron-down') });
      const cand = await p.evaluate(() => { const lib = document.querySelector('[data-testid=arrangement-library]') || document; const all = [...lib.querySelectorAll('button')].filter((b) => b.hasAttribute('aria-current') || /tree/.test(b.className)); return all.map((b) => b.textContent.trim()).slice(0, 12); });
      // click the first collection node button (the one next to a fold toggle)
      const node = p.locator('button[aria-label$=" — Fold"]').first().locator('xpath=following-sibling::button[1]');
      const label = (await node.textContent()).trim(); await node.click(); await sleep(500);
      const span = p.locator('[data-testid=arrangement-library-filter] > span');
      const pEl = await infoLoc(p, p.locator('[data-testid=arrangement-library-filter]'));
      const nodeBox = (await node.boundingBox()); const excl = nodeBox ? [[nodeBox.x, nodeBox.y, nodeBox.width, nodeBox.height]] : [];
      const r = await site(p, 'library-filter-value', span, { excl });
      const filterText = await p.locator('[data-testid=arrangement-library-filter]').textContent();
      const optsOn = await p.locator('[role=option][data-source-id]').count();
      // off: All
      const all = p.locator('button[aria-current]').first(); const allBtn = p.getByRole('button', { name: /^All/ }).first();
      await allBtn.click().catch(() => {}); await sleep(500);
      const filterOff = await p.locator('[data-testid=arrangement-library-filter]').count(); const optsOff = await p.locator('[role=option][data-source-id]').count();
      return { cand, label, filterText, pClass: pEl && pEl.cls, pColor: pEl && pEl.color, optsOn, optsOff, filterOffCount: filterOff, found: !r.error };
    });
    // select music: Apply, 0 dB, panel toggle (hover); FUNC: 0 dB reset, collapse/expand
    clips = await L.clipsDom(p);
    await L.selectClip(p, music.id);
    await site(p, 'apply-hover', p.locator('[data-testid=arrangement-detail-apply]'), { hover: true });
    await step('clipGainReset', async () => {
      const gi = p.locator('[data-testid=arrangement-detail-clip-gain-input]'); await gi.click(); await gi.fill('3'); await p.keyboard.press('Enter'); await sleep(500); await L.blur(p);
      const before = await gi.inputValue();
      await site(p, 'zerodb-hover', p.locator('[data-testid=arrangement-detail-clip-gain-reset]'), { hover: true });
      const rb = await p.locator('[data-testid=arrangement-detail-clip-gain-reset]').boundingBox(); await p.mouse.click(rb.x + rb.width / 2, rb.y + rb.height / 2); await sleep(500); await p.mouse.move(2, 2);
      return { before, after: await gi.inputValue() };
    });
    await site(p, 'toggle-hover', p.locator('[data-testid=arrangement-detail-toggle]'), { hover: true });
    await step('panelCollapse', async () => {
      const t = p.locator('[data-testid=arrangement-detail-toggle]'); const e0 = await t.getAttribute('aria-expanded');
      await t.click(); await sleep(700); const e1 = await t.getAttribute('aria-expanded'); const c1 = await p.locator('[data-testid=arrangement-detail-content]').count();
      await t.click(); await sleep(700); const e2 = await t.getAttribute('aria-expanded'); const c2 = await p.locator('[data-testid=arrangement-detail-content]').count();
      await L.blur(p); return { e0, e1, c1, e2, c2 };
    });
    // Apply on a range in the Detail panel
    await step('applyRange', async () => {
      await L.selectClip(p, music.id);
      const s = p.locator('[data-testid=arrangement-detail-start]'); const e = p.locator('[data-testid=arrangement-detail-end]');
      const s0 = await s.inputValue(), e0 = await e.inputValue();
      await s.fill('2.5'); await e.fill('3.5'); await sleep(150);
      const ab = await p.locator('[data-testid=arrangement-detail-apply]').boundingBox(); await p.mouse.click(ab.x + ab.width / 2, ab.y + ab.height / 2); await sleep(500);
      const st = await L.status(p); const hint = await p.locator('[data-testid=arrangement-delete-hint]').count();
      const rangeText = await p.evaluate(() => { const h = document.querySelector('[data-testid=arrangement-delete-hint]'); return h ? h.parentElement.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) : null; });
      return { s0, e0, status: st, hintShown: hint, rangeText };
    });
    // Delete hint (range set by real drag)
    await step('rangeDrag', async () => ({ status: await X.rangeDrag(p, music.id, 2, 4) }));
    await p.keyboard.press('Home'); await sleep(300);
    await site(p, 'delete-hint', p.locator('[data-testid=arrangement-delete-hint]'));
    // two clips: group count + selection count
    await L.selectClip(p, music.id); await L.selectClip(p, sfx.id, ['Control']);
    res.selected2 = (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.lane);
    await site(p, 'selection-count', p.locator('[data-testid=arrangement-selection-count]'));
    await site(p, 'group-count', p.locator('[data-testid=arrangement-detail-group] > p').first());
    res.groupCountText = await p.locator('[data-testid=arrangement-detail-group] > p').first().textContent().catch(() => null);
    await L.selectClip(p, sfx.id, ['Control']); await L.selectClip(p, music.id, ['Control']);
    res.afterDeselect = (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.lane);
    // Grid menu
    const grid = () => p.evaluate(() => ({ ...document.querySelector('[data-testid=arrangement-grid-control]').dataset }));
    const openMenu = async () => { await L.blur(p); const pt = await p.evaluate(() => { for (const id of ['stems', 'sfx', 'music', 'video']) { const els = [...document.querySelectorAll('[data-track-id="' + id + '"][data-grid-seconds], [data-track-id="' + id + '"] [data-grid-seconds]')]; for (const e of els) { const r = e.getBoundingClientRect(); for (const dx of [600, 450, 300, 160]) { const x = Math.max(r.left, 0) + dx, y = r.top + r.height / 2; if (x > innerWidth - 20 || y > innerHeight - 20 || y < 0) continue; const h = document.elementFromPoint(x, y); if (h && e.contains(h) && !h.closest('[data-clip-id]')) return { id, x, y }; } } } return null; }); res.menuPt = pt; if (!pt) return 0; await p.mouse.click(pt.x, pt.y, { button: 'right' }); await sleep(500); return p.locator('[data-testid=arrangement-grid-menu]').count(); };
    const menuItems = () => p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-grid-menu] [role=menuitemradio],[data-testid=arrangement-grid-menu] [role=menuitemcheckbox]')].map((i) => ({ role: i.getAttribute('role'), label: i.textContent.trim().slice(0, 24), checked: i.getAttribute('aria-checked'), svgs: i.querySelectorAll('span[aria-hidden="true"] svg').length })));
    await step('gridMenu', async () => {
      const g0 = await grid(); const open1 = await openMenu(); const items0 = await menuItems();
      // Snap on by mouse
      const snapItem = p.locator('[data-testid=arrangement-grid-menu] [role=menuitemcheckbox]', { hasText: /Snap/ }).first();
      const sb = await snapItem.boundingBox(); await p.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2); await sleep(400);
      const g1 = await grid(); const stillOpen = await p.locator('[data-testid=arrangement-grid-menu]').count();
      if (!stillOpen) await openMenu();
      const items1 = await menuItems();
      // read every checked slot
      await p.mouse.move(2, 2); await sleep(300);
      const slots = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-grid-menu] [role=menuitemradio],[data-testid=arrangement-grid-menu] [role=menuitemcheckbox]')].filter((i) => i.getAttribute('aria-checked') === 'true').map((i) => { const s = i.querySelector('span[aria-hidden="true"]'); const r = s.getBoundingClientRect(); const svg = s.querySelector('svg'); return { label: i.textContent.trim().slice(0, 24), cls: s.getAttribute('class'), color: getComputedStyle(s).color, svgStroke: svg ? getComputedStyle(svg).stroke : null, svgColor: svg ? getComputedStyle(svg).color : null, box: [r.x, r.y, r.width, r.height], itemBg: getComputedStyle(i).backgroundColor, menuBg: getComputedStyle(i.closest('[data-testid=arrangement-grid-menu]')).backgroundColor }; }));
      await snap(p, 'grid-menu-checked');
      for (const s of slots) { s.scan = scan(s.box, []); s.crVsMenu = cr(rgb(s.color), rgb(s.menuBg)); }
      res.sites['grid-checks'] = { slots }; save();
      // choose 1/8 by mouse
      const e8 = p.locator('[data-testid=arrangement-grid-menu] [role=menuitemradio]', { hasText: /^1\/8$/ }).first();
      const eb = await e8.boundingBox(); await p.mouse.click(eb.x + eb.width / 2, eb.y + eb.height / 2); await sleep(400);
      const g2 = await grid(); const closedAfterDivision = !(await p.locator('[data-testid=arrangement-grid-menu]').count());
      // keyboard: reopen, move to Snap, toggle with Space/Enter
      await openMenu(); const items2 = await menuItems();
      const focusLbl = async () => p.evaluate(() => (document.activeElement && document.activeElement.textContent || '').trim().slice(0, 24));
      const kseq = [];
      for (let i = 0; i < 20; i++) { const f = await focusLbl(); kseq.push(f); if (/Snap/.test(f)) break; await p.keyboard.press('ArrowDown'); await sleep(80); }
      await p.keyboard.press('Enter'); await sleep(400);
      const g3 = await grid(); const openAfterKey = await p.locator('[data-testid=arrangement-grid-menu]').count();
      if (openAfterKey) { await p.keyboard.press('Escape'); await sleep(300); }
      // keyboard again to re-enable snap
      await openMenu(); for (let i = 0; i < 20; i++) { const f = await focusLbl(); if (/Snap/.test(f)) break; await p.keyboard.press('ArrowDown'); await sleep(80); }
      await p.keyboard.press('Enter'); await sleep(400); const g4 = await grid();
      if (await p.locator('[data-testid=arrangement-grid-menu]').count()) { await p.keyboard.press('Escape'); await sleep(300); }
      return { g0, open1, items0, g1, stillOpen, items1, g2, closedAfterDivision, items2, kseq, g3, openAfterKey, g4 };
    });
    // Snap drag: sfx moved by ~0.37 s with snap on at 1/8 (120 BPM => 0.25 s)
    await step('snapDrag', async () => {
      const gctl = await grid(); const c0 = (await L.clipsDom(p)).find((c) => c.lane === 'sfx');
      const a = await hdrPt(p, c0.id); const g = await L.geo(p);
      await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(a.x + 0.2 * g.pps, a.y, { steps: 6 }); await p.mouse.move(a.x + 0.37 * g.pps, a.y, { steps: 6 }); await sleep(200); await p.mouse.up(); await sleep(400);
      const c1 = (await L.clipsDom(p)).find((c) => c.lane === 'sfx');
      const onGrid = Math.abs(c1.start / 0.25 - Math.round(c1.start / 0.25)) < 1e-3;
      await X.key(p, 'Control+z'); const c2 = (await L.clipsDom(p)).find((c) => c.lane === 'sfx');
      return { grid: gctl, before: c0.start, after: c1.start, onGrid, moved: c1.start !== c0.start, undo: c2.start };
    });
    // REFUSAL: music clip header dragged onto the video lane, held
    await step('refusal', async () => {
      await p.keyboard.press('Home'); await sleep(200); await L.blur(p);
      const s0 = await sig(p); const m = (await L.clipsDom(p)).find((c) => c.lane === 'music'); const a = await hdrPt(p, m.id); const g = await L.geo(p);
      await p.mouse.move(a.x, a.y); await p.mouse.down();
      const lb = await p.locator('[data-track-id=video]').first().boundingBox(); const y = lb.y + lb.height * 0.45;
      await p.mouse.move(a.x, (a.y + y) / 2, { steps: 8 }); await p.mouse.move(a.x, y, { steps: 10 }); await sleep(450);
      const loc = p.locator('[data-testid=arrangement-lane-move-refusal]');
      const i = await infoLoc(p, loc); let r = { found: !!i };
      if (i) {
        const ghosts = await p.evaluate(() => [...document.querySelectorAll('[data-testid*=ghost]')].map((e) => { const q = e.getBoundingClientRect(); return [q.x, q.y, q.width, q.height]; }));
        await snap(p, 'refusal-during');
        r = { ...r, read: i, textRgb: rgb(i.color), crText: cr(rgb(i.color), i.composite), scan: scan(inset(i.box, 1), [...(await phBox(p)), ...ghosts]), hint: await p.locator('[data-testid=arrangement-lane-move-hint]').textContent(), status: await L.status(p) };
      }
      await p.mouse.up(); await sleep(500);
      r.unchanged = (await sig(p)) === s0; r.statusAfter = await L.status(p); r.refusalGone = !(await loc.count());
      res.refusal = r; res.sites.refusal = r; return { found: r.found, unchanged: r.unchanged };
    });
    // EXPORT (b): progress bar during a real WAV export
    await step('exportProgress', async () => {
      await L.blur(p); await p.keyboard.press('Home'); await sleep(200);
      await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title', { timeout: 10000 }); await sleep(400);
      await p.click('[data-testid=arrangement-export-format-wav]'); await p.click('[data-testid=arrangement-export-scope-project]').catch(() => {}); await sleep(200);
      const n0 = o.log.downloads.length; await p.mouse.move(2, 2);
      const cdp = await o.ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 20 }); r_thr = 20;
      const btn = p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /^Export WAV$/ });
      const bb = await btn.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.move(2, 2);
      let r = { found: false };
      try { await p.waitForSelector('[data-testid=arrangement-export-progress]', { state: 'attached', timeout: 8000 }); r.found = true; } catch (e) { r.waitErr = String(e).slice(0, 120); }
      if (r.found) {
        const loc = p.locator('[data-testid=arrangement-export-progress]'); const i = await infoLoc(p, loc); r.read = i;
        try { const f = path.join(SHD, 'export-progress.png'); const buf = await p.screenshot({ path: f }); img = decode(buf); res.shots['export-progress'] = path.relative(L.ROOT, f); r.stillThere = await loc.count(); const i2 = await infoLoc(p, loc); r.read2 = i2 && { box: i2.box, accentColor: i2.accentColor }; if (r.stillThere && i2) r.scan = scan(inset(i2.box, 1), []); else r.scanNote = 'progress gone before screenshot'; } catch (e) { r.shotErr = String(e).slice(0, 120); }
      }
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }); r.cpuThrottle = r_thr;
      const t0 = Date.now(); while (Date.now() - t0 < 120000) { if (o.log.downloads.length > n0 && o.log.downloads.slice(n0).every((d) => d.file || d.err)) break; await sleep(250); }
      await sleep(800); r.dialogText = (await X.dstate(p) || {}).status;
      r.overloadPresent = await p.locator('[data-testid=arrangement-export-overload]').count();
      const recs = o.log.downloads.slice(n0); r.files = [];
      for (const rec of recs) { if (!rec.file) continue; const w = X.wav(rec.file); r.files.push({ name: rec.name, size: rec.size, sha: w.sha, fmt: w.fmt, seconds: w.seconds, peak: +w.peak.toFixed(4), rms: +w.rms.toFixed(4), nan: w.nan }); }
      await X.closeDlg(p); res.exp.progress = r; res.sites['export-progress'] = r; return { found: r.found, files: r.files.length };
    });
    // EXPORT (c): overload — clip gain +24 dB, Master +6 dB
    await step('exportOverload', async () => {
      const m = (await L.clipsDom(p)).find((c) => c.lane === 'music'); await L.selectClip(p, m.id);
      const gi = p.locator('[data-testid=arrangement-detail-clip-gain-input]'); await gi.click(); await gi.fill('24'); await p.keyboard.press('Enter'); await sleep(500); await L.blur(p);
      const mv = p.locator('input[aria-label="Master Volume"]'); await mv.focus(); await p.keyboard.press('End'); await sleep(200); await L.blur(p); await sleep(300);
      const masterReadout = await p.locator('[data-testid=arrangement-master-readout]').textContent();
      const gain = await gi.inputValue();
      await L.selectClip(p, m.id, ['Control']);
      const ex = await X.exportWav(p, o.log, `${TAG}-overload`, { keepOpen: true });
      await p.mouse.move(2, 2); await sleep(300);
      const loc = p.locator('[data-testid=arrangement-export-overload]');
      const r = await site(p, 'export-overload', loc, { noRest: true });
      const role = await loc.getAttribute('role').catch(() => null); const text = await loc.textContent().catch(() => null);
      const files = ex.files.map((f) => { const w = X.wav(f); return { f: path.basename(f), sha: w.sha, fmt: w.fmt, seconds: w.seconds, peak: +w.peak.toFixed(4), nan: w.nan }; });
      await X.closeDlg(p);
      return { masterReadout, gain, role, text, found: !r.error, files, recs: ex.recs };
    });
    await rest(p); await snap(p, 'final');
    res.logMain = o.log; await o.ctx.close();
  } catch (e) { res.error = String(e && e.stack || e).slice(0, 1500); }
  await b.close(); res.net = X.netOk(net); save();
  const sum = { error: res.error, errors: res.errors, fonts: res.fonts, badgeCount: res.badgeCount, exitHref: res.exitHref, anon: res.anon, anonCookies: res.anonCookies, net: res.net, selected2: res.selected2, afterDeselect: res.afterDeselect, groupCountText: res.groupCountText, sites: {}, func: res.func };
  for (const [k, v] of Object.entries(res.sites)) {
    if (k === 'grid-checks') { sum.sites[k] = v.slots.map((s) => ({ l: s.label, col: s.color, svg: s.svgStroke, cr: s.crVsMenu, scan: `${s.scan.brass}/${s.scan.n}` })); continue; }
    const rd = v.read || {}; sum.sites[k] = { err: v.error, col: rd.color, acc: k === 'export-progress' ? rd.accentColor : undefined, bd: v.borderRgb, bg: rd.bg, rest: v.restRead && v.restRead.color, restBg: v.restRead && v.restRead.bg, hov: rd.hover, dis: rd.disabled, comp: rd.composite, cr: v.crText, crB: v.crBorder, scan: v.scan ? `${v.scan.brass}/${v.scan.n}` : v.scanNote, txt: rd.text && rd.text.slice(0, 50) };
  }
  console.log(JSON.stringify(sum, null, 1));
})();
