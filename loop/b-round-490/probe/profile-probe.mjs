// usage: node profile-probe.mjs <base> <out.json> <shotdir> <tag> [named|empty]
// Signed-in stub (L36): auth_user with stub accessToken; GET/PUT /api/auth/profile stubbed by method; PUT delayed 600 ms; PUT status switchable.
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE = 'http://127.0.0.1:5173', OUT = '/tmp/pp.json', SHOTS = '/tmp/pp-shots', TAG = 'head', MODE = 'named'] = process.argv.slice(2);
mkdirSync(SHOTS, { recursive: true });
const FIRST = MODE === 'named' ? 'Probe' : '';
const LAST = MODE === 'named' ? 'User' : '';
const out = { base: BASE, tag: TAG, mode: MODE, rows: {} };
const browser = await chromium.launch();
const nameInfo = (page) => page.evaluate(() => {
  const label = [...document.querySelectorAll('p')].find((p) => p.textContent?.trim() === 'Full Name');
  if (!label) return null;
  const el = label.nextElementSibling; const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x * 10) / 10, Math.round(b.y * 10) / 10, Math.round(b.width * 10) / 10, Math.round(b.height * 10) / 10]; };
  const cs = getComputedStyle(el);
  const inputs = [...el.querySelectorAll('input')].map((i) => ({ value: i.value, ariaLabel: i.getAttribute('aria-label'), placeholder: i.placeholder, box: r(i) }));
  const buttons = [...el.querySelectorAll('button')].map((b) => ({ type: b.getAttribute('type'), ariaLabel: b.getAttribute('aria-label'), text: b.textContent.trim(), disabled: b.disabled, box: r(b) }));
  const range = document.createRange(); range.selectNodeContents(el); const tb = range.getBoundingClientRect();
  return { tag: el.tagName, type: el.getAttribute('type'), text: el.textContent.replace(/\s+/g, ' ').trim(), box: r(el), textBox: [Math.round(tb.x * 10) / 10, Math.round(tb.y * 10) / 10, Math.round(tb.width * 10) / 10, Math.round(tb.height * 10) / 10],
    color: cs.color, cursor: cs.cursor, font: `${cs.fontSize} ${cs.fontWeight} ${cs.lineHeight} ${cs.fontFamily.slice(0, 30)}`, textAlign: cs.textAlign, display: cs.display, transform: cs.transform, userSelect: cs.userSelect,
    labelBox: r(label), editing: el.tagName === 'DIV' && !!el.querySelector('input'), inputs, buttons, tabIndex: el.tabIndex };
});
const active = (page) => page.evaluate(() => { const a = document.activeElement; if (!a) return null; const cs = getComputedStyle(a);
  return { tag: a.tagName, type: a.getAttribute('type'), ariaLabel: a.getAttribute('aria-label'), placeholder: a.getAttribute('placeholder'), text: (a.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60), focusVisible: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, outlineOffset: cs.outlineOffset }; });
for (const [w, h] of [[1440, 900], [1280, 720], [375, 812]]) {
  const vp = `${w}x${h}`; const rows = {};
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const state = { putStatus: 200, puts: [], first: FIRST, last: LAST };
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })); } catch {} });
  await ctx.route('**/api/auth/profile', async (r) => {
    const m = r.request().method();
    if (m === 'PUT') { const body = JSON.parse(r.request().postData() || '{}'); state.puts.push({ t: Date.now(), body }); await new Promise((s) => setTimeout(s, 600));
      if (state.putStatus !== 200) return r.fulfill({ status: state.putStatus, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Stub failure' }) });
      state.first = body.firstName; state.last = body.lastName;
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: body.firstName, lastName: body.lastName, authProvider: 'Email' } }) }); }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: state.first, lastName: state.last, authProvider: 'Email' } }) });
  });
  const page = await ctx.newPage();
  const fresh = async () => { await page.goto(`${BASE}/account`, { waitUntil: 'load' }); await page.getByText('Full Name', { exact: true }).waitFor({ timeout: 20000 }); await page.waitForTimeout(1500); await page.mouse.move(1, h - 2); };
  const nameTarget = async () => { const i = await nameInfo(page); return { x: i.textBox[0] + Math.min(20, i.textBox[2] / 2), y: i.textBox[1] + i.textBox[3] / 2, i }; };
  await fresh();
  rows.rest = await nameInfo(page);
  await page.screenshot({ path: `${SHOTS}/${TAG}-${MODE}-rest-${vp}.png` });
  // hover
  { const { x, y } = await nameTarget(); await page.mouse.move(x, y); await page.waitForTimeout(400); rows.hover = await nameInfo(page); await page.screenshot({ path: `${SHOTS}/${TAG}-${MODE}-hover-${vp}.png` });
    const far = [rows.rest.box[0] + rows.rest.box[2] - 4, y]; await page.mouse.move(far[0], far[1]); await page.waitForTimeout(400); rows.hoverRowEnd = { color: (await nameInfo(page)).color, cursor: (await nameInfo(page)).cursor }; await page.mouse.move(1, h - 2); await page.waitForTimeout(300); }
  // Tab walk from the top
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  const stops = [];
  for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(100); const a = await active(page); stops.push(a); }
  rows.tabStops = stops.map((s, i) => `${i + 1}:${s?.tag}:${s?.ariaLabel ?? s?.text}`);
  rows.nameStop = stops.findIndex((s) => s?.tag === 'BUTTON' && (s.text.includes(MODE === 'named' ? 'Probe User' : 'Click to add name'))) + 1;
  // pressed transform + drag selection (mouse)
  await fresh();
  { const { x, y, i } = await nameTarget(); await page.mouse.move(x, y); await page.mouse.down(); await page.waitForTimeout(150);
    rows.pressedTransform = await page.evaluate(() => { const l = [...document.querySelectorAll('p')].find((p) => p.textContent?.trim() === 'Full Name'); return getComputedStyle(l.nextElementSibling).transform; });
    await page.mouse.up(); await page.waitForTimeout(400); rows.afterClick = { name: await nameInfo(page), active: await active(page) };
    await page.screenshot({ path: `${SHOTS}/${TAG}-${MODE}-editing-${vp}.png` }); }
  // Escape closes
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  rows.afterEsc = { editing: (await nameInfo(page)).editing, active: await active(page) };
  // drag-select the visible name (from fresh state)
  await fresh();
  { const i = await nameInfo(page); const y = i.textBox[1] + i.textBox[3] / 2; await page.mouse.move(i.textBox[0] - 2, y); await page.mouse.down(); await page.mouse.move(i.textBox[0] + i.textBox[2] + 2, y, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(300);
    rows.afterDrag = { selection: await page.evaluate(() => String(window.getSelection())), editing: (await nameInfo(page)).editing }; }
  // mouse X cancel
  await fresh();
  { const { x, y } = await nameTarget(); await page.mouse.click(x, y); await page.waitForTimeout(300); const ni = await nameInfo(page); const b = ni.buttons[1]; await page.mouse.click(b.box[0] + b.box[2] / 2, b.box[1] + b.box[3] / 2); await page.waitForTimeout(300); rows.afterMouseCancel = { editing: (await nameInfo(page)).editing, active: await active(page) }; }
  // keyboard path where possible: if name is a Tab stop, Tab to it and Enter
  if (rows.nameStop > 0) {
    await fresh(); await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
    for (let i = 0; i < rows.nameStop; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(100); }
    rows.kbFocused = await active(page);
    const nb = await page.evaluate(() => { const b = document.activeElement.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; });
    await page.screenshot({ path: `${SHOTS}/${TAG}-${MODE}-ring-${vp}.png`, clip: { x: Math.max(0, nb[0] - 8), y: Math.max(0, nb[1] - 8), width: Math.min(w - Math.max(0, nb[0] - 8), nb[2] + 16), height: nb[3] + 16 } });
    await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    rows.kbEnterOpens = { editing: (await nameInfo(page)).editing, active: await active(page), putsSoFar: state.puts.length };
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    rows.kbEsc = { editing: (await nameInfo(page)).editing, active: await active(page) };
    await page.keyboard.press('Space'); await page.waitForTimeout(300);
    rows.kbSpaceOpens = { editing: (await nameInfo(page)).editing, active: await active(page) };
    // Tab through the editor: first, last, save, cancel
    const ed = [await active(page)]; for (let i = 0; i < 3; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(100); ed.push(await active(page)); }
    rows.editorOrder = ed.map((a) => `${a?.tag}:${a?.ariaLabel ?? a?.placeholder ?? a?.text}`);
    await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    rows.kbCancelButton = { editing: (await nameInfo(page)).editing, active: await active(page), puts: state.puts.length };
    // held Enter on the trigger: keydown + 5 repeats, count PUTs
    const before = state.puts.length; await page.keyboard.down('Enter'); for (let i = 0; i < 5; i++) { await page.keyboard.down('Enter'); await page.waitForTimeout(40); } await page.keyboard.up('Enter'); await page.waitForTimeout(1200);
    rows.heldEnterOnTrigger = { puts: state.puts.length - before, editing: (await nameInfo(page)).editing, active: await active(page) };
  }
  // save success by Enter in input
  await fresh();
  { const { x, y } = await nameTarget(); await page.mouse.click(x, y); await page.waitForTimeout(300);
    await page.keyboard.press('Control+A'); await page.keyboard.type('Ada'); const before = state.puts.length; await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    rows.saveInFlight = { name: await nameInfo(page), active: await active(page) };
    await page.waitForTimeout(1200); rows.afterSaveEnter = { puts: state.puts.length - before, body: state.puts.at(-1)?.body ?? null, name: await nameInfo(page), active: await active(page) }; }
  // Escape while the save is in flight (sketch v3: ignored), then the save settles
  await fresh();
  { const { x, y } = await nameTarget(); await page.mouse.click(x, y); await page.waitForTimeout(300); await page.keyboard.press('Control+A'); await page.keyboard.type('Eve'); const before = state.puts.length;
    await page.keyboard.press('Enter'); await page.waitForTimeout(150); await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    rows.escInFlight = { editing: (await nameInfo(page)).editing, active: await active(page) }; await page.waitForTimeout(1200);
    rows.escInFlightSettled = { puts: state.puts.length - before, editing: (await nameInfo(page)).editing, text: (await nameInfo(page)).text, active: await active(page) }; }
  // held Enter in input: count PUTs
  await fresh();
  { const { x, y } = await nameTarget(); await page.mouse.click(x, y); await page.waitForTimeout(300);
    const before = state.puts.length; await page.keyboard.down('Enter'); for (let i = 0; i < 5; i++) { await page.keyboard.down('Enter'); await page.waitForTimeout(40); } await page.keyboard.up('Enter'); await page.waitForTimeout(1500);
    rows.heldEnterInInput = { puts: state.puts.length - before, editing: (await nameInfo(page)).editing, active: await active(page) }; }
  // save by mouse on Check: focus after
  await fresh();
  { const { x, y } = await nameTarget(); await page.mouse.click(x, y); await page.waitForTimeout(300); const ni = await nameInfo(page); const b = ni.buttons[0]; const before = state.puts.length;
    await page.mouse.click(b.box[0] + b.box[2] / 2, b.box[1] + b.box[3] / 2); await page.waitForTimeout(150); rows.mouseSaveInFlight = { active: await active(page) }; await page.waitForTimeout(1200);
    rows.afterMouseSave = { puts: state.puts.length - before, editing: (await nameInfo(page)).editing, active: await active(page) }; }
  // validation failure: empty first name + Enter
  await fresh();
  { const { x, y } = await nameTarget(); await page.mouse.click(x, y); await page.waitForTimeout(300); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace'); const before = state.puts.length; await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    rows.afterValidation = { puts: state.puts.length - before, editing: (await nameInfo(page)).editing, active: await active(page), toast: await page.evaluate(() => document.body.innerText.includes('First name is required')) }; }
  // API failure 500 + Enter
  await fresh(); state.putStatus = 500;
  { const { x, y } = await nameTarget(); await page.mouse.click(x, y); await page.waitForTimeout(300); await page.keyboard.press('Control+A'); await page.keyboard.type('Bob'); const before = state.puts.length; await page.keyboard.press('Enter'); await page.waitForTimeout(1600);
    rows.afterApiFail = { puts: state.puts.length - before, editing: (await nameInfo(page)).editing, active: await active(page) }; }
  state.putStatus = 200;
  // AX snapshot of the profile block
  await fresh();
  rows.aria = await page.locator('main, body').first().ariaSnapshot().then((s) => s.split('\n').filter((l) => /Full Name|Probe|Click to add|button|textbox/.test(l)).slice(0, 30)).catch((e) => String(e));
  out.rows[vp] = rows; await ctx.close();
}
await browser.close();
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('ok', OUT);
