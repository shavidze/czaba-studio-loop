// usage: node narrow-491.mjs <base> <out.json> <shotdir> <tag>
// B round 491 planning probe: Account Profile name editor geometry and reachability.
// Signed-in stub (L36); /api/downloads stubbed 200 [] because the loop mock API on :5199 answers 401 there, which triggers refresh -> logout.
// Signed-in stub (L36): auth_user with stub accessToken; GET/PUT /api/auth/profile stubbed; PUT delayed 600 ms.
// Viewports 1440x900, 1280x720 (mouse), 375x812, 360x780, 320x640 (hasTouch: mouse click + touchscreen tap).
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE = 'http://127.0.0.1:5173', OUT = '/tmp/n491.json', SHOTS = '/tmp/n491-shots', TAG = 'head'] = process.argv.slice(2);
mkdirSync(SHOTS, { recursive: true });
const LONG_FIRST = 'Maximiliana-Alessandra';
const LONG_LAST = 'Tchkhartishvili-Montgomery';
const out = { base: BASE, tag: TAG, rows: {} };
const browser = await chromium.launch();
const geo = (page) => page.evaluate(() => {
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x * 10) / 10, Math.round(b.y * 10) / 10, Math.round(b.width * 10) / 10, Math.round(b.height * 10) / 10]; };
  const label = [...document.querySelectorAll('p')].find((p) => p.textContent?.trim() === 'Full Name');
  if (!label) return null;
  const el = label.nextElementSibling; const col = label.parentElement;
  const vw = document.documentElement.clientWidth;
  const hit = (b) => { if (!b) return null; const bb = b.getBoundingClientRect(); const cx = bb.x + bb.width / 2; const cy = bb.y + bb.height / 2; if (cx < 0 || cx > vw) return 'offscreen'; const at = document.elementFromPoint(cx, cy); return at === b || b.contains(at) ? 'self' : (at ? at.tagName : 'none'); };
  const inputs = [...el.querySelectorAll('input')].map((i) => ({ ariaLabel: i.getAttribute('aria-label'), value: i.value, box: r(i), scrollW: i.scrollWidth, clientW: i.clientWidth }));
  const buttons = [...el.querySelectorAll('button')].map((b) => ({ ariaLabel: b.getAttribute('aria-label'), disabled: b.disabled, box: r(b), hit: hit(b), rightEdge: Math.round(b.getBoundingClientRect().right * 10) / 10 }));
  const range = document.createRange(); range.selectNodeContents(el); const tb = range.getBoundingClientRect();
  return { editing: el.tagName === 'DIV' && !!el.querySelector('input'), rowBox: r(el), rowClass: el.className, contentBox: [Math.round(tb.x * 10) / 10, Math.round(tb.width * 10) / 10], colBox: r(col), vw,
    docScrollW: document.documentElement.scrollWidth, docClientW: vw, inputs, buttons, labelBox: r(label) };
});
const active = (page) => page.evaluate(() => { const a = document.activeElement; if (!a) return null; const cs = getComputedStyle(a); const b = a.getBoundingClientRect();
  return { tag: a.tagName, ariaLabel: a.getAttribute('aria-label'), text: (a.textContent ?? '').trim().slice(0, 40), focusVisible: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth}`, outlineOffset: cs.outlineOffset, box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)], vw: document.documentElement.clientWidth }; });
for (const [w, h, touch] of [[1440, 900, false], [1280, 720, false], [375, 812, true], [360, 780, true], [320, 640, true]]) {
  const vp = `${w}x${h}`; const rows = {};
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: false });
  const state = { putStatus: 200, puts: [], first: 'Probe', last: 'User' };
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })); } catch {} });
  await ctx.route('**/api/auth/profile', async (r) => {
    const m = r.request().method();
    if (m === 'PUT') { const body = JSON.parse(r.request().postData() || '{}'); state.puts.push({ t: Date.now(), body }); await new Promise((s) => setTimeout(s, 600));
      state.first = body.firstName; state.last = body.lastName;
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: body.firstName, lastName: body.lastName, authProvider: 'Email' } }) }); }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: state.first, lastName: state.last, authProvider: 'Email' } }) });
  });
  await ctx.route('**/api/downloads**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
  const page = await ctx.newPage();
  const fresh = async () => { state.first = 'Probe'; state.last = 'User'; await page.goto(`${BASE}/account`, { waitUntil: 'load' }); await page.getByText('Full Name', { exact: true }).waitFor({ timeout: 20000 }); await page.waitForTimeout(1500); await page.mouse.move(1, h - 2); };
  const openByMouse = async () => { const g = await geo(page); const lb = g.labelBox; await page.mouse.click(lb[0] + 10, lb[1] + lb[3] + 14); await page.waitForTimeout(400); };
  const centre = (b) => [b.box[0] + b.box[2] / 2, b.box[1] + b.box[3] / 2];
  await fresh();
  rows.rest = await geo(page);
  await openByMouse();
  rows.editing = await geo(page);
  await page.screenshot({ path: `${SHOTS}/${TAG}-editing-${vp}.png` });
  // mouse Save
  { const g = rows.editing; const before = state.puts.length; const [x, y] = centre(g.buttons[0]); await page.mouse.click(x, y); await page.waitForTimeout(150); rows.saving = await geo(page); await page.waitForTimeout(1100); rows.mouseSave = { puts: state.puts.length - before, editing: (await geo(page)).editing }; }
  // mouse Cancel
  await fresh(); await openByMouse();
  { const g = await geo(page); const [x, y] = centre(g.buttons[1]); await page.mouse.click(x, y); await page.waitForTimeout(400); rows.mouseCancel = { editing: (await geo(page)).editing, active: await active(page) }; }
  if (touch) {
    await fresh(); await openByMouse();
    { const g = await geo(page); const before = state.puts.length; const [x, y] = centre(g.buttons[0]); await page.touchscreen.tap(x, y); await page.waitForTimeout(1300); rows.tapSave = { puts: state.puts.length - before, editing: (await geo(page)).editing }; }
    await fresh(); await openByMouse();
    { const g = await geo(page); const [x, y] = centre(g.buttons[1]); await page.touchscreen.tap(x, y); await page.waitForTimeout(400); rows.tapCancel = { editing: (await geo(page)).editing }; }
  }
  // long name typed into both inputs
  await fresh(); await openByMouse();
  { await page.keyboard.press('Control+A'); await page.keyboard.type(LONG_FIRST); await page.keyboard.press('Tab'); await page.keyboard.press('Control+A'); await page.keyboard.type(LONG_LAST); await page.waitForTimeout(200);
    rows.longTyped = await geo(page); await page.screenshot({ path: `${SHOTS}/${TAG}-long-${vp}.png` });
    // keyboard focus ring on Save and Cancel
    await page.keyboard.press('Tab'); await page.waitForTimeout(150); rows.kbSave = await active(page);
    await page.keyboard.press('Tab'); await page.waitForTimeout(150); rows.kbCancel = await active(page);
    const b = rows.kbCancel.box; await page.screenshot({ path: `${SHOTS}/${TAG}-ring-${vp}.png`, clip: { x: Math.max(0, b[0] - 40), y: Math.max(0, b[1] - 8), width: Math.min(w - Math.max(0, b[0] - 40), b[2] + 48), height: b[3] + 16 } });
    await page.keyboard.press('Escape'); await page.waitForTimeout(300); }
  // keyboard Enter-save with a long name persists both fields
  await fresh(); await openByMouse();
  { await page.keyboard.press('Control+A'); await page.keyboard.type(LONG_FIRST); const before = state.puts.length; await page.keyboard.press('Enter'); await page.waitForTimeout(1300);
    rows.longSaved = { puts: state.puts.length - before, body: state.puts.at(-1)?.body ?? null, rest: await geo(page) }; }
  out.rows[vp] = rows; await ctx.close();
}
await browser.close();
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('ok', OUT);
