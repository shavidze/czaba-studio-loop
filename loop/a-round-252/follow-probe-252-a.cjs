const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = 'http://127.0.0.1:5173';
const OUT = __dirname;
const SHOTS = path.join(OUT, 'shots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function state(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const f = q('[data-testid="arrangement-follow"]');
    const sc = q('[data-testid="arrangement-timeline-scroller"]');
    const ph = q('[data-testid="arrangement-playhead"]');
    const pause = Array.from(document.querySelectorAll('button')).some((b) => b.getAttribute('aria-label') === 'Pause' || b.textContent.trim() === 'Pause');
    const cur = Array.from(document.querySelectorAll('[data-testid="arrangement-marker"]')).filter((m) => m.getAttribute('aria-current') === 'true').map((m) => m.dataset.markerTime);
    return {
      follow: f?.dataset.followMode, followText: f?.textContent, status: q('[data-testid="arrangement-status"]')?.textContent,
      scrollLeft: sc?.scrollLeft, insertMarker: q('[data-insert-marker]')?.getAttribute('data-insert-marker') ?? null,
      position: q('[data-testid="arrangement-position"]')?.textContent, playheadX: ph ? ph.getBoundingClientRect().x : null,
      playing: pause, activeTag: document.activeElement ? `${document.activeElement.tagName}#${document.activeElement.getAttribute('data-testid') ?? ''}` : null,
      selectedMarkers: cur, scrollerRight: sc ? sc.getBoundingClientRect().right : null,
    };
  });
}
async function setup(browser, w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 });
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(1200);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Equal'); await sleep(150); }
  await sleep(400);
  const zoom = await page.evaluate(() => document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent);
  const bpm = await page.evaluate(() => document.querySelector('[data-testid="arrangement-bars-ruler"]')?.dataset.bpm ?? null);
  return { page, errors, zoom, bpm };
}
async function play(page) { await page.keyboard.press('Space'); await sleep(600); }
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const results = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const vp = `${w}x${h}`;
    const r = {};
    try {
      // A: lower-zone pause, playback continues, stop resume
      let { page, errors, zoom, bpm } = await setup(browser, w, h);
      r.zoom = zoom; r.bpm = bpm;
      const bars = page.getByTestId('arrangement-bars-ruler');
      await play(page);
      r.A_playing = await state(page);
      let bb = await bars.boundingBox();
      const activeBefore = r.A_playing.activeTag;
      await page.mouse.click(bb.x + 120, bb.y + bb.height - 3);
      await sleep(100);
      r.A_afterLowerClick = await state(page);
      await sleep(1500);
      r.A_after1500 = await state(page);
      r.A_playheadAdvancedPx = r.A_after1500.playheadX - r.A_afterLowerClick.playheadX;
      r.A_focusUnchanged = r.A_afterLowerClick.activeTag === activeBefore;
      await page.screenshot({ path: path.join(SHOTS, `A-paused-${vp}.png`) });
      await page.keyboard.press('Space');
      await sleep(300);
      r.A_afterStop = await state(page);
      // B: seconds ruler pause (Follow back on after stop)
      await play(page);
      const sec = await page.getByTestId('arrangement-ruler').boundingBox();
      r.B_before = await state(page);
      await page.mouse.click(sec.x + 160, sec.y + sec.height - 4);
      await sleep(150);
      r.B_afterSecondsClick = await state(page);
      // C: strip resume ~100 px left of the viewport right edge
      bb = await bars.boundingBox();
      const right = r.B_afterSecondsClick.scrollerRight;
      const stripX = Math.min(bb.x + bb.width - 5, right - 100);
      await page.mouse.click(stripX, bb.y + 2);
      await sleep(80);
      r.C_afterStrip = await state(page);
      const samples = [];
      for (let i = 0; i < 12; i++) { await sleep(250); const s = await state(page); samples.push({ t: (i + 1) * 250, follow: s.follow, scrollLeft: s.scrollLeft, playheadX: s.playheadX }); }
      r.C_samples = samples;
      r.C_followStayedOn = samples.every((s) => s.follow === 'on');
      r.C_scrollChanged = samples.slice(0, 8).some((s) => s.scrollLeft !== r.C_afterStrip.scrollLeft);
      await page.screenshot({ path: path.join(SHOTS, `C-resumed-${vp}.png`) });
      await page.keyboard.press('Space');
      await sleep(300);
      // D: stopped clicks leave Follow on
      bb = await bars.boundingBox();
      const scLeft = await page.evaluate(() => document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect().left);
      r.D_clickX = Math.max(bb.x, scLeft) + 200;
      await page.mouse.click(r.D_clickX, bb.y + bb.height - 3);
      await sleep(150);
      r.D_stoppedLower = await state(page);
      const sec2 = await page.getByTestId('arrangement-ruler').boundingBox();
      await page.mouse.click(Math.max(sec2.x, scLeft) + 260, sec2.y + sec2.height - 4);
      await sleep(150);
      r.D_stoppedSeconds = await state(page);
      r.errorsA = errors.slice();
      await page.close();
      // E: nav origin on a fresh page
      ({ page, errors } = await setup(browser, w, h));
      const pps = await page.evaluate(() => {
        const t = document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent ?? '';
        return Number((t.match(/([\d.]+)\s*px/) ?? [])[1]);
      });
      r.E_pps = pps;
      const ruler = page.getByTestId('arrangement-ruler');
      const clickAtTime = async (t) => { const box = await ruler.boundingBox(); await page.mouse.click(box.x + t * pps, box.y + box.height - 4); await sleep(150); };
      for (const t of [2, 6]) {
        await clickAtTime(t);
        await page.keyboard.press('m');
        await sleep(200);
        await page.keyboard.press('Enter');
        await sleep(200);
        await page.evaluate(() => document.activeElement && document.activeElement.blur());
      }
      r.E_markers = await page.evaluate(() => Array.from(document.querySelectorAll('[data-testid="arrangement-marker"]')).map((m) => m.dataset.markerTime));
      await clickAtTime(1);
      r.E_afterClick1 = await state(page);
      await page.keyboard.press('Space');
      await sleep(3000);
      await page.keyboard.press('Space');
      await sleep(300);
      r.E_stopped = await state(page);
      await page.keyboard.press('Control+ArrowRight');
      await sleep(250);
      r.E_afterCtrlRight = await state(page);
      await page.screenshot({ path: path.join(SHOTS, `E-nav-origin-${vp}.png`) });
      const steps = [];
      for (let i = 0; i < 6; i++) { await page.keyboard.press('Control+ArrowRight'); await sleep(200); const s = await state(page); steps.push({ insertMarker: s.insertMarker, status: s.status }); if (s.status.startsWith('No more markers')) break; }
      r.E_stoppedSteps = steps;
      await page.keyboard.press('Home'); await sleep(200);
      await play(page);
      const psteps = [];
      for (let i = 0; i < 8; i++) { await page.keyboard.press('Control+ArrowRight'); await sleep(150); const s = await state(page); psteps.push({ position: s.position, status: s.status, playing: s.playing }); if (s.status === 'No more markers after the playhead') break; }
      r.E_playingSteps = psteps;
      await page.keyboard.press('Space');
      r.titles = await page.evaluate(() => ({ seconds: document.querySelector('[data-testid="arrangement-ruler"]')?.getAttribute('title') ?? 'none', bars: document.querySelector('[data-testid="arrangement-bars-ruler"]')?.getAttribute('title') ?? 'none', clickTitles: Array.from(document.querySelectorAll('[title*="click = insert marker"], [title^="Click = insert marker"]')).map((e) => e.getAttribute('data-testid') ?? e.tagName) }));
      r.errorsE = errors.slice();
      await page.close();
    } catch (e) { r.error = String(e.stack || e); }
    results[vp] = r;
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'follow-probe-252-a.json'), JSON.stringify(results, null, 1));
  console.log(JSON.stringify(results, null, 1));
})();
