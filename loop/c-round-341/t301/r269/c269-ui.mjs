// C round 269: UI rows DRAG-READOUT, UNDO, LINE-THROUGH, HORIZONTAL-DRAG, PLAY-EDIT, SCREEN-BUDGET, G269-AUTH.
// usage: node c269-ui.mjs <base> <outDir> [headBase]
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, OUT, HEAD] = process.argv.slice(2);
const out = { base: BASE, head: HEAD ?? null, started: new Date().toISOString() };
const save = () => writeFileSync(path.join(OUT, 'ui.json'), JSON.stringify(out, null, 1));
const db = (g) => (g > 0 ? 20 * Math.log10(g) : -Infinity);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });

async function open(base, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errs = { page: [], console: [] };
  page.on('pageerror', (e) => errs.page.push(String(e).slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL/i.test(m.text())) errs.console.push(m.text().slice(0, 200)); });
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 180000 });
  await page.waitForTimeout(1000);
  return { ctx, page, errs };
}
async function addClip(page) {
  await page.getByRole('option').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await page.evaluate(() => document.activeElement?.blur());
}
const env = (page) => page.evaluate(() => document.querySelector('[data-clip-id]')?.getAttribute('data-envelope'));
const status = (page) => page.evaluate(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim());
async function pointsInfo(page) {
  return page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-clip-envelope-point"]')].map((p) => {
    const b = p.getBoundingClientRect(); const pb = p.parentElement.getBoundingClientRect();
    return { cx: b.x + b.width / 2, cy: b.y + b.height / 2, depth: (b.y + b.height / 2 - pb.y) / pb.height, top: p.style.top, gain: p.getAttribute('data-gain'), title: p.getAttribute('title'), parentTop: pb.y, parentH: pb.height };
  }));
}
async function lineScreen(page) {
  return page.evaluate(() => {
    const pl = document.querySelector('[data-testid="arrangement-clip-envelope-line"] polyline');
    if (!pl) return null;
    const m = pl.getScreenCTM(); const svg = pl.ownerSVGElement;
    return { raw: pl.getAttribute('points'), pts: [...pl.points].map((q) => { const s = new DOMPoint(q.x, q.y).matrixTransform(m); return { x: s.x, y: s.y }; }) };
  });
}
function lineYAt(line, x) {
  const p = line.pts;
  for (let i = 1; i < p.length; i++) if (x >= p[i - 1].x && x <= p[i].x) { const f = p[i].x === p[i - 1].x ? 0 : (x - p[i - 1].x) / (p[i].x - p[i - 1].x); return p[i - 1].y + f * (p[i].y - p[i - 1].y); }
  return null;
}
async function drag(page, idx, dx, dy, opts = {}) {
  const pts = await pointsInfo(page); const p = pts[idx];
  await page.mouse.move(p.cx, p.cy); await page.mouse.down();
  const steps = opts.steps ?? 6;
  for (let s = 1; s <= steps; s++) await page.mouse.move(p.cx + (dx * s) / steps, p.cy + (dy * s) / steps);
  const during = opts.readDuring ? await status(page) : null;
  await page.mouse.up(); await page.waitForTimeout(350);
  return { from: { x: p.cx, y: p.cy }, during };
}
async function undo(page) { await page.evaluate(() => document.activeElement?.blur()); await page.keyboard.press('Control+z'); await page.waitForTimeout(300); }
async function redo(page) { await page.evaluate(() => document.activeElement?.blur()); await page.keyboard.press('Control+Shift+z'); await page.waitForTimeout(300); }
async function screenLines(page) {
  return page.evaluate(() => {
    const ex = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const lines = new Set(); const texts = [];
    let n;
    while ((n = walker.nextNode())) {
      const t = n.textContent.trim(); if (!t) continue;
      const el = n.parentElement; if (!el || (ex && ex.contains(el))) continue;
      if (el.closest('[role=dialog],[role=tooltip],script,style,noscript,[aria-hidden=true],.sr-only')) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const rc of r.getClientRects()) { if (rc.width < 1 || rc.height < 1 || rc.bottom < 0 || rc.top > innerHeight || rc.right < 0 || rc.left > innerWidth) continue; lines.add(`${Math.round(rc.top)}:${Math.round(rc.left / 4)}`); }
      texts.push(t.slice(0, 40));
    }
    const rows = new Set([...lines].map((k) => k.split(':')[0]));
    return { lineBoxes: lines.size, rows: rows.size, texts: texts.length };
  });
}

for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const key = `${w}x${h}`; const r = (out[key] = {});
  // SCREEN-BUDGET (normal state: empty + one clip), current vs HEAD
  for (const [tag, base] of [['current', BASE], ...(HEAD ? [['head', HEAD]] : [])]) {
    const { ctx, page } = await open(base, w, h);
    const empty = await screenLines(page);
    await page.screenshot({ path: path.join(OUT, `${tag}-empty-${key}.png`) });
    await addClip(page);
    const one = await screenLines(page);
    await page.getByTestId('arrangement-envelope-toggle').click(); await page.waitForTimeout(300);
    const envOn = await screenLines(page);
    await page.screenshot({ path: path.join(OUT, `${tag}-clip-env-${key}.png`) });
    (r.screen ??= {})[tag] = { empty, one, envOn };
    await ctx.close();
  }
  save();
  const { ctx, page, errs } = await open(BASE, w, h);
  r.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
  await addClip(page);
  await page.getByTestId('arrangement-envelope-toggle').click(); await page.waitForTimeout(300);
  const ed = await page.getByTestId('arrangement-clip-envelope-editor').first().boundingBox();
  r.editor = ed;
  await page.mouse.dblclick(ed.x + 20, ed.y + 5); await page.waitForTimeout(300);
  const base0 = await env(page); r.base0 = base0;
  const bodyH = (await pointsInfo(page))[0].parentH; r.bodyH = bodyH;
  // DRAG-READOUT + UNDO
  r.drag = [];
  for (const f of [0.25, 0.5, 0.75]) {
    const before = await env(page);
    const d = await drag(page, 0, 0, f * bodyH, { readDuring: true });
    const after = await env(page); const pi = (await pointsInfo(page))[0]; const st = await status(page);
    const gain = Number(pi.gain);
    await undo(page); const afterUndo = await env(page);
    await redo(page); const afterRedo = await env(page);
    await undo(page); const back = await env(page);
    r.drag.push({ f, want: -60 * f, during: d.during, status: st, title: pi.title, gain: pi.gain, gainDb: +db(gain).toFixed(2), depth: +pi.depth.toFixed(4), wantDepth: f, before, after, undoExact: afterUndo === before, redoExact: afterRedo === after, back });
  }
  {
    const before = await env(page);
    await drag(page, 0, 0, bodyH * 1.6);
    const pi = (await pointsInfo(page))[0];
    r.bottom = { status: await status(page), title: pi.title, gain: pi.gain, depth: +pi.depth.toFixed(4), env: await env(page) };
    await undo(page); r.bottom.undoExact = (await env(page)) === before;
  }
  save();
  // LINE-THROUGH: p1 0 dB, p2 at x+220 dragged to -30 dB
  await page.mouse.dblclick(ed.x + 220, ed.y + 5); await page.waitForTimeout(300);
  await drag(page, 1, 0, 0.5 * bodyH);
  r.lt = { env: await env(page) };
  {
    const pts = await pointsInfo(page); const line = await lineScreen(page);
    r.lt.pointVsLine = pts.map((p) => ({ cx: +p.cx.toFixed(2), cy: +p.cy.toFixed(2), lineY: +lineYAt(line, p.cx).toFixed(2), dy: +(lineYAt(line, p.cx) - p.cy).toFixed(3) }));
    r.lt.line = line.raw;
    const mx = (pts[0].cx + pts[1].cx) / 2; const my = lineYAt(line, mx);
    await page.mouse.dblclick(mx, my); await page.waitForTimeout(300);
    const e = await env(page); r.lt.addMeanEnv = e;
    const parts = e.split(';').map((s) => s.split(':').map(Number));
    const [a, m, b] = parts; const fr = (m[0] - a[0]) / (b[0] - a[0]);
    r.lt.addMean = { dB: +db(m[1]).toFixed(3), wantMid: +((db(a[1]) + db(b[1])) / 2).toFixed(3), wantAtTime: +(db(a[1]) + (db(b[1]) - db(a[1])) * fr).toFixed(3) };
    await undo(page); r.lt.undoAddExact = (await env(page)) === r.lt.env;
  }
  // HORIZONTAL-DRAG on the -30 dB point (index 1)
  {
    const before = await env(page); const g0 = (await pointsInfo(page))[1].gain;
    await drag(page, 1, 40, 0);
    const after = await env(page); const g1 = (await pointsInfo(page))[1].gain;
    await undo(page); const u = await env(page);
    r.horizontal = { before, after, gainBefore: g0, gainAfter: g1, gainSame: g0 === g1, timeMoved: before !== after, oneEntryUndoExact: u === before };
  }
  // one -inf neighbour: drag p2 to bottom, add at mid -> depth midpoint (-30 dB)
  {
    await drag(page, 1, 0, bodyH * 1.6);
    const pts = await pointsInfo(page); const line = await lineScreen(page);
    r.lt.pointVsLineInf = pts.map((p) => ({ cy: +p.cy.toFixed(2), lineY: +lineYAt(line, p.cx).toFixed(2), dy: +(lineYAt(line, p.cx) - p.cy).toFixed(3) }));
    const mx = (pts[0].cx + pts[1].cx) / 2;
    await page.mouse.dblclick(mx, lineYAt(line, mx)); await page.waitForTimeout(300);
    const e = await env(page); const parts = e.split(';').map((s) => s.split(':').map(Number));
    const [a, m, b] = parts; const fr = (m[0] - a[0]) / (b[0] - a[0]);
    r.lt.addInf = { env: e, dB: +db(m[1]).toFixed(3), wantMid: -30, wantAtTime: +(-60 * fr).toFixed(3) };
    await page.screenshot({ path: path.join(OUT, `line-through-${key}.png`) });
    await undo(page);
  }
  save();
  // PLAY-EDIT
  {
    const before = await env(page);
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Home'); await page.waitForTimeout(200);
    await page.keyboard.press('Space'); await page.waitForTimeout(1200);
    const pos = [];
    const poll = setInterval(async () => { try { pos.push(await page.evaluate(() => document.querySelector('[data-testid="arrangement-position"]')?.textContent?.trim())); } catch {} }, 100);
    await drag(page, 0, 0, 0.25 * bodyH, { steps: 8 });
    await page.waitForTimeout(1500);
    clearInterval(poll);
    const playingAfter = await page.evaluate(() => document.querySelector('[data-testid="arrangement-position"]')?.textContent?.trim());
    const afterDrag = await env(page);
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Space'); await page.waitForTimeout(300);
    await undo(page); const u = await env(page);
    const ts = pos.filter(Boolean).map((p) => { const [mm, ss] = p.split(':'); return Number(mm) * 60 + Number(ss); });
    r.playEdit = { before, afterDrag, changed: afterDrag !== before, undoOnceExact: u === before, positions: ts.length, monotonic: ts.every((v, i) => i === 0 || v >= ts[i - 1]), first: ts[0], last: ts[ts.length - 1], playingAfter };
  }
  r.errors = errs;
  await ctx.close();
  save();
}
// G269-AUTH
{
  const a = (out.auth = {});
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 180000 });
  a.lab = { url: page.url(), lanes: await page.locator('[data-track-id]').count(), authUser: await page.evaluate(() => localStorage.getItem('auth_user')), cookies: (await ctx.cookies()).map((c) => c.name) };
  await page.screenshot({ path: path.join(OUT, 'auth-lab-1440x900.png') });
  const p2 = await ctx.newPage(); const reqs = [];
  p2.on('request', (q) => { if (/\.(wav|mp3)(\?|$)|studio-token/.test(q.url())) reqs.push(q.url()); });
  await p2.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load', timeout: 120000 }).catch((e) => { a.productGotoError = String(e).slice(0, 200); });
  await p2.waitForTimeout(3000);
  a.product = { url: p2.url(), signInRequired: await p2.getByText('Sign in required', { exact: false }).count(), audioSrc: await p2.locator('audio[src]').count(), audioRequests: reqs, authUser: await p2.evaluate(() => localStorage.getItem('auth_user')) };
  await p2.screenshot({ path: path.join(OUT, 'auth-product-1440x900.png') });
  await ctx.close();
  const api = await browser.newContext();
  const u = `${BASE}/api/studio-token?product=middle-east&file=stem-1.wav`;
  const x = await api.request.get(u, { failOnStatusCode: false });
  const y = await api.request.get(u, { headers: { Authorization: 'Bearer fake.token.value' }, failOnStatusCode: false });
  const xt = await x.text(); const yt = await y.text();
  a.api = { noHeader: { status: x.status(), body: xt.slice(0, 160), tokenLike: /"token"\s*:\s*"[^"]+"/.test(xt) }, fakeBearer: { status: y.status(), body: yt.slice(0, 160), tokenLike: /"token"\s*:\s*"[^"]+"/.test(yt) } };
  await api.close();
}
out.finished = new Date().toISOString();
save();
await browser.close();
console.log('done');
