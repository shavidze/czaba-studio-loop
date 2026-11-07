// B round 378 -> 379 marker-row recipe (PERF-11c-iii-c2b). Usage: node marker-recipe-379.mjs <baseUrl> <outJson>
// Per viewport: add Bass (Enter); M opens the add editor (handle beginAddMarker); type Intro + Enter; lane Mute; Ctrl+Z;
// flag ArrowRight nudge; Ctrl+Z; F2 rename to Verse + Enter; Shift+F10 menu; Escape; Ctrl+ArrowLeft / Ctrl+ArrowRight (handle stepMarker);
// flag drag +60 px; Ctrl+Z; Delete on the focused flag (focus successor); Ctrl+Z. Each step reads flags, editor, menu, focus and status.
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
  const snap = () => page.evaluate(() => {
    const a = document.activeElement;
    const input = document.querySelector('[data-testid="arrangement-marker-name-input"]');
    return {
      flags: [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((e) => ({ label: e.getAttribute('aria-label'), current: e.getAttribute('aria-current'), pressed: e.getAttribute('aria-pressed'), left: e.style.left, text: e.textContent.trim() })),
      editor: input ? { value: input.value, focused: input === a } : null,
      menu: [...document.querySelectorAll('[role="menu"] [role="menuitem"]')].map((e) => e.textContent.trim()),
      focus: a ? { tag: a.tagName, testid: a.getAttribute('data-testid'), label: a.getAttribute('aria-label') } : null,
      status: document.querySelector('[data-testid="arrangement-status"]')?.textContent?.trim() ?? null,
    };
  });
  const flag = page.getByTestId('arrangement-marker').first();
  try {
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 240000 });
    await page.getByText('Demo collection ready').first().waitFor({ timeout: 240000 });
    await page.waitForTimeout(800);
    await page.getByRole('option', { name: /Bass/ }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    await page.mouse.click(2, 2); await page.waitForTimeout(200);
    r.s0_start = await snap();
    await page.keyboard.press('m'); await page.waitForTimeout(300); r.s1_add_editor = await snap();
    await page.keyboard.type('Intro'); await page.keyboard.press('Enter'); await page.waitForTimeout(300); r.s2_added = await snap();
    await page.locator('[data-testid="arrangement-track-header"]').first().getByRole('button', { name: /^Mute/ }).first().click(); await page.waitForTimeout(300); r.s3_muted = await snap();
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300); r.s4_mute_undo = await snap();
    await flag.focus(); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(300); r.s5_nudge = await snap();
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300); r.s6_nudge_undo = await snap();
    await flag.focus(); await page.keyboard.press('F2'); await page.waitForTimeout(300); r.s7_rename_editor = await snap();
    await page.keyboard.press('Control+a'); await page.keyboard.type('Verse'); await page.keyboard.press('Enter'); await page.waitForTimeout(300); r.s8_renamed = await snap();
    await flag.focus(); await page.keyboard.press('Shift+F10'); await page.waitForTimeout(300); r.s9_menu = await snap();
    await page.keyboard.press('Escape'); await page.waitForTimeout(300); r.s10_menu_closed = await snap();
    await page.mouse.click(2, 2); await page.waitForTimeout(200);
    await page.keyboard.press('Control+ArrowRight'); await page.waitForTimeout(300); r.s11_step_next = await snap();
    await page.keyboard.press('Control+ArrowLeft'); await page.waitForTimeout(300); r.s12_step_prev = await snap();
    const fb = await flag.boundingBox(); const fx = fb.x + fb.width / 2; const fy = fb.y + fb.height / 2;
    await page.mouse.move(fx, fy); await page.mouse.down(); await page.mouse.move(fx + 30, fy, { steps: 3 }); r.s13_mid_drag = await snap();
    await page.mouse.move(fx + 60, fy, { steps: 3 }); await page.mouse.up(); await page.waitForTimeout(300); r.s14_dragged = await snap();
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300); r.s15_drag_undo = await snap();
    await flag.focus(); await page.keyboard.press('Delete'); await page.waitForTimeout(300); r.s16_deleted = await snap();
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300); r.s17_delete_undo = await snap();
    await page.screenshot({ path: outPath.replace(/\.json$/, `-${w}.png`) });
  } catch (e) { r.error = String(e).slice(0, 300); }
  await ctx.close();
}
await browser.close();
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log('done');
