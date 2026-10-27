const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const path = require('node:path');
(async () => {
  const src = require('node:fs').readFileSync(path.join(__dirname, 'choose-video-harness.cjs'), 'utf8');
  const mountSrc = src.slice(src.indexOf('async function mount'), src.indexOf('(async () => {'));
  const base = 'http://127.0.0.1:5173';
  const mount = eval(`(${mountSrc.replace('async function mount', 'async function').replace(/async function focusChoose[\s\S]*$/, '')})`);
  const b = await chromium.launch(); const out = [];
  for (const [w, h] of [[1280, 720], [1440, 900]]) for (let i = 0; i < 3; i++) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await mount(p, false); await p.focus('#prev'); await p.keyboard.press('Tab'); await p.waitForTimeout(400);
    const active = await p.evaluate(() => document.activeElement.textContent.trim());
    const [fc] = await Promise.all([p.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null), p.keyboard.press(' ')]);
    out.push({ vp: `${w}x${h}`, i, active, space: fc ? 'filechooser' : 'none' }); await p.close();
  }
  console.log(JSON.stringify(out)); await b.close();
})();
