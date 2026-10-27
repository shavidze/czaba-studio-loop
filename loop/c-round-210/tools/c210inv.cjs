// C round 210 — INVARIANTS: run identically on the baseline (f535ab3) build and the current build, then diff.
// usage: node c210inv.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c210lib.cjs');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];

const pick = (d) => (d ? { value: d.value, vt: d.vt, title: d.title, rowText: d.rowText } : null);
async function state(page, loc) {
  return { ...pick(await L.display(loc)), undo: await L.undoTitle(page), redo: await L.redoTitle(page), status: await L.statusText(page) };
}
async function panResetState(page) {
  return page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Reset Pan to centre — /.test(x.getAttribute('aria-label') || '')); return b ? { text: b.textContent, disabled: b.disabled, label: b.getAttribute('aria-label') } : null; });
}

async function suite(page, loc, kind) {
  const o = {};
  o.rest = await state(page, loc);
  // keyboard steps: 3 down (held as separate presses), then blur commit
  await loc.focus();
  o.keys = [];
  for (const k of ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowUp']) {
    await page.keyboard.press(k);
    await L.sleep(150);
    o.keys.push({ k, ...(await state(page, loc)) });
  }
  // held key with auto-repeat (keydown repeat x5, then keyup)
  await page.keyboard.down('ArrowDown');
  for (let i = 0; i < 5; i++) { await page.keyboard.down('ArrowDown'); await L.sleep(40); }
  o.heldBeforeUp = await state(page, loc);
  await page.keyboard.up('ArrowDown');
  await L.sleep(300);
  o.heldAfterUp = await state(page, loc);
  await L.blurActive(page);
  await L.sleep(400);
  o.afterBlur = await state(page, loc);
  if (kind === 'pan') o.panResetAfterKeys = await panResetState(page);
  // Shift+drag fine
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  const y = b.y + b.height / 2;
  await page.mouse.move(b.x + b.width * 0.5, y);
  await page.mouse.down();
  await page.keyboard.down('Shift');
  await page.mouse.move(b.x + b.width * 0.5 + 20, y, { steps: 10 });
  o.shiftMid = await state(page, loc);
  if (kind === 'pan') o.panResetShiftMid = await panResetState(page);
  await page.mouse.up();
  await page.keyboard.up('Shift');
  await L.quiet(page);
  o.shiftAfter = await state(page, loc);
  // plain drag release (no Shift): 30 px right
  await page.mouse.move(b.x + b.width * 0.5, y);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.5 - 30, y, { steps: 10 });
  o.plainMid = await state(page, loc);
  await page.mouse.up();
  await L.quiet(page);
  o.plainAfter = await state(page, loc);
  // Esc mid-drag
  const esc = await L.drag(page, loc, kind, { mode: 'esc', stopAt: 40 });
  o.esc = { afterAbort: pick(esc.afterAbort), after: pick(esc.after), undoAfter: esc.undoAfter, statusAfter: esc.statusAfter, releaseCommits: esc.releaseCommits > 0 };
  // pointercancel and blur mid-drag
  for (const m of ['cancel', 'blur']) {
    const d = await L.drag(page, loc, kind, { mode: m, stopAt: 40 });
    o[m] = { mid: pick(d.mid), afterAbort: pick(d.afterAbort), after: pick(d.after), undoAfter: d.undoAfter, statusAfter: d.statusAfter };
  }
  // double-click reset
  await loc.dblclick();
  await L.quiet(page);
  o.dblclick = await state(page, loc);
  await L.blurActive(page);
  await L.sleep(300);
  o.dblclickBlur = await state(page, loc);
  // undo / redo labels
  await page.keyboard.press('Control+z');
  await L.quiet(page);
  o.undo1 = await state(page, loc);
  await page.keyboard.press('Control+Shift+z');
  await L.quiet(page);
  o.redo1 = await state(page, loc);
  if (kind === 'pan') o.panResetEnd = await panResetState(page);
  return o;
}

(async () => {
  const browser = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
    R.track = await suite(page, L.sl(page, 'Volume — Music'), 'track');
    R.master = await suite(page, L.sl(page, 'Master Volume'), 'master');
    R.pan = await suite(page, L.sl(page, 'Pan — Music'), 'pan');
    const gv = await L.makeGroup(page);
    R.group = await suite(page, gv, 'group');
    R.errors = errors;
    await ctx.close();
  } catch (e) {
    R.fatal = String(e && e.stack || e).slice(0, 1500);
  }
  await browser.close();
  L.save(`inv-${tag}.json`, R);
  console.log('done', tag, R.fatal || '');
})();
