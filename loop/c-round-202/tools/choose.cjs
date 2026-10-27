// C round 202 — CHOOSE-VIDEO (R98) harness: mounts the served SfxVideoSync module (tree :5173 / ref :5174) on the real `/` page.
const F = require('./fl.cjs');
const path = require('path'); const fs = require('fs');
const SH = path.join(F.ROOT, 'shots', 'choose'); fs.mkdirSync(SH, { recursive: true });
async function mount(page, base, busy) {
  await page.goto(`${base}/`, { waitUntil: 'load', timeout: 90000 }); await F.sleep(2500); await F.declineCookies(page); await F.sleep(300);
  const src = await (await fetch(`${base}/app/components/recordings/SfxVideoSync.tsx`)).text();
  const reactUrl = src.match(/"(\/[^"]*deps\/react\.js\?v=[^"]+)"/)[1];
  const domUrl = reactUrl.replace('react.js', 'react-dom_client.js');
  await page.evaluate(async ({ reactUrl, domUrl, busy }) => {
    const React = (await import(reactUrl)).default; const { createRoot } = (await import(domUrl)).default;
    const { SfxVideoSync } = await import('/app/components/recordings/SfxVideoSync.tsx');
    const host = document.createElement('div'); host.id = 'harness';
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;overflow:auto;padding:24px;background:var(--color-background)';
    document.body.appendChild(host); window.__chosen = [];
    createRoot(host).render(React.createElement('div', null, React.createElement('button', { id: 'prev', type: 'button' }, 'prev'),
      React.createElement(SfxVideoSync, { url: '', position: 0, busy, onChoose: (f) => window.__chosen.push(f.name), onUpdate: () => {}, onSeek: () => {}, onBuffering: () => {}, onError: () => {} }),
      React.createElement('button', { id: 'after', type: 'button' }, 'after')));
    await new Promise((r) => setTimeout(r, 600));
  }, { reactUrl, domUrl, busy });
}
const act = (p) => p.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); const r = a.getBoundingClientRect(); return { tag: a.tagName, type: a.getAttribute('type'), name: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 30), display: cs.display, op: cs.opacity, os: cs.outlineStyle, ow: cs.outlineWidth, oo: cs.outlineOffset, bs: cs.boxShadow, box: [r.x, r.y, r.width, r.height], fsrc: document.documentElement.getAttribute('data-focus-source') }; });
(async () => {
  const browser = await F.launch(); const R = {};
  for (const [W, H] of [[1280, 720], [1440, 900]]) {
    const r = {};
    // ref label box (real HEAD component on :5174)
    { const { ctx, page } = await F.newPage(browser, W, H); await mount(page, 'http://127.0.0.1:5174', false);
      r.refLabel = await page.evaluate(() => { const l = [...document.querySelectorAll('#harness label')].find((x) => /Choose video/.test(x.textContent)); const b = l.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; });
      // ref tab stops
      await page.focus('#prev'); r.refStops = []; for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); await F.sleep(200); r.refStops.push(await act(page)); }
      await ctx.close(); }
    // tree: focus, ring, tab order
    { const { ctx, page } = await F.newPage(browser, W, H, { deviceScaleFactor: 3 }); await mount(page, 'http://127.0.0.1:5173', false);
      r.treeBtn = await page.evaluate(() => { const l = [...document.querySelectorAll('#harness button')].find((x) => x.textContent.trim() === 'Choose video'); const b = l.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; });
      await page.focus('#prev'); await page.keyboard.press('Tab'); await F.sleep(400); r.focused = await act(page);
      const b = r.focused.box; await page.screenshot({ path: path.join(SH, `tree-focus-${W}.png`), clip: { x: b[0] - 10, y: b[1] - 10, width: b[2] + 20, height: b[3] + 20 } });
      await page.evaluate(() => document.activeElement.blur()); await F.sleep(200);
      await page.screenshot({ path: path.join(SH, `tree-unfocus-${W}.png`), clip: { x: b[0] - 10, y: b[1] - 10, width: b[2] + 20, height: b[3] + 20 } });
      await page.focus('#prev'); r.treeStops = []; for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); await F.sleep(200); r.treeStops.push(await act(page)); }
      r.shiftBack = []; for (let i = 0; i < 3; i++) { await page.keyboard.press('Shift+Tab'); await F.sleep(200); r.shiftBack.push((await act(page)).name); }
      await ctx.close(); }
    // activations
    const methods = [['Enter', 'Enter'], ['Space1', ' '], ['Space2', ' '], ['Space3', ' '], ['mouse', null]];
    for (const [name, key] of methods) {
      const { ctx, page } = await F.newPage(browser, W, H); await mount(page, 'http://127.0.0.1:5173', false);
      await page.focus('#prev'); await page.keyboard.press('Tab'); await F.sleep(400);
      const before = await act(page);
      let fc = null;
      if (key) [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null), page.keyboard.press(key)]);
      else { const bb = await page.getByRole('button', { name: 'Choose video' }).boundingBox(); [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null), page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)]); }
      r[name] = { before: before.name + '/' + before.tag, result: fc ? 'filechooser' : 'none' };
      if (fc) { await fc.setFiles({ name: 'c202.mp4', mimeType: 'video/mp4', buffer: Buffer.from('x') }); await F.sleep(300); r[name].chosen = await page.evaluate(() => window.__chosen); }
      await ctx.close();
    }
    // busy
    { const { ctx, page } = await F.newPage(browser, W, H); await mount(page, 'http://127.0.0.1:5173', true);
      const loc = page.getByRole('button', { name: 'Choose video' }); r.busyDisabled = await loc.evaluate((b) => b.matches(':disabled'));
      const bb = await loc.boundingBox(); const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 2500 }).catch(() => null), page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)]);
      r.busyClick = fc ? 'filechooser' : 'none';
      await page.focus('#prev'); await page.keyboard.press('Tab'); await F.sleep(200); r.busyNextStop = (await act(page)).name;
      await ctx.close(); }
    R[W] = r;
  }
  // in-app route
  { const { ctx, page } = await F.newPage(browser, 1440, 900); await page.goto('http://127.0.0.1:5173/scenes/pulse-loop-kit', { waitUntil: 'load' }); await F.sleep(4000);
    R.inApp = await page.evaluate(() => ({ signIn: /sign in required/i.test(document.body.innerText), hasChoose: /Choose video/.test(document.body.innerText), text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 200) }));
    await page.screenshot({ path: path.join(SH, 'inapp-scenes-1440.png') }); await ctx.close(); }
  F.save(path.join(F.ROOT, 'out', 'choose.json'), R);
  console.log(JSON.stringify(R, null, 1).slice(0, 6000));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
