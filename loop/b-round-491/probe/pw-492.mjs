// usage: node pw-492.mjs <base> <out.json> <shotdir> <tag>
// B round 492 planning probe: Account "Change password" dialog semantics, focus entry/trap/return, close paths, in-flight close.
// Signed-in stub (L36): auth_user with stub accessToken; GET/PUT /api/auth/profile stubbed (PUT delayed 600 ms); /api/downloads 200 [] (HF-MOCKAPI-DOWNLOADS-401-SIGNOUT);
// POST /api/auth/login stubbed 200 after 1500 ms (updatePassword's current-password check; app/lib/auth.ts then throws "not yet implemented").
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE = 'http://127.0.0.1:5173', OUT = '/tmp/pw492.json', SHOTS = '/tmp/pw492-shots', TAG = 'head'] = process.argv.slice(2);
mkdirSync(SHOTS, { recursive: true });
const out = { base: BASE, tag: TAG, rows: {} };
const browser = await chromium.launch();
const act = (page) => page.evaluate(() => {
  const a = document.activeElement; if (!a) return null;
  const dlg = document.querySelector('[role="dialog"]');
  const name = a.getAttribute('aria-label') || (a.id && document.querySelector(`label[for="${CSS.escape(a.id)}"]`)?.textContent?.trim()) || (a.textContent ?? '').trim().slice(0, 40);
  const cs = getComputedStyle(a); return { tag: a.tagName, name, inDialog: !!(dlg && dlg.contains(a)), focusVisible: a.matches(':focus-visible'), outline: cs.outlineStyle + ' ' + cs.outlineWidth, focusSource: document.documentElement.getAttribute('data-focus-source') };
});
const dialogs = (page) => page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => ({ modal: d.getAttribute('aria-modal'), name: (d.getAttribute('aria-labelledby') ? document.getElementById(d.getAttribute('aria-labelledby'))?.textContent?.trim() : d.getAttribute('aria-label')) ?? null })));
const modalVisible = (page) => page.getByText('Change Password', { exact: true }).first().isVisible().catch(() => false);
const fieldNames = (page) => page.evaluate(() => { const h = [...document.querySelectorAll('h2')].find((e) => e.textContent?.trim() === 'Change Password'); const box = h?.parentElement; if (!box) return null;
  return { inputs: [...box.querySelectorAll('input')].map((i) => (i.labels && i.labels[0] ? i.labels[0].textContent.trim() : null)), buttons: [...box.querySelectorAll('button')].map((b) => b.getAttribute('aria-label') || b.textContent.trim()) }; });
for (const [w, h, touch] of [[1440, 900, false], [1280, 720, false], [375, 812, true]]) {
  const vp = `${w}x${h}`; const rows = {}; const consoleErrors = [];
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch });
  const state = { puts: 0, logins: 0 };
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })); } catch {} });
  await ctx.route('**/api/auth/profile', async (r) => { if (r.request().method() === 'PUT') { state.puts++; await new Promise((s) => setTimeout(s, 600)); }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: 'Probe', lastName: 'User', authProvider: 'Email' } }) }); });
  await ctx.route('**/api/downloads**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
  await ctx.route('**/api/auth/login', async (r) => { state.logins++; await new Promise((s) => setTimeout(s, 1500));
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { accessToken: 'stub-token', refreshToken: 'stub-refresh', expiresAt: '2099-01-01T00:00:00Z', user: { id: 7, email: 'probe@example.invalid', firstName: 'Probe', lastName: 'User', authProvider: 'Email' } } }) }); });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror ${String(e).slice(0, 160)}`));
  const fresh = async () => { await page.goto(`${BASE}/account`, { waitUntil: 'load' }); await page.getByText('Click to change password').waitFor({ timeout: 20000 }); await page.waitForTimeout(1500); await page.mouse.move(1, h - 2); };
  const openMouse = async () => { await page.getByText('Click to change password').click(); await page.waitForTimeout(500); };
  const openKeyboard = async () => { await page.getByText('Click to change password').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500); };
  const fill = async () => { const inp = page.locator('h2:text-is("Change Password") + form input'); await inp.nth(0).fill('old-pass-1'); await inp.nth(1).fill('new-pass-12'); await inp.nth(2).fill('new-pass-12'); };
  // R1 open by mouse: semantics + initial focus
  await fresh(); await openMouse();
  rows.R1_openMouse = { dialogs: await dialogs(page), active: await act(page), fields: await fieldNames(page) };
  await page.screenshot({ path: `${SHOTS}/${TAG}-open-${vp}.png` });
  // R6 pointer outside: header centre and page corner hit the backdrop?
  rows.R6_outsideHits = await page.evaluate(() => { const hd = document.querySelector('header'); const b = hd?.getBoundingClientRect(); const pts = b ? [[b.x + b.width / 2, b.y + b.height / 2], [b.x + 30, b.y + b.height / 2], [b.right - 30, b.y + b.height / 2]] : [];
    return pts.map(([x, y]) => { const e = document.elementFromPoint(x, y); return { x: Math.round(x), y: Math.round(y), hitTag: e?.tagName ?? null, inHeader: !!(hd && e && hd.contains(e)) }; }); });
  // R0 control: Tab from the trigger with no dialog open
  await fresh(); await page.getByText('Click to change password').focus(); await page.keyboard.press('Tab'); await page.waitForTimeout(150); rows.R0_tabFromTriggerNoDialog = await act(page);
  await fresh(); await openMouse();
  // R2 Tab x8 then Shift+Tab x2 (keyboard)
  { const seq = []; for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(120); seq.push(await act(page)); }
    const back = []; await page.locator('h2:text-is("Change Password") + form input').first().focus().catch(() => {}); for (let i = 0; i < 2; i++) { await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(120); back.push(await act(page)); }
    rows.R2_tabs = { forward: seq, backFromFirst: back }; }
  // R3 Esc (keyboard close) -> focus return + ring
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  rows.R3_esc = { dialogs: await dialogs(page), visible: await modalVisible(page), active: await act(page) };
  // R3b keyboard open -> initial focus
  await fresh(); await openKeyboard(); rows.R3b_openKeyboard = { dialogs: await dialogs(page), active: await act(page) };
  await page.keyboard.press('Escape'); await page.waitForTimeout(700); rows.R3b_escAfterKeyboardOpen = { visible: await modalVisible(page), active: await act(page) };
  // R4 mouse Cancel, backdrop click
  await fresh(); await openMouse(); await page.getByRole('button', { name: 'Cancel', exact: true }).click(); await page.waitForTimeout(700);
  rows.R4_mouseCancel = { visible: await modalVisible(page), active: await act(page) };
  await openMouse(); await page.mouse.click(Math.round(w / 2), 70); await page.waitForTimeout(700);
  rows.R4_backdrop = { visible: await modalVisible(page), active: await act(page) };
  // R5 click the heading (non-focusable) then Tab
  await fresh(); await openMouse(); await page.getByText('Change Password', { exact: true }).click(); await page.waitForTimeout(200);
  rows.R5_afterHeadingClick = await act(page); await page.keyboard.press('Tab'); await page.waitForTimeout(150); rows.R5_tabAfterHeading = await act(page);
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  // R7 in-flight: Update (login delayed 1.5 s), Esc at +200 ms, Tab at +60 ms after Esc, settle
  await fresh(); await openMouse(); await fill(); await page.getByRole('button', { name: 'Update Password' }).click(); await page.waitForTimeout(200);
  rows.R7_inflight = { activeBeforeEsc: await act(page) };
  await page.keyboard.press('Escape'); await page.waitForTimeout(60); rows.R7_inflight.afterEsc = await act(page); rows.R7_inflight.exitingInert = await page.evaluate(() => { const d = document.querySelector('[role="dialog"]'); return d ? d.inert : null; });
  await page.keyboard.press('Tab'); await page.waitForTimeout(100); rows.R7_inflight.tabInExitWindow = await act(page);
  await page.waitForTimeout(2600); rows.R7_inflight.afterSettle = { active: await act(page), visible: await modalVisible(page), logins: state.logins };
  // R8 double Esc during the fade
  await fresh(); await openMouse(); await page.keyboard.press('Escape'); await page.waitForTimeout(40); await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  rows.R8_doubleEsc = { visible: await modalVisible(page), active: await act(page) };
  // R11 reopen while the closed dialog still fades (Esc, then Enter on the trigger 60 ms later)
  await fresh(); await openKeyboard(); await page.keyboard.press('Escape'); await page.waitForTimeout(60); await page.keyboard.press('Enter'); await page.waitForTimeout(600);
  rows.R11_reopenDuringFade = { dialogs: await dialogs(page), active: await act(page), inert: await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => d.inert)) };
  await page.keyboard.press('Tab'); await page.waitForTimeout(150); rows.R11_reopenDuringFade.afterTab = await act(page);
  // R9 error path (login 200 then the not-implemented throw)
  await fresh(); await openMouse(); await fill(); await page.getByRole('button', { name: 'Update Password' }).click(); await page.waitForTimeout(2400);
  rows.R9_errorPath = { visible: await modalVisible(page), error: await page.locator('p.text-destructive').first().textContent().catch(() => null), alertText: await page.evaluate(() => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent.trim()).filter(Boolean)), active: await act(page) };
  await page.screenshot({ path: `${SHOTS}/${TAG}-error-${vp}.png` });
  // R10 name save in flight, open the password dialog by mouse, settle
  await fresh(); await page.getByRole('button', { name: /Full Name/ }).click(); await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Save name' }).click(); await page.waitForTimeout(100); await openMouse(); rows.R10_nameSave = { beforeSettle: await act(page) };
  await page.waitForTimeout(1200); rows.R10_nameSave.afterSettle = await act(page); rows.R10_nameSave.visible = await modalVisible(page); rows.R10_nameSave.puts = state.puts;
  rows.consoleErrors = consoleErrors.filter((t) => !/Failed to load cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL|net::/.test(t));
  out.rows[vp] = rows; await ctx.close();
}
await browser.close();
writeFileSync(OUT, JSON.stringify(out, null, 1));
