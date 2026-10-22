const X = require('./lib91.cjs');
const vpArg = process.argv[2]; const [w, h] = vpArg.split('x').map(Number);
const NOTE = 'იგივე მიქსი ორ ფაილად — ან ორივე შეიქმნება, ან არცერთი. ბრაუზერმა მეორე ფაილის ჩამოტვირთვაზე შეიძლება ნებართვა მოითხოვოს.';
(async () => {
  const b = await X.launch(); const { ctx, page, S } = await X.newCtx(b, { width: w, height: h }, `note2-${vpArg}`);
  const R = { vp: vpArg }; R.scope = await X.setup(page, 2);
  R.idle = await page.evaluate((NOTE) => {
    const lab = document.querySelector('[data-testid=arrangement-export-format-both]').closest('label');
    const note = [...lab.querySelectorAll('span')].find((s) => s.textContent === NOTE);
    if (!note) return { found: false, spans: [...lab.querySelectorAll('span')].map((s) => [s.className, s.textContent.slice(0, 30)]) };
    note.scrollIntoView({ block: 'nearest' });
    const sc = (() => { let e = note.parentElement; while (e && !(getComputedStyle(e).overflowY === 'auto' || getComputedStyle(e).overflowY === 'scroll')) e = e.parentElement; return e; })();
    const r = note.getBoundingClientRect(); const sr = sc && sc.getBoundingClientRect();
    const pts = [[r.left + 2, r.top + 2], [r.left + r.width / 2, r.top + r.height / 2], [r.right - 2, r.bottom - 2]].map(([x, y]) => { const e = document.elementFromPoint(x, y); return !!e && (e === note || note.contains(e)); });
    const f = document.querySelector('[data-testid=arrangement-export-footer]');
    const btns = [...f.querySelectorAll('button')].map((b) => { const q = b.getBoundingClientRect(); const c = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return { t: b.textContent.trim(), vis: q.bottom <= innerHeight && q.top >= 0 && (c === b || b.contains(c)) }; });
    const fs = getComputedStyle(f).position;
    return { found: true, cls: note.className, lines: Math.round(r.height / parseFloat(getComputedStyle(note).lineHeight)), rect: { l: r.left, r: r.right, t: r.top, b: r.bottom }, vw: innerWidth, scroller: sc && { t: sr.top, b: sr.bottom, l: sr.left, r: sr.right }, insideScroller: !!sr && r.top >= sr.top && r.bottom <= sr.bottom && r.left >= sr.left && r.right <= sr.right, hitPoints: pts, clippedH: r.left < 0 || r.right > innerWidth || note.scrollWidth > note.clientWidth, footerPos: fs, footerBtns: btns, footerText: f.innerText.slice(0, 120) };
  }, NOTE);
  await page.locator('[data-testid=arrangement-export-format-both]').evaluate((i) => i.closest('label').scrollIntoView({ block: 'nearest' }));
  await page.screenshot({ path: `${X.SHOTS}/note-exact-${vpArg}.png` });
  R.errors = S.errors; X.save(`note2-${vpArg}.json`, R); console.log(JSON.stringify(R, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
