const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path');
const BASE = 'http://127.0.0.1:5173'; const SH = path.join(__dirname, '..', 'shots');
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const tag = `${w}x${h}`; const R = {}; const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    const errors = []; p.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
    await p.goto(`${BASE}/products/middle-east`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    R.p1 = { url: p.url(), title: await p.title(), h1: (await p.locator('h1').first().textContent().catch(() => null))?.trim() };
    await p.screenshot({ path: path.join(SH, `journey-1-product-${tag}.png`) });
    const link = p.getByRole('link', { name: /Try it in the Studio/i }).first();
    R.p1.tryLink = { count: await p.getByRole('link', { name: /Try it in the Studio/i }).count(), href: await link.getAttribute('href').catch(() => null), target: await link.getAttribute('target').catch(() => null) };
    await link.click();
    await p.waitForURL(/studio-lab/, { timeout: 20000 });
    await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 45000 }).catch(() => {});
    await p.waitForTimeout(800);
    R.p2 = { url: p.url(), active: await p.evaluate(() => ({ id: document.activeElement?.getAttribute('data-source-id'), sel: document.activeElement?.getAttribute('aria-selected') })), status: await p.locator('[data-testid="arrangement-status"]').textContent() };
    await p.screenshot({ path: path.join(SH, `journey-2-studio-${tag}.png`) });
    R.title = await p.title(); await p.keyboard.press('Enter'); await p.waitForTimeout(1000);
    R.clips = await p.locator('[data-clip-id]').count();
    const st = () => p.getByTestId('arrangement-playback-state').innerText();
    await p.keyboard.press('Space'); await p.waitForTimeout(1300); R.playState = await st(); R.pos = await p.getByTestId('arrangement-position').innerText();
    await p.keyboard.press('Space'); await p.waitForTimeout(300); R.stopState = await st();
    await p.screenshot({ path: path.join(SH, `journey-2b-played-${tag}.png`) });
    const [dlx] = await Promise.all([p.waitForEvent('download', { timeout: 120000 }).catch(() => null), (async () => { await p.getByRole('button', { name: /^Export/ }).first().click(); await p.waitForTimeout(600); const dg = p.getByRole('dialog'); await dg.getByText(/^WAV · 24-bit/).first().click().catch(() => {}); await dg.getByRole('button', { name: /^Export|Download|Render/i }).last().click(); })()]);
    if (dlx) { const wp = path.join(SH, `journey-export-${tag}.wav`); await dlx.saveAs(wp); const bf = fs.readFileSync(wp); let nz = 0, pk = 0; for (let i = 44; i + 2 < bf.length; i += 3) { const v = ((bf[i] | (bf[i + 1] << 8) | (bf[i + 2] << 16)) << 8 >> 8) / 8388608; if (v !== 0) nz++; if (Math.abs(v) > pk) pk = Math.abs(v); } R.exportWav = { size: bf.length, sr: bf.readUInt32LE(24), bits: bf.readUInt16LE(34), nonzero: nz, peak: pk }; } else R.exportWav = null;
    await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(SH, `journey-2c-exported-${tag}.png`) });
    const o = p.locator('[role="option"][data-source-id="demo-middle-east"]'); const bb = await o.boundingBox();
    await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2, { button: 'right' }); await p.waitForTimeout(300);
    R.p3 = { menus: await p.getByRole('menu').count() };
    await p.screenshot({ path: path.join(SH, `journey-3-menu-${tag}.png`) });
    const pP = ctx.waitForEvent('page', { timeout: 10000 }).catch(() => null);
    await p.getByRole('menuitem', { name: 'View in store' }).click();
    const np = await pP;
    if (np) {
      await np.waitForLoadState('networkidle').catch(() => {}); await np.waitForTimeout(1500);
      R.p4 = { url: np.url(), opener: await np.evaluate(() => window.opener === null), title: await np.title(), h1: (await np.locator('h1').first().textContent().catch(() => null))?.trim(), tryLink: await np.getByRole('link', { name: /Try it in the Studio/i }).count() };
      await np.screenshot({ path: path.join(SH, `journey-4-newtab-${tag}.png`) }); await np.close();
    } else R.p4 = null;
    await p.bringToFront(); await p.waitForTimeout(300);
    R.studioAfter = { url: p.url(), menus: await p.getByRole('menu').count(), active: await p.evaluate(() => document.activeElement?.getAttribute('data-source-id')) };
    R.errors = errors; out[tag] = R; await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, '..', 'journey.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close();
})();
