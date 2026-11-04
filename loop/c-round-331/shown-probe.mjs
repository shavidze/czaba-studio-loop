// C round 331: FADE-SHOWN, TRIM-SHOWN, MOVE-HINT, GROUP-SHOWN probe. Usage: node shown-probe.mjs <base> <WxH> <out.json>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2];
const [W, H] = process.argv[3].split('x').map(Number);
const out = process.argv[4];
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width: W, height: H } });
await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 240000 });
await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 240000 });
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
await page.locator('[data-clip-kind="audio"]').first().waitFor();
await page.waitForTimeout(800);
await page.waitForTimeout(1200);
const clips = page.locator('[data-clip-kind="audio"]');
const clip = clips.first();
const clip2 = clips.nth(1);
const result = { base, viewport: `${W}x${H}`, samples: [] };
const sample = async (label) => {
  const s = await page.evaluate(() => {
    const q = (sel) => document.querySelector(sel);
    const ro = q('[data-testid="arrangement-selected-clip"]');
    const hint = q('[data-testid="arrangement-lane-move-hint"]');
    const dc = q('[data-testid="arrangement-detail-content"]');
    const range = q('[data-testid="arrangement-detail-clip-gain-range"]');
    const gin = q('[data-testid="arrangement-detail-clip-gain-input"]');
    const cl = [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => {
      const f = c.matches('[data-fade-in]') ? c : c.querySelector('[data-fade-in]');
      return f?.getAttribute('data-fade-in') ?? null;
    });
    return {
      readout: ro ? ro.textContent : null,
      readoutTitle: ro ? ro.getAttribute('title') : null,
      hint: hint ? hint.textContent : null,
      detail: dc ? dc.textContent : null,
      groupView: !!q('[data-testid="arrangement-detail-group"]'),
      gainRange: range ? range.textContent : null,
      gainInput: gin ? gin.value : null,
      fadeIn: cl,
    };
  });
  s.nClips = await page.locator('[data-clip-kind="audio"]').count(); s.undo = await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /^Undo/.test(b.textContent.trim()))?.getAttribute('title') ?? null); result.samples.push({ label, ...s }); writeFileSync(out, JSON.stringify(result, null, 1));
};
const nameBar = (c) => c.getByTitle(/ — drag to move$/);
const empty = await clip.evaluate((el) => {
  const own = el.closest('[data-track-id]');
  const lanes = [...document.querySelectorAll('[data-track-id]')];
  for (const lane of lanes.slice(lanes.indexOf(own) + 1)) {
    if (lane.contains(own) || own.contains(lane)) continue;
    const b = lane.getBoundingClientRect();
    if (b.height > 20) return { x: b.right - 30, y: b.top + b.height / 2 };
  }
  return null;
});
const clickClip = async (c, mod) => {
  const b = await nameBar(c).boundingBox();
  if (mod) await page.keyboard.down(mod);
  await page.mouse.click(b.x + Math.min(40, b.width / 2), b.y + b.height / 2);
  if (mod) await page.keyboard.up(mod);
  await page.waitForTimeout(500);
};
await clickClip(clip);
const toggle = page.getByTestId('arrangement-detail-toggle');
if ((await toggle.count()) && (await toggle.getAttribute('aria-expanded')) === 'false') {
  await toggle.click();
  await page.waitForTimeout(600);
}
await clickClip(clip);
await sample('selected');
const drag = async (prefix, loc, dx = 10) => {
  const b = await loc.first().boundingBox({ timeout: 5000 });
  const x = b.x + Math.min(b.width / 2, 40), y = b.y + b.height * 0.75;
  result[`${prefix}-grab`] = { box: b, x, y, at: await page.evaluate(([px, py]) => { const e = document.elementFromPoint(px, py); return e.getAttribute('title') || e.getAttribute('data-testid') || e.tagName; }, [x, y]) };
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 4, y); await page.waitForTimeout(250);
  for (let i = 1; i <= 4; i++) { await page.mouse.move(x + 4 + i * dx, y); await page.waitForTimeout(200); await sample(`${prefix}-move${i}`); }
  await page.mouse.up(); await page.waitForTimeout(600); await sample(`${prefix}-release`);
  await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(600); await sample(`${prefix}-undo`);
};
// FADE: handle centre
const fadeDrag = async (prefix, c) => {
  const hb = await c.getByTestId('arrangement-clip-fade-in-handle').first().boundingBox({ timeout: 5000 });
  const x = hb.x + hb.width / 2, y = hb.y + hb.height / 2;
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 4, y); await page.waitForTimeout(250);
  for (let i = 1; i <= 4; i++) { await page.mouse.move(x + 4 + i * 10, y); await page.waitForTimeout(200); await sample(`${prefix}-move${i}`); }
  await page.mouse.up(); await page.waitForTimeout(600); await sample(`${prefix}-release`);
};
await fadeDrag('fade', clip);
await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(600); await sample('fade-undo');
await drag('trim', clip.getByTitle('Trim — left edge', { exact: true }));
await drag('move', nameBar(clip));
// GROUP: give clip1 a different gain, then select both
{ const nb = await page.locator('[data-clip-kind="audio"]').first().getByTitle(/ — drag to move$/).boundingBox(); await page.mouse.click(nb.x + 30, nb.y + nb.height / 2); await page.waitForTimeout(400); await page.keyboard.press('Control+KeyD'); }
await page.waitForFunction(() => document.querySelectorAll('[data-clip-kind="audio"]').length >= 2, null, { timeout: 20000 });
await page.waitForTimeout(800);
await clickClip(clip);
const gin = page.getByTestId('arrangement-detail-clip-gain-input');
await gin.fill('-3'); await gin.press('Enter'); await page.waitForTimeout(600); await sample('gain1-commit');
const selectGroup = async () => {
 await clickClip(clip);
await page.evaluate(() => { const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); const c = document.querySelectorAll('[data-clip-kind="audio"]')[1]; sc.scrollLeft += c.getBoundingClientRect().left - sc.getBoundingClientRect().left - 200; });
await page.waitForTimeout(600);
await clickClip(clip2, 'Shift');
await page.evaluate(() => { document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft = 0; });
await page.waitForTimeout(600);
};
await selectGroup();
await sample('group-selected');
await fadeDrag('group-fade', clip);
await selectGroup(); await sample('group-reselected');
await gin.fill('-6'); await gin.press('Enter'); await page.waitForTimeout(600); await sample('group-gain-commit');
await gin.evaluate((e) => e.blur()); await page.waitForTimeout(300); await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(600); await sample('group-gain-undo');
await page.screenshot({ path: out.replace(/\.json$/, '.png') });
result.errors = errors;
writeFileSync(out, JSON.stringify(result, null, 1));
await browser.close();
