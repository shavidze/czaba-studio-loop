// Usage: node lane.cjs [baseUrl]  (run from store/ so playwright resolves). Read-only probe of /studio-lab.
const { chromium } = require('@playwright/test');
(async () => {
  const base = process.argv[2] || 'http://127.0.0.1:5173';
  const browser = await chromium.launch();
  const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const page = await (await browser.newContext({ viewport: vp })).newPage();
    await page.goto(base + '/studio-lab', { waitUntil: 'load' });
    await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 60000 });
    const lanesBefore = await page.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((e) => e.getAttribute('data-track-id')));
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.locator('[data-clip-kind="audio"]').first().waitFor();
    const r = await page.locator('[data-clip-kind="audio"]').first().evaluate((clipElement) => {
      const ownLane = clipElement.closest('[data-track-id]');
      const lanes = [...document.querySelectorAll('[data-track-id]')];
      const res = { ownTrack: ownLane && ownLane.getAttribute('data-track-id'), lanes: [] };
      for (const lane of lanes) {
        const box = lane.getBoundingClientRect();
        const y = box.top + box.height / 2;
        const right = Math.min(box.right, window.innerWidth) - 4;
        let found = null;
        for (let x = Math.max(box.left, 0) + 4; x <= right; x += 8) {
          const hit = document.elementFromPoint(x, y);
          if (hit !== null && hit.closest('[data-track-id]') === lane && hit.closest('[data-clip-id]') === null && hit.closest('button, input, [role="slider"]') === null && x > window.innerWidth * 0.5) { found = { x, y }; break; }
        }
        res.lanes.push({ id: lane.getAttribute('data-track-id'), nestedInOwn: ownLane ? (ownLane.contains(lane) || lane.contains(ownLane)) && lane !== ownLane : null, empty: found });
      }
      return res;
    });
    out[`${vp.width}x${vp.height}`] = { lanesBefore, ...r };
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
