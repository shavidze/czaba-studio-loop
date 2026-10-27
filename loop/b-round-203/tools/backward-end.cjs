const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : W === 1280 ? 720 : 812;
const probe = () => { const a = document.activeElement; let o = 1, n = a, chain = []; while (n && n.nodeType === 1) { const op = parseFloat(getComputedStyle(n).opacity); if (op < 0.99) chain.push([n.tagName, op, (n.className || '').toString().slice(0, 30)]); o *= op; n = n.parentElement; } const r = a.getBoundingClientRect(); return { tag: a.tagName, name: (a.textContent || '').trim().slice(0, 30), eff: +o.toFixed(3), chain, top: +r.top.toFixed(0), bottom: +r.bottom.toFixed(0) }; };
(async () => {
  const browser = await F.launch(); const out = [];
  for (const mode of ['end-key-shift-tab']) {
    const { ctx, page } = await F.newPage(browser, W, H, {});
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' }); await F.sleep(3500); await F.declineCookies(page); await page.mouse.move(2, H - 2);
    if (mode === 'end-key-shift-tab') { await page.keyboard.press('End'); await F.sleep(2500); }
    else { await page.evaluate(() => { const s = [...document.querySelectorAll('section')].find((x) => x.textContent.includes('Personal Mixdown')); let n = s.parentElement; while (n && !n.nextElementSibling) n = n.parentElement; const nx = n.nextElementSibling; const f = nx.querySelector('a,button,input'); f.focus(); }); await F.sleep(800); }
    let rec = null;
    for (let i = 0; i < 80; i++) { await page.keyboard.press('Shift+Tab'); await F.sleep(1200); const d = await page.evaluate(probe); if (/Browse the Collection/.test(d.name)) { await F.sleep(2000); rec = { at: i, first: d, after2s: await page.evaluate(probe) }; await page.screenshot({ path: path.join(__dirname, '..', 'out', `backward-end-${mode}-${PORT}-${W}.png`) }); break; } }
    out.push({ mode, rec }); await ctx.close();
  }
  F.save(path.join(__dirname, '..', 'out', `backward-end-${PORT}-${W}.json`), out); console.log(PORT, W, JSON.stringify(out));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
