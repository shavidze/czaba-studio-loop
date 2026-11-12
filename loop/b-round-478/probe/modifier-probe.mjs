import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const out = { base: BASE, date: new Date().toISOString(), runs: [] };
const b = await chromium.launch();
const seed = () => { const d = new Date().toISOString().split('T')[0]; localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: d, dismissed: true, submitted: true })); };
const state = (p) => p.evaluate(() => ({ path: location.pathname, y: Math.round(scrollY), marker: window.__probeMarker ?? null, active: document.activeElement ? document.activeElement.tagName + ' ' + (document.activeElement.getAttribute('href') || '') : null, bodyFocusVisible: document.body.matches(':focus-visible') }));
for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
  for (const mode of ['ctrl-click', 'ctrl-enter', 'middle-click', 'same-route-click', 'kb-enter-focus-visible']) {
    const ctx = await b.newContext({ viewport: vp });
    await ctx.addInitScript(seed);
    const p = await ctx.newPage();
    await p.goto(BASE + '/faq', { waitUntil: 'networkidle', timeout: 90000 });
    await p.waitForTimeout(3500);
    await p.evaluate(() => { window.__probeMarker = 'alive'; });
    for (let i = 0; i < 40; i++) { await p.mouse.wheel(0, 600); await p.waitForTimeout(40); }
    await p.waitForTimeout(1800);
    const name = mode === 'kb-enter-focus-visible' ? 'Support' : 'FAQ';
    const link = p.locator('footer a', { hasText: name }).first();
    const box = await link.boundingBox();
    const pages = [];
    ctx.on('page', (np) => pages.push(np));
    if (mode === 'ctrl-click') await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2), await p.keyboard.down('Control'), await p.mouse.down(), await p.mouse.up(), await p.keyboard.up('Control');
    if (mode === 'middle-click') await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'middle' });
    if (mode === 'ctrl-enter') { await link.focus(); await p.keyboard.press('Control+Enter'); }
    if (mode === 'same-route-click') await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    if (mode === 'kb-enter-focus-visible') { await link.focus(); await p.keyboard.press('Enter'); }
    await p.waitForTimeout(2500);
    const s = await state(p);
    out.runs.push({ vp: vp.width + 'x' + vp.height, mode, newPages: pages.map((np) => np.url()), ...s });
    await ctx.close();
  }
}
console.log(JSON.stringify(out, null, 1));
await b.close();
