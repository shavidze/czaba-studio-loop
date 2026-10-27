// A round 204: sample CTA hover transition (Tailwind v4 scale property). node ctahover.cjs <port> <W>
const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : W === 1280 ? 720 : 812;
(async () => {
  const browser = await F.launch(); const { ctx, page } = await F.newPage(browser, W, H, {});
  await page.addInitScript(() => localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: '2026-10-27', dismissed: true, submitted: false })));
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load', timeout: 120000 }); await F.sleep(3000); await F.declineCookies(page);
  const cta = page.locator('section.bg-gradient-to-b a[href="/store"]');
  await cta.evaluate((el) => el.scrollIntoView({ block: 'center' })); await F.sleep(2500);
  const read = () => cta.evaluate((el) => { const cs = getComputedStyle(el); return { tp: cs.transitionProperty, scale: cs.scale, transform: cs.transform, inline: el.style.cssText, bg: cs.backgroundColor, parentTag: el.parentElement.tagName, parentTabindex: el.parentElement.getAttribute('tabindex') }; });
  await cta.evaluate((el) => { el.className = 'inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-semibold text-background transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-brand-hover active:scale-[0.98]'; }); await F.sleep(200);
  const out = { W, ruling: true, before: await read() };
  const b = await cta.boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await F.sleep(40); out.hover40 = await read(); await F.sleep(300); out.hover340 = await read();
  await page.mouse.down(); await F.sleep(300); out.press = await read(); await page.mouse.up();
  F.save(path.join(__dirname, '..', 'out', `ctahover-ruling-${PORT}-${W}.json`), out); console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
