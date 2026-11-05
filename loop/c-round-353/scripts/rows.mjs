import { createRequire } from 'node:module';
import { writeFileSync, readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-353';
const res = {};
const browser = await chromium.launch();
const ready = async (page) => {
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(1000);
};
const addTo = async (page, track, name) => {
  const hdr = page.getByTestId('arrangement-track-header').filter({ hasText: track }).first();
  await hdr.getByText(new RegExp('^' + track)).first().click();
  await page.waitForTimeout(250);
  await page.getByRole('button', { name: 'All' }).first().click().catch(() => {});
  await page.getByTestId('arrangement-library-list').getByRole('option', { name: new RegExp(name) }).first().click();
  await page.waitForTimeout(250);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const k = `${w}x${h}`; const r = res[k] = {};
  // AUTH
  {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await ready(page);
    r.labBadge = await page.evaluate(() => /demo/i.test(document.body.innerText));
    r.labTitle = await page.title();
    r.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.screenshot({ path: `${OUT}/screens/auth-lab-${k}.png` });
    await page.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForTimeout(2500);
    const body = await page.evaluate(() => document.body.innerText);
    r.studioSignIn = /Sign in required/i.test(body);
    r.studioWorkspace = await page.locator('[data-testid="arrangement-timeline-scroller"]').count();
    r.studioAudioSrc = await page.locator('audio[src]').count();
    r.studioBodyLen = body.length;
    r.studioBodyHead = body.replace(/\s+/g, ' ').slice(0, 200);
    await page.screenshot({ path: `${OUT}/screens/auth-studio-${k}.png` });
    const t1 = await ctx.request.get('http://127.0.0.1:5173/api/studio-token');
    r.tokenNoHeader = { status: t1.status(), body: (await t1.text()).slice(0, 150) };
    const t2 = await ctx.request.get('http://127.0.0.1:5173/api/studio-token', { headers: { Authorization: 'Bearer fake.fake.fake' } });
    r.tokenFake = { status: t2.status(), body: (await t2.text()).slice(0, 150) };
    const t3 = await ctx.request.post('http://127.0.0.1:5173/api/studio-token', { data: {}, headers: { Authorization: 'Bearer fake.fake.fake' } });
    r.tokenFakePost = { status: t3.status(), body: (await t3.text()).slice(0, 150) };
    await ctx.close();
  }
  // SMOKE + SR measurements
  {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await ready(page);
    await addTo(page, 'Stems', 'Bass');
    const clip = page.locator('[data-clip-id]').first();
    r.clipTrack = await clip.evaluate((c) => c.closest('[data-track-id]')?.getAttribute('data-track-id'));
    const play = page.getByRole('button', { name: /^Play/ }).first();
    r.playingStates = [await play.getAttribute('data-playing')];
    await play.click(); await page.waitForTimeout(1500);
    r.playingStates.push(await play.getAttribute('data-playing'));
    r.position = (await page.getByTestId('arrangement-position').textContent()).trim();
    const stop = page.getByRole('button', { name: /^(Stop|Pause|Play)/ }).first();
    await page.keyboard.press('Space').catch(() => {}); await page.waitForTimeout(500);
    let st = await play.getAttribute('data-playing');
    if (st === 'true') { await play.click(); await page.waitForTimeout(500); st = await play.getAttribute('data-playing'); }
    r.playingStates.push(st);
    // drag name bar
    const tracks = await page.locator('[data-track-id]').evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().width > 300).map((e) => ({ id: e.getAttribute('data-track-id'), top: Math.round(e.getBoundingClientRect().top), h: Math.round(e.getBoundingClientRect().height) })));
    r.tracks = tracks;
    const cb = await clip.boundingBox();
    const scrollerBox = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
    r.clipBox = cb; r.scrollerBox = scrollerBox;
    r.clipLeftBeyondRight = null;
    const idx = tracks.findIndex((t) => t.id === r.clipTrack);
    let target = tracks[idx + 1] || tracks[idx - 1];
    r.dragFrom = r.clipTrack; r.dragTo = target?.id;
    const undoBefore = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title').catch(() => null);
    r.undoTitleBefore = undoBefore;
    const sx = cb.x + Math.min(40, cb.width / 2), sy = cb.y + 6;
    await page.mouse.move(sx, sy); await page.mouse.down();
    const ty = target.top + target.h / 2 - (cb.height / 2 - 6);
    for (let i = 1; i <= 12; i++) { await page.mouse.move(sx, sy + (ty - sy) * i / 12); await page.waitForTimeout(30); }
    await page.mouse.up(); await page.waitForTimeout(500);
    r.laneAfter = await page.locator('[data-clip-id]').first().evaluate((c) => c.closest('[data-track-id]')?.getAttribute('data-track-id'));
    r.undoTitleAfter = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title').catch(() => null);
    await page.screenshot({ path: `${OUT}/screens/smoke-moved-${k}.png` });
    await page.keyboard.press('Control+z'); await page.waitForTimeout(500);
    r.laneAfterUndo = await page.locator('[data-clip-id]').first().evaluate((c) => c.closest('[data-track-id]')?.getAttribute('data-track-id'));
    // export dialog measurement
    await page.getByRole('button', { name: /^Export/ }).first().click();
    await page.waitForTimeout(800);
    const dlg = page.getByRole('dialog').first();
    r.dialog = await dlg.evaluate((d) => { const b = d.getBoundingClientRect(); const sc = [d, ...d.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 1 && ['auto','scroll'].includes(getComputedStyle(e).overflowY)).map((e) => ({ tag: e.tagName, sh: e.scrollHeight, ch: e.clientHeight })); return { top: b.top, bottom: b.bottom, vh: innerHeight, scrollables: sc }; });
    r.rangeOptions = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] *')].filter((e) => /Range|Entire project|Selection|Loop/i.test(e.textContent || '') && e.children.length === 0).map((e) => { const b = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 40), top: Math.round(b.top), bottom: Math.round(b.bottom), vh: innerHeight }; }).slice(0, 12));
    await page.screenshot({ path: `${OUT}/screens/export-dialog-${k}.png` });
    // WAV export
    const dl = page.waitForEvent('download', { timeout: 120000 }).catch(() => null);
    const opt = dlg.getByRole('button', { name: /^Export/ }).last();
    await opt.click().catch(async () => { r.exportClickErr = true; });
    const d = await dl;
    if (d) { const p = `${OUT}/export-${k}.wav`; await d.saveAs(p); r.wavName = d.suggestedFilename(); }
    else r.wavName = null;
    writeFileSync(`${OUT}/rows-${k}.json`, JSON.stringify(r, null, 1));
    await ctx.close();
  }
  // SR-353-1 (journey: add 4 stems then measure)
  {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab?preview=middle-east', { waitUntil: 'networkidle' });
    await ready(page);
    for (const part of ['Pulse', 'Bass', 'Pad', 'Melody']) await addTo(page, 'Stems', part);
    r.sr1 = await page.evaluate(() => { const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect(); const cs = [...document.querySelectorAll('[data-clip-id]')]; const last = cs[cs.length - 1]; const b = last.getBoundingClientRect(); return { scrollerLeft: sc.left, scrollerRight: sc.right, innerWidth, lastName: last.textContent.trim().slice(0, 30), lastLeft: b.left, lastRight: b.right, beyond: b.left >= sc.right, scrollLeft: document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft }; });
    await ctx.close();
  }
  writeFileSync(`${OUT}/rows-${k}.json`, JSON.stringify(r, null, 1));
}
await browser.close();
writeFileSync(`${OUT}/rows.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
