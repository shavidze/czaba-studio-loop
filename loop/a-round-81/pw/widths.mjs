import { createRequire } from 'node:module';
const { chromium } = createRequire('/home/runner/czaba-project/store/package.json')('@playwright/test');
const out = process.argv[2];
const browser = await chromium.launch();
const result = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text().slice(0, 200)); });
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
  await page.waitForSelector('[data-track-id="stems"]', { state: 'attached' }); await page.waitForTimeout(1500);
  const lane = (n) => page.getByRole('button', { name: new RegExp(`^${n} — აქტიური ხაზის არჩევა`) });
  const gname = (n) => page.getByRole('button', { name: new RegExp(`^${n} — ჯგუფი`) });
  await lane('სტემები').click();
  await lane('SFX').click({ modifiers: ['Shift'] });
  await page.keyboard.press('Control+g');
  await lane('მუსიკა').click();
  await gname('ჯგუფი 1').click({ modifiers: ['Shift'] });
  await page.keyboard.press('Control+g');
  await gname('ჯგუფი 2').click();
  await page.keyboard.press('Control+g');
  const measure = () => page.$$eval('[data-testid="arrangement-group-row"]', (rows) => rows.map((row) => {
    const r = (sel) => { const el = row.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { w: Math.round(b.width * 10) / 10, h: Math.round(b.height * 10) / 10 }; };
    return { depth: row.dataset.groupDepth, row: Math.round(row.getBoundingClientRect().height), name: r('[data-testid="arrangement-group-name"]'), mute: r('[data-testid="arrangement-group-mute"]'), solo: r('[data-testid="arrangement-group-solo"]'), volume: r('[data-testid="arrangement-group-volume"]'), text: row.textContent.replace('▣', '').trim() };
  }));
  const expanded = await measure();
  await lane('სტემები').locator('xpath=ancestor::*[@data-track-id][1]').getByRole('button', { name: /^Solo — სტემები/ }).click();
  await page.waitForTimeout(200);
  const solo = await page.$$eval('[data-testid="arrangement-group-solo"]', (els) => els.map((e) => ({ pressed: e.getAttribute('aria-pressed'), data: e.dataset.solo, bg: getComputedStyle(e).backgroundImage.slice(0, 160), content: getComputedStyle(e, '::before').content })));
  const header = page.locator('[data-testid="arrangement-group-row"]').first();
  await page.screenshot({ path: `${out}/half-solo-${w}x${h}.png`, clip: await (async () => { const b = await header.boundingBox(); return { x: 0, y: b.y - 4, width: 520, height: 28 * 3 + 120 }; })() });
  result[`${w}x${h}`] = { expanded, solo, errors: errors.filter((e) => !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource/i.test(e)) };
  await page.close();
}
await browser.close();
console.log(JSON.stringify(result, null, 1));
