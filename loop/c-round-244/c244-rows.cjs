
// ---------- round 244 rows (C) ----------
const groupInfo = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-group-row"]')].map((g) => ({ id: g.getAttribute('data-group-id') || g.closest('[data-group-id]')?.getAttribute('data-group-id'), name: g.querySelector('[data-testid="arrangement-group-name"]')?.textContent?.trim() ?? null, input: !!g.querySelector('[data-testid="arrangement-group-name-input"]') })));
const activeCtx = (page) => page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; return { groupId: a.closest('[data-group-id]')?.getAttribute('data-group-id') ?? null, markerId: a.getAttribute('data-marker-id'), text: (a.textContent || '').trim().slice(0, 60) }; });
const markerFull = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => ({ id: m.getAttribute('data-marker-id'), time: m.getAttribute('data-marker-time'), label: m.getAttribute('aria-label') })));
const editorInputs = (page) => page.evaluate(() => ({ marker: document.querySelectorAll('[data-testid="arrangement-marker-name-input"]').length, group: document.querySelectorAll('[data-testid="arrangement-group-name-input"]').length }));
const EDIT = {
  async markerAdd(page) { await page.evaluate(() => document.body.focus()); await key(page, 'KeyM', 500); return {}; },
  async markerRename(page) { await page.evaluate(() => document.body.focus()); await key(page, 'KeyM', 400); await key(page, 'Enter', 400); await key(page, 'F2', 500); await page.keyboard.press('Control+a'); await page.keyboard.type('Hit'); await sleep(150); return {}; },
  async markerAddExisting(page) { await page.evaluate(() => document.body.focus()); await key(page, 'KeyM', 400); await key(page, 'Enter', 400); const first = await markerFull(page); await page.evaluate(() => document.body.focus()); await key(page, 'KeyM', 500); return { first }; },
  async groupRename(page) {
    await addBtn(page, 'demo-stem-pulse');
    const names = page.locator('[data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]');
    const n = await names.count();
    await names.nth(1).click(); await sleep(300);
    await names.nth(2).click({ modifiers: ['Control'] }); await sleep(300);
    await page.keyboard.press('Control+g'); await sleep(600);
    const groups0 = await groupInfo(page);
    await page.getByTestId('arrangement-group-name').first().focus(); await sleep(150);
    const nameFocus = await fullActive(page);
    await key(page, 'F2', 500); await page.keyboard.press('Control+a'); await page.keyboard.type('X'); await sleep(150);
    return { nNames: n, groups0, nameFocus };
  },
};
async function editorCase(browser, vp, key_, name, action, after) {
  const { ctx, page, errors } = await open(browser, vp);
  const r = { origin: name, action };
  Object.assign(r, await EDIT[name](page));
  r.before = await fullActive(page); r.inputsBefore = await editorInputs(page);
  r.markersBefore = await markerFull(page); r.groupsBefore = await groupInfo(page);
  const pts = await emptyLanePoints(page); r.point = pts[0];
  await startLog(page);
  await page.mouse.click(pts[0].x, pts[0].y, { button: 'right' }); await sleep(400);
  r.opened = await page.getByTestId('arrangement-grid-menu').count();
  r.afterPress = { active: await fullActive(page), inputs: await editorInputs(page), markers: await markerFull(page), groups: await groupInfo(page) };
  if (after === 'reposition') {
    const mb = await page.getByTestId('arrangement-grid-menu').boundingBox(); r.firstBox = mb;
    const far = await page.evaluate(([bx]) => { for (const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')) { const q = body.getBoundingClientRect(); for (const fx of [0.15, 0.25, 0.35]) { const x = q.left + q.width * fx; const y = q.top + q.height / 2; if (x <= 0 || x >= bx - 30 || y <= 0 || y >= innerHeight - 10) continue; if (document.elementFromPoint(x, y) === body) return { x, y }; } } return null; }, [mb.x]);
    r.second = far;
    await page.mouse.click(far.x, far.y, { button: 'right' }); await sleep(400);
    r.afterSecond = { menu: await page.getByTestId('arrangement-grid-menu').count(), box: await page.getByTestId('arrangement-grid-menu').boundingBox().catch(() => null), active: await activeDesc(page) };
  }
  if (action === 'escape') await page.keyboard.press('Escape'); else await page.getByTestId('arrangement-grid-menu').getByRole('menuitemradio', { name: action, exact: true }).click();
  await sleep(450);
  r.menuOpen = await page.getByTestId('arrangement-grid-menu').count();
  r.final = await fullActive(page); r.finalCtx = await activeCtx(page);
  r.markersAfter = await markerFull(page); r.groupsAfter = await groupInfo(page);
  r.status = await statusText(page); r.grid = (await G(page)).seconds;
  r.log = await getLog(page);
  r.ring = r.final.el !== 'BODY' ? await brassBand(page, path.join(outDir, `ring-${name}-${after || action.replace(/\W/g, '')}-${key_}.png`)) : null;
  await page.screenshot({ path: path.join(outDir, `editor-${name}-${after || action.replace(/\W/g, '')}-${key_}.png`) });
  if (after === 'undo') {
    r.undoBefore = await fullActive(page);
    await page.keyboard.press('Control+z'); await sleep(500);
    r.undo = { active: await fullActive(page), markers: await markerFull(page), groups: await groupInfo(page), status: await statusText(page) };
  }
  r.errors = errors; await ctx.close();
  return r;
}
async function leftNeighbour(browser, vp, key_, name) {
  const { ctx, page, errors } = await open(browser, vp);
  const r = { origin: name };
  Object.assign(r, await EDIT[name](page));
  r.before = await fullActive(page);
  r.selBefore = await page.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-track-header]')].map((h) => h.getAttribute('data-selected') ?? h.getAttribute('aria-selected') ?? String(h.className).includes('ring') ));
  const pts = await emptyLanePoints(page); r.point = pts[0];
  await startLog(page);
  await page.mouse.click(pts[0].x, pts[0].y); await sleep(450);
  r.menu = await page.getByTestId('arrangement-grid-menu').count();
  r.final = await fullActive(page); r.finalCtx = await activeCtx(page);
  r.markers = await markerFull(page); r.groups = await groupInfo(page); r.inputs = await editorInputs(page); r.status = await statusText(page);
  r.selAfter = await page.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-track-header]')].map((h) => h.getAttribute('data-selected') ?? h.getAttribute('aria-selected') ?? String(h.className).includes('ring') ));
  r.log = await getLog(page);
  await page.screenshot({ path: path.join(outDir, `left-${name}-${key_}.png`) });
  r.errors = errors; await ctx.close(); return r;
}
const ROWS = {
  async editorOrigins(browser, vp, key_) {
    const out = {};
    for (const [n, a, aft] of [['markerAdd', 'escape', 'undo'], ['markerRename', 'escape', 'undo'], ['groupRename', 'escape', 'undo'], ['markerAdd', '0.5 s', null], ['markerAddExisting', 'escape', null], ['markerAdd', 'escape', 'reposition']]) {
      const k = `${n}/${a}${aft ? '/' + aft : ''}`;
      try { out[k] = await editorCase(browser, vp, key_, n, a, aft); } catch (e) { out[k] = { error: String(e).slice(0, 600) }; }
      console.log(' ', k, out[k].final?.el ?? out[k].error, out[k].undo ? 'undo:' + out[k].undo.active.el : '');
    }
    return out;
  },
  async leftNeighbours(browser, vp, key_) {
    const out = {};
    for (const n of ['markerAdd', 'groupRename']) { try { out[n] = await leftNeighbour(browser, vp, key_, n); } catch (e) { out[n] = { error: String(e).slice(0, 600) }; } console.log(' left', n, out[n].final?.el ?? out[n].error); }
    return out;
  },
  async stale(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = { tabs: await tabUntil(page, isTrackFader) }; r.before = await fullActive(page);
    const hdr = page.getByTestId('arrangement-track-header').first();
    r.pt = await page.evaluate(() => { const h = document.querySelector('[data-testid="arrangement-track-header"]'); const b = h.getBoundingClientRect(); for (let y = b.top + 3; y < b.bottom - 3; y += 4) for (let x = b.left + 3; x < b.right - 3; x += 6) { const e = document.elementFromPoint(x, y); if (e && h.contains(e) && !e.closest('button,input,select,a,[tabindex]')) return { x, y }; } return null; });
    await page.evaluate(() => { window.__ctx = null; window.addEventListener('contextmenu', (e) => { setTimeout(() => { window.__ctx = e.defaultPrevented; }, 0); }, { once: true }); });
    await startLog(page);
    await page.mouse.click(r.pt.x, r.pt.y, { button: 'right' }); await sleep(400);
    r.headerGridMenu = await page.getByTestId('arrangement-grid-menu').count(); r.headerPrevented = await page.evaluate(() => window.__ctx);
    await key(page, 'Escape', 300); r.afterEsc1 = await fullActive(page);
    const nameBtn = hdr.locator('button[aria-label*="— set as the active track"]').first();
    await nameBtn.click(); await sleep(350); r.afterLeft = await fullActive(page);
    const pts = await emptyLanePoints(page);
    await page.mouse.click(pts[0].x, pts[0].y, { button: 'right' }); await sleep(400);
    r.opened = await page.getByTestId('arrangement-grid-menu').count();
    await key(page, 'Escape', 400);
    r.final = await fullActive(page); r.log = await getLog(page);
    r.ok = r.headerGridMenu === 0 && r.headerPrevented === false && r.opened > 0 && r.final.label !== r.before.label && r.final.el === r.afterLeft.el && r.final.label === r.afterLeft.label;
    await page.screenshot({ path: path.join(outDir, `stale-${key_}.png`) });
    r.errors = errors; await ctx.close(); return r;
  },
  async focus243(browser, vp, key_) {
    const out = {};
    for (const [n, a] of [['fader', 'escape'], ['tempoBpm', 'escape'], ['tempoBpm', '0.5 s'], ['brace', 'escape'], ['markerFlag', 'escape']]) {
      try {
        out[`${n}/${a}`] = await originCycle(browser, vp, key_, n, a);
      } catch (e) { out[`${n}/${a}`] = { error: String(e).slice(0, 600) }; }
      console.log(' ', n, a, out[`${n}/${a}`].final?.el ?? out[`${n}/${a}`].error);
    }
    return out;
  },
  async bpmSel(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = { tabs: await tabUntil(page, () => document.activeElement?.getAttribute('data-testid') === 'arrangement-tempo-input') };
    const sel = () => page.evaluate(() => { const i = document.activeElement; return { el: i.getAttribute('data-testid'), value: i.value, attr: i.getAttribute('value'), ss: i.selectionStart, se: i.selectionEnd, selected: String(window.getSelection()) }; });
    r.before = await sel();
    const pts = await emptyLanePoints(page);
    await page.mouse.click(pts[0].x, pts[0].y, { button: 'right' }); await sleep(400);
    r.opened = await page.getByTestId('arrangement-grid-menu').count();
    await page.getByTestId('arrangement-grid-menu').getByRole('menuitemradio', { name: '0.5 s', exact: true }).click(); await sleep(450);
    r.after = await sel(); r.grid = (await G(page)).seconds;
    r.ok = r.after.el === 'arrangement-tempo-input' && r.after.value === r.before.value && r.grid === '0.5';
    r.errors = errors; await ctx.close(); return r;
  },
  async swallow(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = {};
    const pos = () => page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')));
    const m = await openMenu(page); r.opened = !!m;
    const play = page.getByRole('button', { name: /^Play/ }).first();
    r.playLabel = await play.getAttribute('aria-label');
    r.p0 = await pos();
    await play.click(); await sleep(700);
    r.afterFirst = { menu: await page.getByTestId('arrangement-grid-menu').count(), pos: await pos() };
    await sleep(400); r.afterFirst.pos2 = await pos();
    await play.click(); await sleep(1000);
    r.afterSecond = { pos: await pos(), rms: await page.evaluate(() => Math.max(0, ...window.__rms())) };
    await sleep(400); r.afterSecond.pos2 = await pos();
    r.ok = r.opened && r.afterFirst.menu === 0 && r.afterFirst.pos === r.afterFirst.pos2 && r.afterSecond.pos2 > r.afterSecond.pos && r.afterSecond.rms > 0.001;
    await page.keyboard.press('Space');
    r.errors = errors; await ctx.close(); return r;
  },
  marquee: ROWS242.marquee,
  async budget(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    const empty = await inventory(page);
    await page.screenshot({ path: path.join(outDir, `budget-empty-${key_}.png`) });
    await addBtn(page, 'demo-stem-pulse');
    const demo = await inventory(page);
    await page.screenshot({ path: path.join(outDir, `budget-demo-${key_}.png`) });
    await ctx.close();
    const exp = key_ === '1440x900' ? [85, 101] : [69, 85];
    return { empty: empty.length, demo: demo.length, expEmpty: exp[0], expDemo: exp[1], ok: empty.length === exp[0] && demo.length === exp[1], emptyRows: empty, demoRows: demo, errors };
  },
  smoke: OLD.smoke,
  auth: OLD.auth,
};

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  R.chromium = browser.version();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of Object.entries(ROWS)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now();
      try { R.rows[`${name}@${k}`] = await fn(browser, vp, k); } catch (e) { R.rows[`${name}@${k}`] = { error: String(e).slice(0, 800) }; }
      R.rows[`${name}@${k}`].ms = Date.now() - t0;
      save();
      console.log(name, k, 'done', Date.now() - t0);
    }
  }
  await browser.close();
  R.finished = new Date().toISOString();
  save();
})();
