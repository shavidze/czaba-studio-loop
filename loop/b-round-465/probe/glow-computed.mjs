// Fixture map: G1-G4 = TS7 glows 1-4, G14/G15 = TS7 glows 5/6 (0pt, 0dvh), G5/G6 = Tailwind rows with _ read as spaces, G7-G12 = CSS/function rows, G13 = the concat row with radius=8; N1-N7 = TS7 offsets rows (N7 = concat negative, radius=8).
// B round 465->466 pre-check / C row GLOW-COMPUTED: Chromium resolves each TS7 fixture's CSS value; prints offsets and blur.
// Usage (from store/): node <abs>/glow-computed.mjs <out.json>
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const cases = [
  ['G1', 'boxShadow', '0rem 0rem 20px red', 1], ['G2', 'boxShadow', '-0 0 20px red', 1], ['G3', 'boxShadow', '0 -0 20px red', 1],
  ['G4', 'boxShadow', '+0 0.0px 8px red', 1], ['G5', 'boxShadow', '0rem 0 20px red', 1], ['G6', 'textShadow', '0em 0 6px red', 1],
  ['G7', 'boxShadow', '0em 0 12px red', 1], ['G8', 'filter', 'drop-shadow(0rem 0 8px red)', 1], ['G9', 'boxShadow', '0 0 calc(4px * 2) red', 1],
  ['G10', 'textShadow', '0 0 max(2px, 1vw) red', 1], ['G11', 'boxShadow', '0 0 min(8px, 2vw) red', 1], ['G12', 'boxShadow', '0 0 clamp(4px, 1vw, 12px) red', 1],
  ['G13', 'boxShadow', '0 0 ' + 8 + 'px red', 1],
  ['G14', 'boxShadow', '0pt 0 8px red', 1], ['G15', 'boxShadow', '0 0dvh 8px red', 1],
  ['N1', 'boxShadow', '0rem 0rem 0 1px red', 0], ['N2', 'boxShadow', '0 0.5px 4px red', 0], ['N3', 'boxShadow', '-1px 0 8px red', 0],
  ['N4', 'boxShadow', '0 0 0rem 1px red', 0], ['N5', 'boxShadow', '0rem 2px 8px black', 0], ['N6', 'filter', 'drop-shadow(0 1rem 8px red)', 0],
  ['N7', 'boxShadow', '0 2px ' + 8 + 'px red', 0],
];
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<div id="t" style="width:10px;height:10px"></div>');
const rows = [];
for (const [id, prop, value, expectGlow] of cases) {
  const computed = await page.evaluate(([p, v]) => { const el = document.getElementById('t'); el.removeAttribute('style'); el.style[p] = v; return { set: el.style[p], computed: getComputedStyle(el)[p] }; }, [prop, value]);
  const nums = [...computed.computed.replace(/rgba?\([^)]*\)/g, '').matchAll(/-?\d*\.?\d+px/g)].map((m) => Number.parseFloat(m[0]));
  const [x, y, blur, spread] = [nums[0] ?? NaN, nums[1] ?? NaN, nums[2] ?? 0, nums[3] ?? 0];
  const glow = x === 0 && y === 0 && blur > 0 ? 1 : 0;
  rows.push({ id, prop, value, computed: computed.computed, x, y, blur, spread, glow, expectGlow, ok: glow === expectGlow && computed.set !== '' });
}
await browser.close();
writeFileSync(process.argv[2], JSON.stringify({ chromium: true, rows, allOk: rows.every((r) => r.ok) }, null, 1));
console.log(rows.map((r) => `${r.id} ${r.ok ? 'OK' : 'MISMATCH'} glow=${r.glow} ${r.computed}`).join('\n'));
