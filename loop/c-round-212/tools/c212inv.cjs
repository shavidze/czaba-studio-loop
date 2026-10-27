// C round 212 — SYNC-212: invariants suite (from c211inv) on baseline and current builds, then diff.
// usage: node c211inv.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c212lib.cjs');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];
const pick = (d) => { if (!d) return null; const { meters, ...rest } = d; return rest; };
async function state(page, loc) {
  return { ...pick(await L.display(loc)), undo: await L.undoTitle(page), redo: await L.redoTitle(page), status: await L.statusText(page) };
}
async function suite(page, loc, kind) {
  const o = {};
  o.rest = await state(page, loc);
  await loc.focus();
  o.keys = [];
  for (const k of ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowUp']) { await page.keyboard.press(k); await L.sleep(150); o.keys.push({ k, ...(await state(page, loc)) }); }
  await page.keyboard.down('ArrowUp');
  for (let i = 0; i < 5; i++) { await page.keyboard.down('ArrowUp'); await L.sleep(40); }
  o.heldBeforeUp = await state(page, loc);
  await page.keyboard.up('ArrowUp');
  await L.sleep(300);
  o.heldAfterUp = await state(page, loc);
  await L.blurActive(page); await L.sleep(400);
  o.afterBlur = await state(page, loc);
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  const y = b.y + b.height / 2;
  await page.mouse.move(b.x + b.width * 0.5, y); await page.mouse.down(); await page.keyboard.down('Shift');
  await page.mouse.move(b.x + b.width * 0.5 + 20, y, { steps: 10 });
  o.shiftMid = await state(page, loc);
  await page.mouse.up(); await page.keyboard.up('Shift'); await L.quiet(page);
  o.shiftAfter = await state(page, loc);
  await page.mouse.move(b.x + b.width * 0.5, y); await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.5 - 30, y, { steps: 10 });
  o.plainMid = await state(page, loc);
  await page.mouse.up(); await L.quiet(page);
  o.plainAfter = await state(page, loc);
  const esc = await L.drag(page, loc, kind, { mode: 'esc', stopAt: 40 });
  o.esc = { afterAbort: pick(esc.afterAbort), after: pick(esc.after), undoAfter: esc.undoAfter, statusAfter: esc.statusAfter, released: esc.releaseCommits > 0 };
  for (const m of ['cancel', 'blur']) {
    const d = await L.drag(page, loc, kind, { mode: m, stopAt: 40 });
    o[m] = { mid: pick(d.mid), afterAbort: pick(d.afterAbort), after: pick(d.after), undoAfter: d.undoAfter, statusAfter: d.statusAfter };
  }
  const full = await L.drag(page, loc, kind, { mode: 'release' });
  o.fullDrag = { samples: full.samples.map((x) => pick(x)), after: pick(full.after), undoAfter: full.undoAfter, statusAfter: full.statusAfter };
  const fullUp = await L.drag(page, loc, kind, { mode: 'release', startFrac: 0.5 });
  o.fullDrag2 = { after: pick(fullUp.after), undoAfter: fullUp.undoAfter };
  // tab order from the field
  await page.getByTestId('arrangement-detail-clip-gain-input').focus();
  o.tabOrder = [];
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Tab'); await L.sleep(120); o.tabOrder.push(await page.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute('data-testid') || a.getAttribute('aria-label')) : null; })); }
  await L.blurActive(page); await L.sleep(200);
  await loc.dblclick(); await L.quiet(page);
  o.dblclick = await state(page, loc);
  await L.blurActive(page); await L.sleep(300);
  o.dblclickBlur = await state(page, loc);
  await page.keyboard.press('Control+z'); await L.quiet(page);
  o.undo1 = await state(page, loc);
  await page.keyboard.press('Control+Shift+z'); await L.quiet(page);
  o.redo1 = await state(page, loc);
  // typed field
  const f = page.getByTestId('arrangement-detail-clip-gain-input');
  await f.click(); await f.fill('-7.5'); await L.sleep(150);
  o.typedPending = await state(page, loc);
  await page.keyboard.press('Enter'); await L.sleep(300);
  o.typedEnter = await state(page, loc);
  await f.click(); await f.fill('3.2'); await L.sleep(100);
  await L.blurActive(page); await L.sleep(300);
  o.typedBlur = await state(page, loc);
  await f.click(); await f.fill('11'); await L.sleep(100);
  await page.keyboard.press('Escape'); await L.sleep(300);
  o.typedEsc = await state(page, loc);
  await L.blurActive(page); await L.sleep(200);
  o.typedEscBlur = await state(page, loc);
  // reset button
  await page.getByTestId('arrangement-detail-clip-gain-reset').click(); await L.quiet(page);
  o.reset = await state(page, loc);
  await page.keyboard.press('Control+z'); await L.quiet(page);
  o.resetUndo = await state(page, loc);
  await page.keyboard.press('Control+Shift+z'); await L.quiet(page);
  o.resetRedo = await state(page, loc);
  return o;
}
(async () => {
  const browser = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    {
      const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
      await L.selectFirstClip(page);
      R.single = await suite(page, L.sl(page, 'Clip Gain — fader'), 'single');
      R.errorsSingle = errors;
      await ctx.close();
    }
    {
      const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
      R.membersSel = await L.addMembers(page, [-6, 1]);
      R.membersGroup = await page.getByTestId('arrangement-detail-group').count();
      R.members = await suite(page, L.sl(page, 'Clip Gain — fader'), 'members');
      R.errorsMembers = errors;
      await ctx.close();
    }
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 1500); }
  await browser.close();
  L.save(`inv-${tag}-${vw}.json`, R);
  console.log('done', tag, vw, R.fatal || '');
})();
