// usage: node extras-probe.cjs <baseUrl> <out.json> <shotDir> - C6 selection (1440) and C7 forced-colors (1440) on / hero + Releases and /about Cinema
const { createRequire } = require('module'); const req = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = req('playwright');
const fs = require('fs'); const path = require('path');
const [BASE, OUT, SHOTS] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const T = [{ id: 'HERO', path: '/', phrase: 'CZABA', word: 'CZABA', tag: 'H1' }, { id: 'RELEASES', path: '/', phrase: 'Latest Releases', word: 'Releases' }, { id: 'ABOUT-CINEMA', path: '/about', phrase: 'Crafting Sound for Cinema', word: 'Cinema' }];
const mark = (t) => { const hs = [...document.querySelectorAll('h1,h2,h3')].filter((h) => (h.textContent || '').replace(/\s+/g, ' ').trim().startsWith(t.phrase) && (!t.tag || h.tagName === t.tag));
  for (const h of hs) { const s = [...h.querySelectorAll(':scope > span')].find((x) => x.textContent.trim() === t.word); if (s) { s.setAttribute('data-bx', t.id); return true; } } return false; };
const inkOf = async (page, b64) => page.evaluate(async (b) => { const i = new Image(); i.src = 'data:image/png;base64,' + b; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
  const px = []; for (let k = 0; k < d.length; k += 4) px.push([d[k], d[k + 1], d[k + 2]]); const lum = (p) => p[0] * 0.2126 + p[1] * 0.7152 + p[2] * 0.0722; const sorted = [...px].sort((a, z) => lum(a) - lum(z)); const bg = sorted[Math.floor(px.length * 0.1)];
  const ink = px.filter((p) => Math.hypot(p[0] - bg[0], p[1] - bg[1], p[2] - bg[2]) > 60); const sel = px.filter((p) => p[2] > p[0] + 25).length; return { inkFraction: Math.round((ink.length / px.length) * 1000) / 1000, bluishFraction: Math.round((sel / px.length) * 1000) / 1000, bg }; }, b64);
(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const b = await chromium.launch({ headless: true, args: ['--disable-lcd-text'] }); const res = { base: BASE, selection: {}, forced: {} };
  for (const mode of ['selection', 'forced']) {
    for (const p of ['/', '/about']) {
      const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', forcedColors: mode === 'forced' ? 'active' : 'none' });
      await ctx.addInitScript(() => { try { localStorage.setItem('cookie-consent', 'declined'); localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); } catch (e) {} });
      const page = await ctx.newPage(); await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 90000 }); await page.waitForSelector('h1', { timeout: 60000 }).catch(() => {}); await sleep(2500);
      for (let y = 0; y < 6000; y += 500) { await page.evaluate((v) => window.scrollTo(0, v), y); await sleep(200); }
      for (const t of T.filter((x) => x.path === p)) {
        const ok = await page.evaluate(mark, t); if (!ok) { res[mode][t.id] = { found: false }; continue; }
        const el = page.locator(`[data-bx="${t.id}"]`); await el.scrollIntoViewIfNeeded(); await sleep(1200);
        if (mode === 'selection') { if (t.id === 'HERO') continue; await el.dblclick(); await sleep(300);
          const s = await page.evaluate(() => window.getSelection().toString()); const shot = await el.screenshot({ animations: 'disabled', timeout: 120000 }); fs.writeFileSync(path.join(SHOTS, `select-${t.id}.png`), shot);
          res.selection[t.id] = { found: true, selected: s, ...(await inkOf(page, shot.toString('base64'))) }; await page.evaluate(() => window.getSelection().removeAllRanges()); }
        else { const fill = await el.evaluate((e) => getComputedStyle(e).webkitTextFillColor); const forced = await page.evaluate(() => matchMedia('(forced-colors: active)').matches); const shot = await el.screenshot({ animations: 'disabled', timeout: 120000 }); fs.writeFileSync(path.join(SHOTS, `forced-${t.id}.png`), shot);
          res.forced[t.id] = { found: true, forcedMediaMatches: forced, fill, ...(await inkOf(page, shot.toString('base64'))) }; }
      }
      await ctx.close();
    }
  }
  await b.close(); fs.writeFileSync(OUT, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
})();
