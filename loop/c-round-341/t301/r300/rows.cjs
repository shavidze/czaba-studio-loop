const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');
const BASE = process.argv[2] || 'http://127.0.0.1:5173';
const OUT = __dirname;
const SHOTS = path.join(OUT, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const audioHook = () => {
  window.__c300 = { starts: 0, stops: 0 };
  const proto = window.AudioScheduledSourceNode && window.AudioScheduledSourceNode.prototype;
  if (proto) {
    const s = proto.start; proto.start = function (...a) { window.__c300.starts += 1; return s.apply(this, a); };
    const t = proto.stop; proto.stop = function (...a) { window.__c300.stops += 1; return t.apply(this, a); };
  }
  window.__c300ctx = [];
  window.addEventListener('contextmenu', (e) => { setTimeout(() => window.__c300ctx.push({ target: e.target?.closest?.('[data-source-id]')?.getAttribute('data-source-id') ?? e.target?.tagName, dp: e.defaultPrevented }), 0); });
};

const active = (page) => page.evaluate(() => {
  const a = document.activeElement;
  return { tag: a?.tagName, role: a?.getAttribute('role'), id: a?.getAttribute('data-source-id'), sel: a?.getAttribute('aria-selected'), testid: a?.getAttribute('data-testid'), label: a?.getAttribute('aria-label') ?? (a?.textContent || '').trim().slice(0, 40) };
});
const menuInfo = (page) => page.evaluate(() => {
  const menus = Array.from(document.querySelectorAll('[role="menu"]'));
  const m = menus[0];
  if (!m) return { count: 0 };
  const items = Array.from(m.querySelectorAll('[role="menuitem"]'));
  const it = items[0];
  const r = m.getBoundingClientRect();
  const cs = it ? getComputedStyle(it) : null;
  return {
    count: menus.length, label: m.getAttribute('aria-label'), items: items.length,
    itemTag: it?.tagName, href: it?.getAttribute('href'), target: it?.getAttribute('target'), rel: it?.getAttribute('rel'), text: it?.textContent?.trim(),
    box: { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom, vw: innerWidth, vh: innerHeight },
    inViewport: r.x >= 0 && r.y >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
    itemFocused: document.activeElement === it,
    focusVisible: it ? it.matches(':focus-visible') : null,
    outline: cs ? { style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor, offset: cs.outlineOffset } : null,
  };
});
const clipCount = (page) => page.locator('[data-clip-id]').count();
const statusText = (page) => page.locator('[data-testid="arrangement-status"]').textContent();
const clock = (page) => page.evaluate(() => {
  const c = document.querySelector('[data-testid="arrangement-transport-centre"]');
  const m = c?.textContent?.match(/\d\d:\d\d\.\d{3}/);
  return m ? m[0] : null;
});
const playLabel = (page) => page.evaluate(() => {
  const c = document.querySelector('[data-testid="arrangement-transport-centre"]');
  return Array.from(c?.querySelectorAll('button') ?? []).map((b) => b.getAttribute('aria-label') || b.textContent.trim()).join('|');
});
const previewing = (page) => page.evaluate(() => Array.from(document.querySelectorAll('[data-testid="arrangement-library-option-previewing"]')).map((n) => n.closest('[data-source-id]')?.getAttribute('data-source-id')));
const starts = (page) => page.evaluate(() => window.__c300.starts);

async function fresh(browser, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(audioHook);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => /Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 45000 });
  await page.waitForTimeout(300);
  return { ctx, page, errors };
}
const opt = (page, id) => page.locator(`[role="option"][data-source-id="${id}"]`);

async function openByRight(page, id) {
  const o = opt(page, id);
  await o.scrollIntoViewIfNeeded();
  const b = await o.boundingBox();
  const px = Math.round(b.x + b.width / 2), py = Math.round(b.y + b.height / 2);
  await page.mouse.click(px, py, { button: 'right' });
  await page.waitForTimeout(250);
  return { px, py };
}
async function openByKey(page, id, key) {
  await opt(page, id).click();
  await page.waitForTimeout(150);
  await page.keyboard.press(key);
  await page.waitForTimeout(250);
}

(async () => {
  const browser = await chromium.launch();
  // warm-up (L38)
  { const c = await browser.newContext(); const p = await c.newPage(); await p.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(3000); await c.close(); }
  const result = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const R = {}; const tag = `${w}x${h}`;
    // ---------- G300-AUTH ----------
    {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      const g = {};
      g.cookies = (await ctx.cookies()).length;
      g.badge = await page.getByText('Demo collection — no sign-in required').count();
      g.workspace = await page.locator('[data-testid="arrangement-transport"]').count();
      g.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
      await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'networkidle' }).catch((e) => { g.navErr = String(e).slice(0, 100); });
      await page.waitForTimeout(2500);
      g.signInRequired = await page.getByText('Sign in required').count();
      g.audioSrc = await page.locator('audio[src]').count();
      g.studioUrl = page.url();
      await page.screenshot({ path: path.join(SHOTS, `auth-studio-${tag}.png`) });
      const tok = await page.evaluate(async () => { const r = await fetch('/api/studio-token'); const t = await r.text(); return { status: r.status, body: t.slice(0, 200) }; });
      g.token = tok; g.tokenBodyHasToken = /"token"\s*:\s*"[^"]+"|eyJ[A-Za-z0-9_-]{10,}/.test(tok.body);
      g.authUserAfter = await page.evaluate(() => localStorage.getItem('auth_user'));
      R.G300_AUTH = g; await ctx.close();
    }
    // ---------- B-MENU + B-NEWTAB ----------
    {
      const { ctx, page, errors } = await fresh(browser, w, h);
      const r = {};
      const clips0 = await clipCount(page); const st0 = await statusText(page);
      const pt = await openByRight(page, 'demo-middle-east');
      r.menu = await menuInfo(page); r.pointer = pt;
      r.anchoredAtPointer = r.menu.box ? Math.abs(r.menu.box.x - pt.px) <= 1 && Math.abs(r.menu.box.y - pt.py) <= 1 : false;
      r.ctxEvents = await page.evaluate(() => window.__c300ctx);
      r.selectedAfterRight = await opt(page, 'demo-middle-east').getAttribute('aria-selected');
      await page.screenshot({ path: path.join(SHOTS, `b-menu-${tag}.png`) });
      const pP = ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null);
      await page.getByRole('menuitem', { name: 'View in store' }).click();
      const np = await pP;
      if (np) { await np.waitForLoadState('domcontentloaded').catch(() => {}); r.newUrl = np.url(); r.opener = await np.evaluate(() => window.opener === null ? 'null' : 'non-null').catch((e) => 'err ' + String(e).slice(0, 60)); r.newTitle = await np.title().catch(() => null); await np.screenshot({ path: path.join(SHOTS, `b-newtab-product-${tag}.png`) }).catch(() => {}); await np.close(); } else r.newUrl = null;
      await page.bringToFront(); await page.waitForTimeout(400);
      r.studioUrl = page.url();
      r.menusAfter = (await menuInfo(page)).count; r.activeAfter = await active(page);
      r.clipsBefore = clips0; r.clipsAfter = await clipCount(page);
      r.statusBefore = st0; r.statusAfter = await statusText(page);
      r.errors = errors; R.B_MENU_NEWTAB = r; await ctx.close();
    }
    // ---------- B-KBD (Shift+F10, ContextMenu) ----------
    for (const key of ['Shift+F10', 'ContextMenu']) {
      const { ctx, page, errors } = await fresh(browser, w, h);
      const r = {};
      await openByKey(page, 'demo-middle-east', key);
      const ob = await opt(page, 'demo-middle-east').boundingBox();
      r.optionBox = ob; r.menu = await menuInfo(page);
      r.belowOption = r.menu.box ? Math.abs(r.menu.box.y - (ob.y + ob.height)) <= 1 && Math.abs(r.menu.box.x - ob.x) <= 1 : false;
      await page.screenshot({ path: path.join(SHOTS, `b-kbd-${key.replace('+', '')}-${tag}.png`) });
      const pP = ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null);
      const s0 = await starts(page);
      await page.keyboard.press('Enter');
      const np = await pP;
      if (np) { await np.waitForLoadState('domcontentloaded').catch(() => {}); r.newUrl = np.url(); r.opener = await np.evaluate(() => window.opener === null ? 'null' : 'non-null').catch(() => 'err'); await np.close(); } else r.newUrl = null;
      await page.bringToFront(); await page.waitForTimeout(500);
      r.menusAfter = (await menuInfo(page)).count; r.activeAfter = await active(page);
      r.optionFocusVisible = await page.evaluate(() => document.activeElement?.matches(':focus-visible'));
      r.audioStartsDuringEnter = (await starts(page)) - s0;
      r.clips = await clipCount(page);
      r.errors = errors; R[`B_KBD_${key}`] = r; await ctx.close();
    }
    // ---------- B-CLOSE ----------
    {
      const { ctx, page, errors } = await fresh(browser, w, h);
      const r = {};
      const clips0 = await clipCount(page);
      // a Escape
      await openByRight(page, 'demo-middle-east'); r.a_open = (await menuInfo(page)).count;
      await page.keyboard.press('Escape'); await page.waitForTimeout(250);
      r.a = { menus: (await menuInfo(page)).count, active: await active(page) };
      // b Tab
      await openByRight(page, 'demo-middle-east'); r.b_open = (await menuInfo(page)).count;
      await page.keyboard.press('Tab'); await page.waitForTimeout(250);
      r.b = { menus: (await menuInfo(page)).count, active: await active(page) };
      // control: Tab from the option with no menu
      await opt(page, 'demo-middle-east').focus(); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
      r.b_control_tabFromOption = await active(page);
      // c click search input
      await openByRight(page, 'demo-middle-east'); r.c_open = (await menuInfo(page)).count;
      const sb = await page.locator('[data-testid="arrangement-library-search"]').boundingBox();
      await page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2); await page.waitForTimeout(250);
      r.c = { menus: (await menuInfo(page)).count, active: await active(page), searchFocused: await page.evaluate(() => document.activeElement?.getAttribute('data-testid') === 'arrangement-library-search' || document.activeElement?.closest?.('[data-testid="arrangement-library-search"]') !== null) };
      // c2: a second click on search after the swallowed click should now focus it
      await page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2); await page.waitForTimeout(250);
      r.c2_secondClick = await active(page);
      // d resize
      await openByRight(page, 'demo-middle-east'); r.d_open = (await menuInfo(page)).count;
      await page.setViewportSize({ width: w + 10, height: h }); await page.waitForTimeout(300);
      r.d = { menus: (await menuInfo(page)).count, active: await active(page) };
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(200);
      // e: outside click on the timeline (no clip added)
      await openByRight(page, 'demo-middle-east');
      const tl = await page.locator('[data-testid="arrangement-timeline-scroller"]').boundingBox();
      await page.mouse.click(tl.x + tl.width / 2, tl.y + tl.height / 2); await page.waitForTimeout(250);
      r.e_timeline = { menus: (await menuInfo(page)).count, active: await active(page) };
      r.clipsBefore = clips0; r.clipsAfter = await clipCount(page);
      r.errors = errors; R.B_CLOSE = r; await ctx.close();
    }
    // ---------- B-SPACE ----------
    {
      const { ctx, page, errors } = await fresh(browser, w, h);
      const r = {};
      await openByKey(page, 'demo-middle-east', 'Shift+F10');
      r.menuOpen = (await menuInfo(page)).count;
      const c0 = await clock(page); const s0 = await starts(page); r.transportBefore = await playLabel(page);
      const pP = ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null);
      await page.keyboard.press(' ');
      const np = await pP;
      const pages = [];
      if (np) { await np.waitForLoadState('domcontentloaded').catch(() => {}); r.newUrl = np.url(); await np.close(); } else r.newUrl = null;
      await page.bringToFront();
      await page.waitForTimeout(1100);
      r.extraPages = ctx.pages().length - 1;
      r.menusAfter = (await menuInfo(page)).count; r.activeAfter = await active(page);
      r.clockBefore = c0; r.clockAfter = await clock(page);
      r.transportAfter = await playLabel(page);
      r.playbackState = await page.locator('[data-testid="arrangement-playback-state"]').textContent().catch(() => null);
      r.audioStarts = (await starts(page)) - s0;
      r.errors = errors; R.B_SPACE = r; await ctx.close();
    }
    // ---------- B-UNMAPPED ----------
    {
      const { ctx, page, errors } = await fresh(browser, w, h);
      const r = {};
      await page.evaluate(() => { window.__c300ctx = []; });
      await openByRight(page, 'demo-hero-music');
      await page.waitForTimeout(100);
      r.right = { ctx: await page.evaluate(() => window.__c300ctx), menus: (await menuInfo(page)).count };
      // mapped control for listener validity
      await page.keyboard.press('Escape');
      await page.evaluate(() => { window.__c300ctx = []; });
      await openByRight(page, 'demo-middle-east'); await page.waitForTimeout(100);
      r.mappedControl = { ctx: await page.evaluate(() => window.__c300ctx), menus: (await menuInfo(page)).count };
      await page.keyboard.press('Escape'); await page.waitForTimeout(150);
      await openByKey(page, 'demo-hero-music', 'Shift+F10');
      r.shiftF10 = { menus: (await menuInfo(page)).count, active: await active(page) };
      await page.keyboard.press('ContextMenu'); await page.waitForTimeout(200);
      r.contextMenuKey = { menus: (await menuInfo(page)).count };
      r.errors = errors; R.B_UNMAPPED = r; await ctx.close();
    }
    // ---------- B-PREVIEW-PARITY ----------
    for (const mode of ['right', 'left-control']) {
      const { ctx, page, errors } = await fresh(browser, w, h);
      const r = {};
      await opt(page, 'demo-hero-music').click(); await page.waitForTimeout(300);
      const s0 = await starts(page);
      await page.locator('[data-testid="arrangement-library-preview-toggle"]').click();
      await page.waitForTimeout(1200);
      r.previewingBefore = await previewing(page); r.startsAfterPreview = (await starts(page)) - s0;
      const s1 = await starts(page);
      if (mode === 'right') await openByRight(page, 'demo-middle-east'); else { await opt(page, 'demo-middle-east').click(); await page.waitForTimeout(250); }
      await page.waitForTimeout(1200);
      r.menus = (await menuInfo(page)).count;
      r.previewingAfter = await previewing(page);
      r.startsAfterSwitch = (await starts(page)) - s1;
      r.selected = await opt(page, 'demo-middle-east').getAttribute('aria-selected');
      if (mode === 'right') await page.screenshot({ path: path.join(SHOTS, `b-preview-parity-${tag}.png`) });
      await page.keyboard.press('Escape'); await page.waitForTimeout(400);
      r.previewingAfterEsc = await previewing(page); r.activeAfterEsc = await active(page);
      r.toggleLabelAfterEsc = await page.locator('[data-testid="arrangement-library-preview-toggle"]').getAttribute('aria-label').catch(() => null);
      r.errors = errors; R[`B_PREVIEW_PARITY_${mode}`] = r; await ctx.close();
    }
    // ---------- B-ADD-INTACT ----------
    {
      const { ctx, page, errors } = await fresh(browser, w, h);
      const r = { counts: [] };
      r.counts.push(await clipCount(page));
      await opt(page, 'demo-middle-east').dblclick(); await page.waitForTimeout(600);
      r.counts.push(await clipCount(page));
      await opt(page, 'demo-middle-east').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(600);
      r.counts.push(await clipCount(page));
      r.menusDuring = (await menuInfo(page)).count;
      await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
      r.counts.push(await clipCount(page));
      await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
      r.counts.push(await clipCount(page));
      r.menusAfter = (await menuInfo(page)).count;
      r.errors = errors; R.B_ADD_INTACT = r; await ctx.close();
    }
    // ---------- B-SHEET ----------
    {
      const { ctx, page, errors } = await fresh(browser, w, h);
      const r = {};
      await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
      await page.keyboard.press('?'); await page.waitForTimeout(500);
      r.dialogs = await page.getByRole('dialog').count();
      r.row = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]'); if (!d) return null;
        const all = Array.from(d.querySelectorAll('*')).filter((e) => e.children.length === 0 && /View in store \(new tab\)/.test(e.textContent));
        const el = all[0]; if (!el) return { found: false };
        let row = el; for (let i = 0; i < 4 && row && !/Shift\+F10/.test(row.textContent); i++) row = row.parentElement;
        let grp = el; let group = null; for (let i = 0; i < 8 && grp; i++) { const hd = grp.querySelector?.('h2,h3,h4,[role="heading"]'); if (hd && grp.contains(el)) { group = hd.textContent.trim(); break; } grp = grp.parentElement; }
        const kbds = row ? Array.from(row.querySelectorAll('kbd')).map((k) => k.textContent.trim()) : [];
        return { found: true, rowText: row?.textContent?.trim(), kbds, group, count: all.length };
      });
      const dialog = page.getByRole('dialog');
      const target = dialog.getByText('View in store (new tab)');
      if (await target.count()) await target.scrollIntoViewIfNeeded().catch(() => {});
      await page.screenshot({ path: path.join(SHOTS, `b-sheet-${tag}.png`) });
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
      r.dialogsAfterEsc = await page.getByRole('dialog').count();
      r.errors = errors; R.B_SHEET = r; await ctx.close();
    }
    // ---------- extras: held Shift+F10, reopen, menu near bottom-right clamp ----------
    {
      const { ctx, page, errors } = await fresh(browser, w, h);
      const r = {};
      await opt(page, 'demo-middle-east').click(); await page.waitForTimeout(150);
      await page.keyboard.down('Shift');
      await page.dispatchEvent('[role="option"][data-source-id="demo-middle-east"]', 'keydown', { key: 'F10', shiftKey: true, repeat: true, bubbles: true });
      await page.keyboard.up('Shift'); await page.waitForTimeout(200);
      r.heldRepeatMenus = (await menuInfo(page)).count;
      // right-click twice in a row -> one menu
      await openByRight(page, 'demo-middle-east'); await openByRight(page, 'demo-middle-east');
      r.doubleRightMenus = (await menuInfo(page)).count; r.doubleRightActive = await active(page);
      await page.keyboard.press('Escape'); await page.waitForTimeout(150);
      // right-click inside the open menu -> native suppressed, stays open
      await openByRight(page, 'demo-middle-east');
      const mb = (await menuInfo(page)).box;
      await page.mouse.click(mb.x + mb.w / 2, mb.y + mb.h / 2, { button: 'right' }); await page.waitForTimeout(200);
      r.rightInsideMenu = (await menuInfo(page)).count;
      await page.keyboard.press('ArrowDown'); await page.keyboard.press('End'); await page.waitForTimeout(100);
      r.arrowKeepsItem = (await menuInfo(page)).itemFocused;
      // Studio shortcuts swallowed: press 'z' / Delete while menu open, clip count stays
      const c0 = await clipCount(page);
      await page.keyboard.press('Delete'); await page.keyboard.press('Control+z');
      r.shortcutsSwallowedClips = [c0, await clipCount(page)];
      r.stillOpen = (await menuInfo(page)).count;
      r.errors = errors; R.EXTRAS = r; await ctx.close();
    }
    result[tag] = R;
    fs.writeFileSync(path.join(OUT, 'rows.json'), JSON.stringify(result, null, 1));
  }
  await browser.close();
  console.log(JSON.stringify(result, null, 1));
})();
