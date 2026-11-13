// usage: node extra-487.mjs <base> <out.json>
// Rows: pressed transform on the name text; drag from outside the button and from on the text; held Enter with an
// instant PUT (repeats outlive the save, so they reach the name button); keyboard Save (Tab to "Save name", Enter) with PUT 500.
import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, OUT] = process.argv.slice(2); const out = {};
const b = await chromium.launch();
const el = (page) => page.evaluate(() => { const l = [...document.querySelectorAll('p')].find((p) => p.textContent?.trim() === 'Full Name'); const e = l.nextElementSibling; const r = document.createRange(); r.selectNodeContents(e); const t = r.getBoundingClientRect(); return { tag: e.tagName, editing: !!e.querySelector('input'), text: e.textContent.trim(), tb: [t.x, t.y, t.width, t.height], box: (() => { const q = e.getBoundingClientRect(); return [q.x, q.y, q.width, q.height]; })() }; });
const active = (page) => page.evaluate(() => { const a = document.activeElement; return { tag: a.tagName, label: a.getAttribute('aria-label'), text: a.textContent.trim().slice(0, 40), focusVisible: a.matches(':focus-visible') }; });
for (const [w, h] of [[1440, 900], [1280, 720], [375, 812]]) {
  const vp = `${w}x${h}`; const rows = {};
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const st = { delay: 0, status: 200, puts: 0, first: 'Probe', last: 'User' };
  await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })); });
  await ctx.route('**/api/auth/profile', async (r) => {
    if (r.request().method() === 'PUT') { st.puts++; const body = JSON.parse(r.request().postData() || '{}'); if (st.delay) await new Promise((s) => setTimeout(s, st.delay));
      if (st.status !== 200) return r.fulfill({ status: st.status, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Stub failure' }) });
      st.first = body.firstName; st.last = body.lastName; }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: st.first, lastName: st.last, authProvider: 'Email' } }) });
  });
  const page = await ctx.newPage();
  const fresh = async () => { await page.goto(`${BASE}/account`, { waitUntil: 'load' }); await page.getByText('Full Name', { exact: true }).waitFor({ timeout: 20000 }); await page.waitForTimeout(1500); await page.mouse.move(1, h - 2); };
  // pressed transform on the text
  await fresh(); { const e = await el(page); await page.mouse.move(e.tb[0] + 10, e.tb[1] + e.tb[3] / 2); await page.mouse.down(); await page.waitForTimeout(150);
    rows.pressedTransform = await page.evaluate(() => { const l = [...document.querySelectorAll('p')].find((p) => p.textContent?.trim() === 'Full Name'); return getComputedStyle(l.nextElementSibling).transform; }); await page.mouse.up(); await page.waitForTimeout(300); }
  // drag from outside (2 px left of the row) across the text
  await fresh(); { const e = await el(page); const y = e.tb[1] + e.tb[3] / 2; await page.mouse.move(e.box[0] - 2, y); await page.mouse.down(); await page.mouse.move(e.tb[0] + e.tb[2] + 2, y, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(300);
    rows.dragFromOutside = { selection: await page.evaluate(() => String(window.getSelection())), editing: (await el(page)).editing }; }
  // drag starting on the text (2 px into it) to past its end, inside the row
  await fresh(); { const e = await el(page); const y = e.tb[1] + e.tb[3] / 2; await page.mouse.move(e.tb[0] + 2, y); await page.mouse.down(); await page.mouse.move(e.tb[0] + e.tb[2] + 4, y, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(300);
    rows.dragOnText = { selection: await page.evaluate(() => String(window.getSelection())), editing: (await el(page)).editing }; }
  // double-click on the text
  await fresh(); { const e = await el(page); await page.mouse.dblclick(e.tb[0] + 10, e.tb[1] + e.tb[3] / 2); await page.waitForTimeout(300);
    rows.dblclick = { selection: await page.evaluate(() => String(window.getSelection())), editing: (await el(page)).editing }; }
  // held Enter with an instant PUT: open by mouse, hold Enter 1 + 15 repeats at 40 ms (repeats outlive the save)
  st.delay = 0; await fresh(); { const e = await el(page); await page.mouse.click(e.tb[0] + 10, e.tb[1] + e.tb[3] / 2); await page.waitForTimeout(300); const p0 = st.puts;
    await page.keyboard.down('Enter'); for (let i = 0; i < 15; i++) { await page.keyboard.down('Enter'); await page.waitForTimeout(40); } await page.keyboard.up('Enter'); await page.waitForTimeout(800);
    rows.heldEnterFastSave = { puts: st.puts - p0, editing: (await el(page)).editing, active: await active(page) }; }
  // keyboard Save with PUT 500: open by mouse, Tab twice to "Save name", Enter
  st.status = 500; st.delay = 300; await fresh(); { const e = await el(page); await page.mouse.click(e.tb[0] + 10, e.tb[1] + e.tb[3] / 2); await page.waitForTimeout(300);
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(100); rows.kbSaveFocused = await active(page); const p0 = st.puts;
    await page.keyboard.press('Enter'); await page.waitForTimeout(1000);
    rows.kbSaveApiFail = { puts: st.puts - p0, editing: (await el(page)).editing, active: await active(page) }; }
  st.status = 200; st.delay = 0;
  out[vp] = rows; await ctx.close();
}
await b.close(); writeFileSync(OUT, JSON.stringify(out, null, 1)); console.log('ok');
