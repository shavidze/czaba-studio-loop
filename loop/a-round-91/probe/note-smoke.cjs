// A round 91 smoke (not C evidence): WAV + MP3 note text and visibility at 1280x900
const X = require('./lib.cjs');
(async () => {
  const b = await X.launch();
  const { page, S } = await X.newCtx(b, { width: 1280, height: 900 }, 'note');
  await page.goto(X.URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await X.sleep(3000);
  await X.openDlg(page);
  const r = await page.evaluate(() => {
    const radio = [...document.querySelectorAll('input[type=radio]')].find((i) => i.closest('label')?.textContent.startsWith('WAV + MP3'));
    const label = radio.closest('label');
    const note = [...label.querySelectorAll('span')].find((s) => s.textContent.startsWith('იგივე მიქსი'));
    note.scrollIntoView({ block: 'center' });
    const rect = note.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + 5, rect.top + rect.height / 2);
    return { labelText: label.textContent, note: note.textContent, cls: note.className, rect: { l: rect.left, r: rect.right, t: rect.top, b: rect.bottom }, vw: innerWidth, hitOk: note.contains(hit) };
  });
  await page.screenshot({ path: `${X.SHOTS}/note-1280.png` });
  console.log(JSON.stringify({ ...r, errors: S.errors }, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
