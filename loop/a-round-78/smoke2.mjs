import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.text()); });
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
await page.getByTestId('arrangement-ruler').waitFor({ state: 'attached' });
await page.getByRole('button', { name: /დამატება/ }).last().click();
await page.waitForFunction(() => document.querySelectorAll('[data-clip-id]').length > 0, null, { timeout: 30000 });
await page.waitForTimeout(500);
const ruler = page.getByTestId('arrangement-ruler');
const info = await page.evaluate(() => ({
  zoom: document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent,
  snap: document.querySelector('[data-testid="arrangement-grid-control"]')?.dataset.snap,
  grid: document.querySelector('[data-testid="arrangement-grid-control"]')?.dataset.gridSeconds,
}));
const pps = Number.parseFloat(info.zoom);
const box = await ruler.boundingBox();
const scrollLeft = await page.evaluate(() => { const r = document.querySelector('[data-testid="arrangement-ruler"]'); return r.getBoundingClientRect().left; });
const xAt = (t) => scrollLeft + t * pps;
const pos = async () => { const v = await page.getByTestId('arrangement-playhead-handle').getAttribute('aria-valuenow'); const st = await page.evaluate(() => ({ snap: document.querySelector('[data-testid="arrangement-grid-control"]').dataset.snap, zoom: document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent })); await page.waitForTimeout(700); return `${v} snap=${st.snap} zoom=${st.zoom}`; };
const y = box.y + box.height / 2;
async function setSnap(on) {
  const s = await page.evaluate(() => document.querySelector('[data-testid="arrangement-grid-control"]').dataset.snap);
  if ((s === 'on') !== on) { await page.locator('body').press('g'); await page.waitForTimeout(300); }
}
await page.selectOption('[data-testid="arrangement-grid-division"]', '1');
await setSnap(false);
await page.mouse.click(xAt(6.375), y);
const placed = await pos();
await page.keyboard.press('m');
await page.keyboard.press('Enter');
const markers = await page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((e) => e.dataset.markerTime));
const pre = {};
await page.keyboard.down('Alt'); await page.mouse.click(xAt(6.45), y); await page.keyboard.up('Alt'); pre.offAltFirst = await pos();
await page.keyboard.down('Alt'); await page.mouse.click(xAt(7.3), y); await page.keyboard.up('Alt'); pre.offAlt73 = await pos();
await page.mouse.move(xAt(7.7), y); await page.keyboard.down('Alt'); await page.mouse.down(); await page.mouse.up(); await page.keyboard.up('Alt'); pre.offAlt77manual = await pos();
console.log(JSON.stringify(pre));
await setSnap(true);
const out = { info, pps, placed, markers };
await page.mouse.click(xAt(6.45), y); out.snapOn645 = await pos();
await page.mouse.click(xAt(6.1), y); out.snapOn610 = await pos();
await page.keyboard.down('Alt'); await page.mouse.click(xAt(6.45), y); await page.keyboard.up('Alt'); out.snapOnAlt645 = await pos();
await setSnap(false);
await page.mouse.click(xAt(6.45), y); out.snapOff645 = await pos();
await page.keyboard.down('Alt'); await page.mouse.click(xAt(6.45), y); await page.keyboard.up('Alt'); out.snapOffAlt645 = await pos();
await setSnap(true);
await page.mouse.dblclick(xAt(3), y); await page.waitForTimeout(300);
out.zoomAfterDbl = await page.getByTestId('arrangement-zoom-readout').textContent();
out.consoleErrors = logs.filter((l) => !/cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL|Failed to load resource/i.test(l));
await page.screenshot({ path: 'smoke-1440.png' });
console.log(JSON.stringify(out, null, 1));
await browser.close();
