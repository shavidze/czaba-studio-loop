// B round 377 -> 378 loop-brace recipe (PERF-11c-iii-c2a). Usage: node loop-recipe-378.mjs <baseUrl> <outJson>
// Steps per viewport: add Bass (Enter), range drag on the Music lane background, Ctrl+L (loop created),
// lane Mute, Ctrl+Z, brace drag +60 px, Ctrl+Z, keyboard ArrowRight / Shift+ArrowRight on the focused brace, Ctrl+L (off).
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [base, outPath] = [process.argv[2], process.argv[3]];
const out = { base, at: new Date().toISOString() };
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {}; out[`${w}x${h}`] = r;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const brace = page.getByTestId('arrangement-loop-brace');
  const readBrace = async () => (await brace.count()) ? brace.evaluate((e) => ({ label: e.getAttribute('aria-label'), title: e.getAttribute('title'), enabled: e.getAttribute('data-loop-enabled'), left: e.style.left, width: e.style.width, text: e.textContent.trim(), focused: e === document.activeElement })) : null;
  const times = async () => (await page.getByTestId('arrangement-loop-times').count()) ? (await page.getByTestId('arrangement-loop-times').textContent()).trim() : null;
  const snap = async () => ({ brace: await readBrace(), times: await times() });
  try {
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 240000 });
    await page.getByText('Demo collection ready').first().waitFor({ timeout: 240000 });
    await page.waitForTimeout(800);
    await page.getByRole('option', { name: /Bass/ }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    await page.mouse.click(2, 2);
    const lane = page.locator('[data-track-id="music"]').first(); const lb = await lane.boundingBox();
    const cb = await page.locator('[data-clip-id]').first().boundingBox();
    const x0 = Math.min(cb.x + cb.width + 40, w - 260); const y0 = lb.y + lb.height * 0.5;
    await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x0 + 120, y0, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(400);
    r.range = await page.getByTestId('arrangement-lane-range').count();
    r.s0_none = await snap();
    await page.keyboard.press('Control+l'); await page.waitForTimeout(400); r.s1_created = await snap();
    const muteBtn = page.locator('[data-testid="arrangement-track-header"]').first().getByRole('button', { name: /^Mute/ }).first();
    await muteBtn.click(); await page.waitForTimeout(300); r.s2_muted = await snap();
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300); r.s3_unmute_undo = await snap();
    const bb = await brace.boundingBox(); const bx = bb.x + bb.width / 2; const by = bb.y + bb.height / 2;
    await page.mouse.move(bx, by); await page.mouse.down(); await page.mouse.move(bx + 30, by, { steps: 3 }); r.s4_mid_drag = await snap();
    await page.mouse.move(bx + 60, by, { steps: 3 }); await page.mouse.up(); await page.waitForTimeout(300); r.s5_dragged = await snap();
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300); r.s6_drag_undo = await snap();
    await brace.focus(); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250); r.s7_arrow = await snap();
    await page.keyboard.press('Shift+ArrowRight'); await page.waitForTimeout(250); r.s8_shift_arrow = await snap();
    await page.keyboard.press('Control+l'); await page.waitForTimeout(300); r.s9_toggle = await snap();
    r.status = (await page.getByTestId('arrangement-status').textContent())?.trim();
    await page.screenshot({ path: outPath.replace(/\.json$/, `-${w}.png`) });
  } catch (e) { r.error = String(e).slice(0, 300); }
  await ctx.close();
}
await browser.close();
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log('done');
