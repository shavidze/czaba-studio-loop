const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const out = {};
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => /Demo collection ready/.test(document.querySelector('[data-testid=arrangement-status]')?.textContent || ''), null, { timeout: 30000 });
  const s = () => p.evaluate(() => { const q = (x) => document.querySelector(x); const play = [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === 'Play');
    return { m: q('[data-insert-marker]')?.getAttribute('data-insert-marker'), ph: Number(q('[data-testid=arrangement-playhead-handle]')?.getAttribute('aria-valuenow')), playing: play?.dataset.playing, status: q('[data-testid=arrangement-status]')?.textContent,
      clips: document.querySelectorAll('[data-clip-id]').length, bpm: q('input[aria-label*="BPM" i], input[aria-label*="Tempo" i]')?.value, snap: [...document.querySelectorAll('button')].find(b => /^Snap/.test(b.textContent.trim()))?.getAttribute('aria-pressed'), grid: q('[data-testid=arrangement-transport-view] select, select')?.value, gridText: [...document.querySelectorAll('select')].map(x => x.selectedOptions[0]?.textContent).join('|') }; });
  out.fresh = await s();
  await p.locator('[data-testid=arrangement-library] [role=option]').first().click(); await p.keyboard.press('Enter'); await sleep(2500); out.afterAdd = await s();
  const ruler = await p.locator('[data-testid=arrangement-ruler]').boundingBox();
  const pxps = await p.evaluate(() => { const t = document.querySelector('[data-testid=arrangement-ruler]'); return t ? null : null; });
  // find px/s from zoom readout
  out.zoomText = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-transport] *')].map(e => e.childNodes.length === 1 && e.firstChild.nodeType === 3 ? e.textContent : '').filter(t => /px\/s/.test(t))[0]);
  const pps = parseFloat(out.zoomText) || 40;
  const scroller = await p.locator('[data-testid=arrangement-timeline-scroller]').boundingBox();
  const x0 = await p.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect(); return r.left; });
  out.rulerLeft = x0; out.pps = pps;
  const xAt = (t) => x0 + t * pps;
  await p.mouse.click(xAt(2), ruler.y + ruler.height / 2); await sleep(300); out.afterRulerClick2 = await s();
  await p.keyboard.press('Space'); await sleep(1200); out.playing1 = await s();
  await p.keyboard.press('Space'); await sleep(300); out.stopped1 = await s();
  await p.keyboard.press('Space'); await sleep(200); out.restart = await s();
  await p.keyboard.press('Space'); await sleep(300);
  await p.keyboard.press('Shift+Space'); await sleep(300); out.shiftSpace = await s();
  await p.keyboard.press('Space'); await sleep(300);
  await p.keyboard.press('Home'); await sleep(200); out.home = await s();
  const h = await p.locator('[data-testid=arrangement-playhead-handle]').boundingBox();
  out.handle = h;
  if (h) { await p.mouse.move(h.x + h.width / 2, h.y + h.height / 2); await p.mouse.down(); await p.mouse.move(xAt(6), h.y + h.height / 2, { steps: 8 }); await p.mouse.up(); await sleep(300); out.afterHandleDrag6 = await s(); }
  require('fs').writeFileSync('recipes2.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close();
})();
