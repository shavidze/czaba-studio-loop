// HIDDEN-204: forward Tab sweep. node hidden.cjs <port> <W> <label> [unseeded]
const L = require('./lib.cjs'); const path = require('path');
const [PORT, Ws, LABEL, UNS] = process.argv.slice(2); const W = +Ws;
const PAGES = (process.env.PAGES || '/,/store,/products/middle-east,/about,/free-downloads').split(',');
(async () => {
  const browser = await L.launch(); const R = { PORT, W, LABEL, seeded: !UNS, pages: {} };
  for (const p of PAGES) {
    const { ctx, page, log } = await L.newPage(browser, W, { suppress: !UNS });
    await page.goto(`http://127.0.0.1:${PORT}${p}`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3500);
    await L.declineCookies(page); await L.sleep(400); await page.mouse.move(2, L.H(W) - 2);
    const stops = []; let first = null; let popupSeen = false;
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab'); await L.sleep(300);
      const d = await L.describeActive(page); if (!d) continue;
      const key = `${d.tag}|${d.name}|${d.href}`; if (key === first && d.scrollY < 50 && i > 5) break; if (!first) first = key;
      if (await L.popupOpen(page)) { popupSeen = true; d.popup = true; }
      if (d.eff < 0.99 || !d.vis || d.clipped) { await L.sleep(2000); const d2 = await L.describeActive(page); d.after2s = d2 && { eff: d2.eff, vis: d2.vis, clipped: d2.clipped, onScreen: d2.onScreen }; }
      d.i = i; stops.push({ i, tag: d.tag, name: d.name, href: d.href, tabindex: d.tabindex, eff: d.eff, vis: d.vis, clipped: d.clipped, after2s: d.after2s, popup: d.popup });
    }
    const hidden = stops.filter((s) => s.after2s && (s.after2s.eff < 0.99 || !s.after2s.vis || s.after2s.clipped));
    R.pages[p] = { total: stops.length, hidden, popupSeen, errors: log.errors, stops };
    await ctx.close();
  }
  L.save(path.join(L.OUT, 'hidden', `nobreak-${LABEL}-${W}.json`), R);
  for (const [p, v] of Object.entries(R.pages)) console.log(LABEL, W, p, 'stops', v.total, 'popup', v.popupSeen, 'hidden', v.hidden.map((s) => `${s.i}:${s.tag}:${s.name}:eff${s.after2s.eff}:vis${s.after2s.vis}:${s.after2s.clipped ? 'clip' : ''}`).join(' | '));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
