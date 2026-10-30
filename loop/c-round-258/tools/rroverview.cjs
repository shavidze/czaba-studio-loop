// C round 258: RR-OVERVIEW (CALM-3 + follow-up, rounds 232-233). usage: node rroverview.cjs <outDir>
const L = require('./lib258.cjs');
const { sleep, fs, path } = L;
const outDir = path.resolve(process.argv[2]); fs.mkdirSync(outDir, { recursive: true });
const ov = (page) => page.evaluate(() => {
  const o = document.querySelector('[data-testid="arrangement-overview"]');
  const s = document.querySelector('[data-testid="arrangement-overview-hidden-slot"]');
  const b = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return [+r.x.toFixed(1), +r.y.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; };
  return { present: !!o, state: o?.getAttribute('data-overview-state') ?? null, box: b(o), slot: b(s), lanes: o ? o.querySelectorAll('*').length : 0, ls: Object.fromEntries(Object.keys(localStorage).filter((k) => /overview/i.test(k)).map((k) => [k, localStorage.getItem(k)])) };
});
const act = (page) => page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return { el: 'BODY' }; const cs = getComputedStyle(a); return { el: a.getAttribute('data-testid') || a.tagName, label: a.getAttribute('aria-label'), fv: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth}` }; });
(async () => {
  const browser = await L.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = {}; out[k] = r;
    const { ctx, page, errors } = await L.open(browser, vp, { pulse: false });
    r.empty = await ov(page);
    await page.screenshot({ path: path.join(outDir, `ov-empty-${k}.png`) });
    await L.addPulse(page);
    r.full = await ov(page);
    await page.screenshot({ path: path.join(outDir, `ov-full-${k}.png`) });
    await L.blur(page); await page.mouse.click(5, 5); await sleep(200);
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(400);
    r.hidden = await ov(page);
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 }); await sleep(800);
    r.hiddenAfterReload = await ov(page);
    await L.blur(page); await page.keyboard.press('Control+Alt+KeyO'); await sleep(400);
    r.shown = await ov(page);
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 }); await sleep(800);
    r.shownAfterReload = await ov(page);
    // focus the Overview: separator -> Tab
    await page.getByTestId('arrangement-library-separator').focus(); await sleep(150);
    await page.keyboard.press('Tab'); await sleep(250);
    r.focusBefore = await act(page);
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(500);
    r.focusAfter = await act(page);
    r.afterHideFromFocus = await ov(page);
    await page.screenshot({ path: path.join(outDir, `ov-focus-${k}.png`) });
    // focus elsewhere (Snap toggle) stays
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(400);
    await page.getByTestId('arrangement-snap-toggle').focus(); await sleep(150);
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(400);
    r.focusElsewhere = await act(page);
    await page.keyboard.press('Control+Alt+KeyO'); await sleep(300);
    r.errors = errors; await ctx.close();
    r.checks = {
      emptyHairline: r.empty.present && r.empty.state !== null && r.empty.state !== r.full.state,
      fullSameBox: JSON.stringify(r.empty.box) === JSON.stringify(r.full.box),
      hides: !r.hidden.present && r.hiddenAfterReload.present === false,
      shows: r.shown.present && r.shownAfterReload.present && JSON.stringify(r.shownAfterReload.box) === JSON.stringify(r.full.box),
      focusOverview: /overview/.test(r.focusBefore.el || ''),
      focusToExpand: r.focusAfter.el === 'arrangement-video-expand' && r.focusAfter.fv && /solid/.test(r.focusAfter.outline) && !r.afterHideFromFocus.present,
      focusElsewhere: r.focusElsewhere.el === 'arrangement-snap-toggle',
      errors: errors.length === 0,
    };
    r.pass = Object.values(r.checks).every(Boolean);
    console.log(k, r.pass, JSON.stringify(r.checks), JSON.stringify({ e: r.empty.state, f: r.full.state, fb: r.focusBefore, fa: r.focusAfter }));
  }
  fs.writeFileSync(path.join(outDir, 'rroverview.json'), JSON.stringify(out, null, 1));
  await browser.close();
})();
