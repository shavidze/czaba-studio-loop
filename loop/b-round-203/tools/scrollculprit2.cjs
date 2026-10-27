const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2]; const W = 1280, H = 720;
(async () => {
  const browser = await F.launch(); const { ctx, page } = await F.newPage(browser, W, H, {});
  await page.addInitScript(() => {
    window.__log = [];
    const wrap = (obj, name) => { const orig = obj[name]; if (!orig) return; obj[name] = function (...a) { window.__log.push({ fn: name, args: JSON.stringify(a).slice(0, 80), stack: new Error().stack.split('\n').slice(2, 8).join(' | ') }); return orig.apply(this, a); }; };
    wrap(window, 'scrollTo'); wrap(window, 'scroll'); wrap(window, 'scrollBy'); wrap(Element.prototype, 'scrollIntoView'); wrap(Element.prototype, 'scrollTo'); wrap(HTMLElement.prototype, 'focus');
    const d = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop'); Object.defineProperty(Element.prototype, 'scrollTop', { get() { return d.get.call(this); }, set(v) { window.__log.push({ fn: 'scrollTop=', args: String(v), el: this.tagName, stack: new Error().stack.split('\n').slice(2, 8).join(' | ') }); d.set.call(this, v); } });
    window.__minSh = 1e9; new ResizeObserver(() => { window.__minSh = Math.min(window.__minSh, document.documentElement.scrollHeight); window.__log.push({ fn: 'resize', sh: document.documentElement.scrollHeight, y: scrollY }); }).observe(document.documentElement); let last = 0; window.addEventListener('scroll', () => { if (Math.abs(scrollY - last) > 500) window.__log.push({ fn: 'scroll-event', args: `${last}->${scrollY}`, sh: document.documentElement.scrollHeight, minSh: window.__minSh, active: document.activeElement && document.activeElement.textContent.trim().slice(0, 20) }); last = scrollY; }, true);
  });
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' }); await F.sleep(3500); await F.declineCookies(page); await page.mouse.move(2, H - 2);
  await page.evaluate(() => { window.__log = []; });
  await page.keyboard.press('End'); await F.sleep(2500);
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Shift+Tab'); await F.sleep(1500); }
  const log = await page.evaluate(() => window.__log);
  F.save(path.join(__dirname, '..', 'out', `scrollculprit2-${PORT}.json`), log);
  for (const l of log) console.log(JSON.stringify(l).slice(0, 600));
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
