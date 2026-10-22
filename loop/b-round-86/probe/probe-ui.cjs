const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await sleep(3000);
  const clips = await page.$$eval('[data-clip-id]', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { id: e.dataset.clipId, x: r.x, y: r.y, w: r.width, h: r.height, label: (e.getAttribute('aria-label') || e.textContent || '').slice(0, 50) }; }));
  const out = { clips: clips.length, clipInfo: clips.slice(0, 8) };
  const label = async () => page.evaluate(() => document.body.innerText.match(/მთელი პროექტი · 0:00 — [^\n]+|მთელი პროექტი · 00:00\.000 — [^\n]+/)?.[0] ?? null);
  // select all visible clips with shift-click then Ctrl+D
  const vis = clips.filter((c) => c.w > 4 && c.x > 0 && c.y > 0);
  for (let k = 0; k < vis.length; k++) {
    const c = vis[k];
    await page.mouse.click(Math.round(c.x + Math.min(c.w / 2, 30)), Math.round(c.y + c.h / 2), { modifiers: k ? ['Shift'] : [] });
  }
  for (let i = 0; i < 2; i++) { await page.keyboard.press('Control+d'); await sleep(500); }
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await page.waitForSelector('#arrangement-export-title');
  await sleep(500);
  out.projectLabel = await label();
  out.dlgText = await page.evaluate(() => document.querySelector('#arrangement-export-title').closest('[role=dialog]').innerText.slice(0, 900)); console.log(JSON.stringify(out));
  await page.evaluate(() => { window.__gaps = []; let last = performance.now(); window.__run = true; const t = () => { const n = performance.now(); window.__gaps.push(n - last); last = n; if (window.__run) requestAnimationFrame(t); }; requestAnimationFrame(t); });
  const dl = page.waitForEvent('download', { timeout: 120000 });
  const t0 = Date.now();
  await page.getByRole('button', { name: 'WAV-ის ექსპორტი' }).click();
  const d = await dl;
  out.wavMs = Date.now() - t0;
  await sleep(500);
  out.gaps = await page.evaluate(() => { window.__run = false; return window.__gaps.slice().sort((a, b) => b - a).slice(0, 6).map(Math.round); });
  const p = await d.path(); const fs = require('fs'); out.wavBytes = fs.statSync(p).size; out.frames = (out.wavBytes - 44) / 6;
  out.msg = await page.evaluate(() => [...document.querySelectorAll('[role=status],[role=alert]')].map((e) => e.textContent).join(' | '));
  await d.delete();
  console.log(JSON.stringify(out));
  await browser.close();
})();
