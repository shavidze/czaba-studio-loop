import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2]; const out = process.argv[3];
const [W, H] = (process.argv[4] ?? '1440x900').split('x').map(Number);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const page = await ctx.newPage();
const sp = async () => { await page.evaluate(() => document.activeElement?.blur?.()); await page.keyboard.press('Space'); };
const R = { base, vp: `${W}x${H}`, rows: {} };
const st = () => page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null);
const pl = () => page.evaluate(() => document.querySelector('[data-playing]')?.getAttribute('data-playing') ?? null);
const pos = () => page.evaluate(() => document.querySelector('[data-testid="arrangement-position"]')?.textContent ?? null);
const ready = async () => { await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 }); await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 120000 }); await page.waitForTimeout(1000); };
const addFull = async () => { await page.getByText('Full mix', { exact: true }).first().click(); await page.keyboard.press('Enter'); await page.locator('[data-clip-kind="audio"]').first().waitFor(); await page.waitForTimeout(1500); await page.evaluate(() => document.activeElement?.blur?.()); };
const scrollers = () => page.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 20 && /auto|scroll/.test(getComputedStyle(e).overflowX)).map(e => ({ tid: e.getAttribute('data-testid'), cls: e.className.slice(0, 40), sl: e.scrollLeft, sw: e.scrollWidth, cw: e.clientWidth })));
await ready();
R.rows.empty_status = await st();
await addFull();
R.rows.afterAdd = await st();
// PLAY-BEHAVIOUR
await sp(); await page.waitForTimeout(300);
const p0 = await pos(); await page.waitForTimeout(1000);
R.rows.play = { playing: await pl(), pos0: p0, pos1: await pos(), status: await st() };
await sp(); await page.waitForTimeout(600);
R.rows.stop = { playing: await pl(), status: await st() };
await page.getByTestId('arrangement-marker-next').click(); await page.evaluate(() => document.activeElement?.blur?.()); await page.waitForTimeout(400);
R.rows.markerNextStopped = await st();
await sp(); await page.waitForTimeout(500);
await page.getByTestId('arrangement-marker-next').click(); await page.evaluate(() => document.activeElement?.blur?.()); await page.waitForTimeout(400);
R.rows.markerNextPlaying = { playing: await pl(), status: await st() };
await sp(); await page.waitForTimeout(500);
R.rows.markerNextAfterStop = await st();
// FOLLOW
await page.keyboard.press('Home'); await page.waitForTimeout(300);
for (let i = 0; i < 6; i++) { await page.keyboard.press('='); await page.waitForTimeout(250); }
R.rows.followScrollersBefore = await scrollers();
const followBtn = page.getByTestId('arrangement-follow');
R.rows.followBtn0 = await followBtn.evaluate(e => ({ cls: e.className.includes('dashed'), pressed: e.getAttribute('aria-pressed'), txt: e.textContent }));
await sp(); await page.waitForTimeout(6000);
R.rows.followPlay = { playing: await pl(), pos: await pos(), sc: await scrollers() };
// manual scroll
await page.evaluate(() => { const el = [...document.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 20 && /auto|scroll/.test(getComputedStyle(e).overflowX)).sort((a,b)=>b.scrollWidth-a.scrollWidth)[0]; if (el) { el.scrollLeft = Math.max(0, el.scrollLeft - 150); el.dispatchEvent(new Event('scroll')); } });
await page.mouse.move(W/2, H/2); await page.mouse.wheel(-200, 0); await page.waitForTimeout(800);
R.rows.followManual = { playing: await pl(), status: await st(), btn: await followBtn.evaluate(e => ({ cls: e.className.includes('dashed'), pressed: e.getAttribute('aria-pressed'), txt: e.textContent })) };
await sp(); await page.waitForTimeout(700);
R.rows.followStop = { playing: await pl(), status: await st(), btn: await followBtn.evaluate(e => ({ cls: e.className.includes('dashed'), pressed: e.getAttribute('aria-pressed'), txt: e.textContent })) };
// NARROW
await page.keyboard.press('Home'); await sp(); await page.waitForTimeout(800);
const pBefore = await pl();
await page.setViewportSize({ width: 800, height: 900 }); await page.waitForTimeout(1500);
R.rows.narrow = { before: pBefore, playingAttr: await pl(), body: await page.evaluate(() => document.body.innerText.slice(0, 120)) };
await page.setViewportSize({ width: W, height: H }); await page.waitForTimeout(2000);
R.rows.narrowBack = { playing: await pl(), status: await st() };
// PRE-REMOUNT
await ready();
await page.getByText('Full mix', { exact: true }).first().click();
await page.keyboard.press('Enter'); await page.locator('[data-clip-kind="audio"]').first().waitFor(); await page.waitForTimeout(1500);
const tempo = () => page.getByTestId('arrangement-tempo-input').inputValue().catch(() => null);
R.rows.pre = { seeded: { status: await st(), tempo: await tempo() } };
await page.setViewportSize({ width: 800, height: 900 }); await page.waitForTimeout(1500);
await page.setViewportSize({ width: W, height: H }); await page.waitForTimeout(2000);
R.rows.pre.afterResize1 = { status: await st(), tempo: await tempo() };
const ti = page.getByTestId('arrangement-tempo-input');
await ti.fill('100'); await ti.press('Enter'); await page.waitForTimeout(600);
R.rows.pre.typed = { status: await st(), tempo: await tempo() };
await page.setViewportSize({ width: 800, height: 900 }); await page.waitForTimeout(1500);
await page.setViewportSize({ width: W, height: H }); await page.waitForTimeout(2000);
R.rows.pre.afterResize2 = { status: await st(), tempo: await tempo() };
await page.screenshot({ path: out.replace(/\.json$/, '.png') });
// VIDEO-FAIL-STOP
await ready();
await page.getByTestId('arrangement-video-input').setInputFiles('/home/runner/czaba-project/store/public/videos/hero/1.mp4');
await page.locator('[data-clip-kind="video"]').first().waitFor(); await page.waitForTimeout(1500);
await page.evaluate(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('blocked', 'NotAllowedError')); document.activeElement?.blur?.(); });
await page.keyboard.press('Home'); await sp(); await page.waitForTimeout(1500);
R.rows.videoFail = { playing: await pl(), status: await st() };
writeFileSync(out, JSON.stringify(R, null, 1));
await browser.close();
