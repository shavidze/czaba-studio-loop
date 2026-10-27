// C round 212 — SYNC-212 (selection part; v2: Ctrl+click toggles a member off, since a plain click inside a group keeps the group): clip <-> group (-6 / +1) switches, with and without pending typed text, after a drag and after Undo/Redo.
// usage: node c212sel.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c212lib.cjs');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4]), Number(process.argv[5])];
const st = async (page) => {
  const d = await page.evaluate(() => {
    const q = (id) => document.querySelector('[data-testid=' + id + ']');
    const f = q('arrangement-detail-clip-gain-input'), fd = q('arrangement-detail-clip-gain-fader'), rg = q('arrangement-detail-clip-gain-range'), rs = q('arrangement-detail-clip-gain-reset'), pm = q('arrangement-detail-clip-gain-pending'), s = q('arrangement-status');
    return { group: !!q('arrangement-detail-group'), field: f && f.value, pending: f && f.getAttribute('data-pending'), title: f && f.getAttribute('title'), marker: pm ? pm.textContent : null, fader: fd && fd.value, vt: fd && fd.getAttribute('aria-valuetext'), range: rg ? rg.textContent : null, resetDisabled: rs ? rs.disabled : null, status: s ? s.textContent : null };
  });
  return { ...d, undo: await L.undoTitle(page), redo: await L.redoTitle(page) };
};
async function clickClip(page, filter, mod) {
  const p = await L.clipPoint(page, 0, filter);
  const k = mod === true ? 'Shift' : mod || null;
  if (k) await page.keyboard.down(k);
  await page.mouse.click(p.x, p.y);
  if (k) await page.keyboard.up(k);
  await L.sleep(500);
}
(async () => {
  const br = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    const { ctx, page, errors } = await L.openLab(br, base, vw, vh);
    R.sel = await L.addMembers(page, [-6, 1]);
    const firstTitle = R.sel.all[0].text.slice(0, 6);
    R.s01group = await st(page);
    await clickClip(page, 'Soft impact', 'Control'); R.s02firstOnly = await st(page);
    await clickClip(page, 'Soft impact'); R.s03softOnly = await st(page);
    await clickClip(page, null, true); R.s04groupAgain = await st(page);
    const f = page.getByTestId('arrangement-detail-clip-gain-input');
    await f.click(); await f.fill('4'); await L.sleep(200); R.s05groupPending = await st(page);
    await page.keyboard.press('Escape'); await L.sleep(300); R.s06groupEsc = await st(page);
    await f.click(); await f.fill('-3'); await page.keyboard.press('Enter'); await L.sleep(400); await L.blurActive(page); R.s07groupTyped = await st(page);
    await page.keyboard.press('Control+z'); await L.quiet(page); R.s08groupUndo = await st(page);
    await page.keyboard.press('Control+Shift+z'); await L.quiet(page); R.s09groupRedo = await st(page);
    await page.keyboard.press('Control+z'); await L.quiet(page);
    // group drag, then switch to one clip and back
    const fd = L.sl(page, 'Clip Gain — fader'); const b = await fd.boundingBox(); const y = b.y + b.height / 2;
    await page.mouse.move(b.x + b.width / 2, y); await page.mouse.down(); await page.mouse.move(b.x + b.width / 2 - 20, y, { steps: 10 }); await page.mouse.up(); await L.quiet(page);
    R.s10groupDragged = await st(page);
    await L.blurActive(page);
    await clickClip(page, 'Soft impact', 'Control'); R.s11firstAfterDrag = await st(page);
    await page.keyboard.press('Control+z'); await L.quiet(page); R.s12undoOnClip = await st(page);
    await page.keyboard.press('Control+Shift+z'); await L.quiet(page); R.s13redoOnClip = await st(page);
    // pending typed text on a clip, then switch to group
    await f.click(); await f.fill('9'); await L.sleep(200); R.s14clipPending = await st(page);
    await clickClip(page, 'Soft impact', true); R.s15groupAfterPending = await st(page);
    await clickClip(page, null, 'Control'); R.s16softAfter = await st(page);
    // reset on single clip, double-click reset on group
    await page.getByTestId('arrangement-detail-clip-gain-reset').click(); await L.quiet(page); R.s17softReset = await st(page);
    await clickClip(page, null, true); R.s18group = await st(page);
    await fd.dblclick(); await L.quiet(page); await L.blurActive(page); R.s19groupDblReset = await st(page);
    await page.keyboard.press('Control+z'); await L.quiet(page); R.s20undoDbl = await st(page);
    R.errors = errors; R.firstTitle = firstTitle;
    await ctx.close();
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 1500); }
  await br.close();
  L.save(`sel-${tag}-${vw}.json`, R);
  console.log('done', tag, vw, R.fatal || '');
})();
