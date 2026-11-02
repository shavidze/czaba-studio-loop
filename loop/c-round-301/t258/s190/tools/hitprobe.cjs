// C round 190 — diagnose HIT miss at 1280: what covers the card Play after loader removal. node hitprobe.cjs <W> [seen]
const L = require('./lib.cjs'); const D = require('./ld.cjs'); const path = require('path');
const W = process.argv[2]; const SEEN = process.argv[3] === 'seen';
(async () => {
  const b = await L.chromium.launch({ headless: true }); const { ctx, page } = await D.fresh(b, W);
  if (SEEN) await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  await page.goto(L.BASE + '/', { waitUntil: 'commit' });
  await page.waitForFunction(() => document.querySelectorAll('button[class*="audio-preview"]').length > 3, null, { timeout: 20000, polling: 'raf' });
  await page.evaluate((i) => { const b = document.querySelectorAll('button[class*="audio-preview"]')[i]; b.scrollIntoView({ block: 'center' }); }, D.CARD_IDX[W]);
  if (!SEEN) { await D.waitIns(page, 8000); await D.waitRem(page, 8000); }
  const snaps = [];
  for (const dt of [100, 1500]) { await L.sleep(dt);
    snaps.push(await page.evaluate((i) => { const b = document.querySelectorAll('button[class*="audio-preview"]')[i]; const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); const chain = []; for (let c = e; c && chain.length < 6; c = c.parentElement) chain.push(c.tagName + '.' + String(c.className).slice(0, 50) + (c.getAttribute('aria-label') ? '[' + c.getAttribute('aria-label') + ']' : '')); return { rect: [r.x, r.y, r.width, r.height].map(Math.round), vis: getComputedStyle(b).visibility, op: getComputedStyle(b).opacity, scrollY, label: b.getAttribute('aria-label'), chain, hit: !!(e && (e === b || b.contains(e))) }; }, D.CARD_IDX[W])); }
  await page.screenshot({ path: path.join(__dirname, '..', 'shots', `hitprobe-${W}${SEEN ? '-seen' : ''}.png`) });
  console.log(JSON.stringify(snaps, null, 1)); await b.close();
})();
