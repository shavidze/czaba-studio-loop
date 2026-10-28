const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const W = Number(process.argv[2] || 1440), H = Number(process.argv[3] || 900);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H } }); const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab'); await page.waitForFunction(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Add'); return x && !x.disabled; }, undefined, { timeout: 90000 }); await sleep(800);
  const st = (label) => page.evaluate((l) => ({ l, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent, active: document.activeElement === document.body ? 'BODY' : (document.activeElement.getAttribute('data-testid') || document.activeElement.tagName), clips: [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => { const r = c.getBoundingClientRect(); return [c.getAttribute('data-clip-start'), Math.round(r.left), Math.round(r.width), c.closest('[data-track-id]').getAttribute('data-track-id'), c.getAttribute('aria-selected') ?? c.getAttribute('data-selected')]; }), pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent, undo: [...document.querySelectorAll('button')].find((x) => (x.getAttribute('title') || '').startsWith('Undo'))?.getAttribute('title'), zoom: document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent }), label);
  const log = [];
  const titleOf = (i) => page.evaluate((k) => { const c = [...document.querySelectorAll('[data-clip-kind="audio"]')][k]; const r = c.getBoundingClientRect(); const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect(); return { x: Math.max(r.left, sc.left + 228) + Math.min(30, r.width / 2), y: r.top + 10 }; }, i);
  const fit = async () => { const sc = await page.getByTestId('arrangement-timeline-scroller').boundingBox(); const rb = await page.getByTestId('arrangement-ruler').boundingBox(); await page.mouse.dblclick(sc.x + 224 + 120, rb.y + rb.height / 2); await sleep(500); };
  try {
  await page.getByRole('button', { name: 'Add', exact: true }).click(); await sleep(800);
  await page.evaluate(() => document.activeElement.blur());
  for (const k of ['Control+z', 'Control+Shift+z', 'Control+z', 'Control+y']) { await page.keyboard.press(k); await sleep(300); log.push(await st(k)); }
  await fit(); log.push(await st('fit'));
  let t = await titleOf(0); await page.mouse.click(t.x, t.y); await sleep(250); log.push(await st('click title 0'));
  await page.keyboard.press('Control+c'); await sleep(200); log.push(await st('copy'));
  await page.keyboard.press('Control+ArrowRight'); await sleep(200); log.push(await st('ctrl+right 1'));
  await page.keyboard.press('Control+ArrowRight'); await sleep(200); log.push(await st('ctrl+right 2'));
  await page.keyboard.press('Control+v'); await sleep(500); log.push(await st('paste'));
  await fit(); log.push(await st('fit2'));
  await page.evaluate(() => document.activeElement.blur());
  await page.keyboard.press('End'); await sleep(200); log.push(await st('End'));
  // nudge on last clip
  const n = await page.locator('[data-clip-kind="audio"]').count();
  t = await titleOf(n - 1); await page.mouse.click(t.x, t.y); await sleep(250);
  await page.evaluate(() => document.activeElement.blur());
  await page.keyboard.press('ArrowRight'); await sleep(300); log.push(await st('nudge right last'));
  await page.keyboard.press('ArrowLeft'); await sleep(300); log.push(await st('nudge left last'));
  // delete
  t = await titleOf(0); await page.mouse.click(t.x, t.y); await sleep(250);
  await page.evaluate(() => document.activeElement.blur());
  await page.keyboard.press('Delete'); await sleep(300); log.push(await st('Delete'));
  await fit(); await page.evaluate(() => document.activeElement.blur());
  t = await titleOf(0); await page.mouse.click(t.x, t.y); await sleep(250);
  await page.evaluate(() => document.activeElement.blur());
  await page.keyboard.press('Backspace'); await sleep(300); log.push(await st('Backspace'));
  } catch (e) { log.push({ error: String(e).slice(0, 200) }); }
  console.log(JSON.stringify(log, null, 0).replace(/\},\{/g, '},\n{'));
  await b.close();
})();
