// PERF-14b-ii probe (B round 401 -> 402 planning). Data only; no app code.
// Usage: node pin-blur-group.cjs <baseURL> <out.json> [viewport WxH]
// Builds 30 audio clips (Add, name-bar click, Ctrl+D x29 waited on the lane data-clip-count), then:
//  A. a held name-bar press on a mounted clip (0..~4054 px) survives a 6-page scroll that leaves it
//     outside the page window (gesture pin); a window blur while
//     the button is still held unpins it, so the next page scroll unmounts it; release; the model keeps 30
//     clips and the Undo title is unchanged (the claim's blur aborts the gesture).
//  B. Ctrl+A, then a same-lane group drag on clip 0; mid-gesture the timeline scrolls to member 20 (outside
//     the page window at rest); the member mounts at its preview start (delta equal to the pressed clip's);
//     release commits one Move (30) entry; Ctrl+Z restores the member's start.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const [base, out, vp = '1440x900'] = process.argv.slice(2);
const [w, h] = vp.split('x').map(Number);
const audio = '[data-clip-kind="audio"]';
const N = 30;
const MEMBER = 20;

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 180000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /Demo collection ready/ }).waitFor({ timeout: 120000 });
  await page.waitForTimeout(1000);
  const modelCount = () => page.evaluate(() => Math.max(0, ...[...document.querySelectorAll('[data-track-id][data-clip-count]')].map((l) => Number(l.getAttribute('data-clip-count')))));
  const undoTitle = () => page.evaluate(() => document.querySelector('button[aria-keyshortcuts="Control+Z"]')?.getAttribute('title') ?? document.querySelector('button[title^="Undo"]')?.getAttribute('title') ?? null);
  const scroller = () => page.evaluate(() => {
    let s = document.querySelector('[data-testid="arrangement-ruler"]')?.parentElement ?? null;
    while (s && !(s.scrollWidth > s.clientWidth && ['auto', 'scroll'].includes(getComputedStyle(s).overflowX))) s = s.parentElement;
    return s ? { left: s.scrollLeft, width: s.clientWidth } : null;
  });
  const setScroll = (mode) => page.evaluate((m) => {
    let s = document.querySelector('[data-testid="arrangement-ruler"]')?.parentElement ?? null;
    while (s && !(s.scrollWidth > s.clientWidth && ['auto', 'scroll'].includes(getComputedStyle(s).overflowX))) s = s.parentElement;
    s.scrollLeft = typeof m === 'number' ? m : m === 'page' ? s.scrollLeft + s.clientWidth : 0;
    return s.scrollLeft;
  }, mode);
  const mountedCount = (id) => page.evaluate((i) => document.querySelectorAll(`[data-clip-id="${i}"]`).length, id);
  const startOf = (id) => page.evaluate((i) => document.querySelector(`[data-clip-id="${i}"]`)?.getAttribute('data-clip-start') ?? null, id);

  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator(audio).first().waitFor();
  const firstId = await page.locator(audio).first().getAttribute('data-clip-id');
  const bar0 = await page.locator(audio).first().getByTitle(/ — drag to move$/).first().boundingBox();
  await page.mouse.click(bar0.x + Math.min(20, bar0.width / 2), bar0.y + bar0.height / 2);
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
  for (let n = 1; n < N; n += 1) {
    await page.keyboard.press('Control+d');
    await page.waitForFunction((want) => Math.max(...[...document.querySelectorAll('[data-track-id][data-clip-count]')].map((l) => Number(l.getAttribute('data-clip-count')))) >= want, n + 1, { timeout: 30000 });
  }
  await page.waitForTimeout(800);
  await page.keyboard.press('Escape');
  await setScroll('start');
  await page.waitForTimeout(400);
  const result = { base, viewport: vp, model: await modelCount(), firstId, scroller: await scroller() };

  // A. held press, scroll, blur, scroll
  const undoBeforeA = await undoTitle();
  const tb = await page.locator(`[data-clip-id="${firstId}"]`).getByTitle(/ — drag to move$/).first().boundingBox();
  await page.mouse.move(tb.x + 10, tb.y + tb.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(150);
  result.A = { scrollsHeld: [] };
  for (let i = 0; i < 6; i += 1) result.A.scrollsHeld.push(await setScroll('page'));
  await page.waitForTimeout(500);
  result.A.heldMounted = await mountedCount(firstId);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.waitForTimeout(200);
  result.A.scrollAfterBlur = await setScroll('page');
  await page.waitForTimeout(500);
  result.A.mountedAfterBlurWhileHeld = await mountedCount(firstId);
  await page.mouse.up();
  await page.waitForTimeout(400);
  result.A.model = await modelCount();
  result.A.undoUnchanged = (await undoTitle()) === undoBeforeA;
  result.A.undoBefore = undoBeforeA;
  result.A.undoAfter = await undoTitle();

  // B. same-lane group drag; scroll a far member into view mid-gesture
  await setScroll('start');
  await page.waitForTimeout(400);
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => c.getAttribute('data-clip-id')));
  const geometry = await page.evaluate(() => {
    const c = document.querySelector('[data-clip-kind="audio"]');
    const r = c.getBoundingClientRect();
    return { width: r.width, start: Number(c.getAttribute('data-clip-start')) };
  });
  result.B = { mountedAtStart: ids.length, firstClipWidthPx: geometry.width };
  const clipSeconds = 101.352;
  const pps = geometry.width / clipSeconds;
  const memberRestStart = MEMBER * clipSeconds;
  const memberLeftPx = memberRestStart * pps;
  result.B.memberLeftPx = Math.round(memberLeftPx);
  await setScroll(Math.max(0, Math.round(memberLeftPx - 200)));
  await page.waitForTimeout(500);
  const memberId = await page.evaluate((want) => {
    const all = [...document.querySelectorAll('[data-clip-kind="audio"]')];
    const best = all.map((c) => ({ id: c.getAttribute('data-clip-id'), s: Number(c.getAttribute('data-clip-start')) })).sort((a, b) => Math.abs(a.s - want) - Math.abs(b.s - want))[0];
    return best ? best.id : null;
  }, memberRestStart);
  result.B.memberId = memberId;
  result.B.memberRest = await startOf(memberId);
  await setScroll('start');
  await page.waitForTimeout(500);
  result.B.memberMountedAtRestScroll0 = await mountedCount(memberId);
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(400);
  const undoBeforeB = await undoTitle();
  const pressedRest = await startOf(firstId);
  const gb = await page.locator(`[data-clip-id="${firstId}"]`).getByTitle(/ — drag to move$/).first().boundingBox();
  const y = gb.y + gb.height / 2;
  await page.mouse.move(gb.x + 10, y);
  await page.mouse.down();
  await page.mouse.move(gb.x + 90, y, { steps: 8 });
  await page.waitForTimeout(300);
  result.B.memberMountedMidDragScroll0 = await mountedCount(memberId);
  result.B.pressedPreviewAtScroll0 = await startOf(firstId);
  result.B.scrollMid = await setScroll(Math.max(0, Math.round(memberLeftPx - 200)));
  await page.waitForTimeout(500);
  result.B.memberMountedMidDrag = await mountedCount(memberId);
  result.B.memberPreview = await startOf(memberId);
  result.B.pressedPreviewAfterScroll = await startOf(firstId);
  result.B.pressedRest = pressedRest;
  const dPressed = Number(result.B.pressedPreviewAfterScroll) - Number(pressedRest);
  const dMember = Number(result.B.memberPreview) - Number(result.B.memberRest);
  result.B.deltaPressed = Number.isFinite(dPressed) ? Number(dPressed.toFixed(3)) : null;
  result.B.deltaMember = Number.isFinite(dMember) ? Number(dMember.toFixed(3)) : null;
  await page.mouse.up();
  await page.waitForTimeout(500);
  result.B.memberAfterRelease = await startOf(memberId);
  result.B.statusAfterRelease = await page.getByTestId('arrangement-status').textContent();
  result.B.undoAfterRelease = await undoTitle();
  result.B.undoBefore = undoBeforeB;
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(500);
  result.B.memberAfterUndo = await startOf(memberId);
  result.B.model = await modelCount();
  result.pageErrors = errors;
  await page.screenshot({ path: out.replace(/\.json$/, '.png') });
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(JSON.stringify(result));
  await browser.close();
})();
