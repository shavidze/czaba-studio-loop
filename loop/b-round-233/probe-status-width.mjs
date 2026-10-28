import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const browser = await chromium.launch();
const out = {};
const cands = {
  long: '“ღამის პულსი · სრული მიქსი” added to the Music track at 00:00.000. Tempo 120 BPM from “ღამის პულსი · სრული მიქსი” — bars ruler on. Grid only: audio is not stretched. Snap on — grid 1/4 (G)',
  short: '“ღამის პულსი · სრული მიქსი” added to the Music track at 00:00.000. Tempo 120 BPM from “ღამის პულსი · სრული მიქსი”: grid 1/4, Snap on (G). Audio is not stretched.',
  shortNoSnap: '“ღამის პულსი · სრული მიქსი” added to the Music track at 00:00.000. Tempo 120 BPM from “ღამის პულსი · სრული მიქსი”. Audio is not stretched.',
};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  out[`${w}`] = await page.evaluate((cands) => {
    const s = document.querySelector('[data-testid="arrangement-status"]');
    const r = {}; const before = s.getBoundingClientRect().height;
    for (const [k, t] of Object.entries(cands)) { s.textContent = t; r[k] = { h: s.getBoundingClientRect().height, sw: s.scrollWidth, cw: s.clientWidth, chars: t.length }; }
    r.before = before; return r;
  }, cands);
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
