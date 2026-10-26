const L = require('./lib.cjs');
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); } catch {} });
  const p = await ctx.newPage(); const pe = []; p.on('pageerror', (e) => pe.push(String(e)));
  await p.goto('http://127.0.0.1:5173/support', { waitUntil: 'load', timeout: 90000 }); await L.sleep(3000);
  await p.locator('button', { hasText: 'Live Chat' }).first().click(); await L.sleep(2000);
  await p.locator('button', { hasText: 'Start Chat' }).first().click(); await L.sleep(800);
  const r = await p.evaluate(() => ['#guest-name', '#guest-email'].map((s) => { const e = document.querySelector(s); const cs = getComputedStyle(e); return { s, cls: e.className, bc: cs.borderTopColor, err: e.parentElement.querySelector('p.text-destructive')?.textContent || null }; }));
  console.log(JSON.stringify({ r, pe }));
  await p.screenshot({ path: '../shots/guest-error-1440.png' });
  await b.close();
})();
