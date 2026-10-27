import { createRequire } from 'node:module'; const { chromium } = createRequire('/home/runner/czaba-project/store/package.json')('@playwright/test');
import { readFileSync, writeFileSync } from 'node:fs';
const S = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-213/consult-perf';
const lib = readFileSync(`${S}/instr.js`, 'utf8');
const out = { note: 'dev server :5173, cpu 1x, indicative only', scenarios: {} };
const save = () => writeFileSync(`${S}/results.json`, JSON.stringify(out, null, 2));
const med = (a) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
await ctx.addInitScript({ content: `${lib};czabaPerfLib.installPerfInstrumentation();(()=>{const h=window.__REACT_DEVTOOLS_GLOBAL_HOOK__;const inj=h.inject;window.__rv=[];h.inject=function(r){window.__rv.push(r&&r.version);return inj.call(this,r);};})();` });
const page = await ctx.newPage();
const t0 = Date.now();
const now = () => page.evaluate(() => performance.now());
const snap = (a, b) => page.evaluate(({ a, b }) => { const s = window.__czabaPerf; const i = (t) => t >= a && t <= b; return { commits: s.commits.filter((c) => i(c.t)), starts: s.starts.filter((c) => i(c.t)), moves: s.moves.filter(i), downs: s.downs.filter(i), ups: s.ups.filter(i) }; }, { a, b });
const blur = () => page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
const clips = page.locator('[data-clip-kind="audio"]');
async function quiet(ms = 600) { await page.waitForTimeout(ms); return now(); }
function win(w) {
  const down = w.downs.at(-1); const up = w.ups.find((t) => t > down); const moves = w.moves.filter((t) => t > down && t < up);
  const fm = moves[0]; const inW = w.commits.filter((c) => c.t > fm && c.t < up); const r = inW.map((c) => c.rendered);
  const rel = w.commits.filter((c) => c.t >= up);
  return { movesInWindow: moves.length, windowCommits: inW.length, commitsPerMove: +(inW.length / (moves.length || 1)).toFixed(3),
    componentsPerCommitMedian: med(r), componentsMax: r.length ? Math.max(...r) : 0, componentsPerMove: +(r.reduce((x, y) => x + y, 0) / (moves.length || 1)).toFixed(2),
    downCommits: w.commits.filter((c) => c.t >= down && c.t <= fm).map((c) => c.rendered), releaseCommits: rel.map((c) => c.rendered),
    startsInMoveWindow: w.starts.filter((s) => s.t > fm && s.t < up).length, startsTotal: w.starts.length, startTasksInMoveWindow: new Set(w.starts.filter((s) => s.t > fm && s.t < up).map((s) => s.task)).size };
}
async function drag(name, from, dx, steps = 30, attr) {
  const before = attr ? await attr() : null;
  const a = await now();
  await page.mouse.move(from.x, from.y); await page.mouse.down();
  await page.mouse.move(from.x + dx, from.y, { steps }); await page.mouse.up();
  const b = await quiet();
  const r = { ...win(await snap(a, b)), before, after: attr ? await attr() : null };
  out.scenarios[name] = r; save(); return r;
}
const center = async (loc) => { const b = await loc.boundingBox(); const l = Math.max(b.x, 0); const r = Math.min(b.x + b.width, 1440); return { x: b.width < 60 ? b.x + b.width / 2 : Math.min(l + 300, (l + r) / 2), y: b.y + b.height / 2 }; };
const first = () => clips.first();
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => { const add = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Add'); return add && !add.disabled && document.querySelector('[data-testid="arrangement-library-preview-wave"] rect'); }, undefined, { timeout: 90000, polling: 'raf' });
out.reactVersions = await page.evaluate(() => window.__rv);
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Add', exact: true }).click();
await page.waitForTimeout(2000);
out.clipBox = await first().boundingBox();
let moveTarget = () => clips.first();
const header = () => first().getByTitle(/ — drag to move$/);
const body = () => first().getByTitle('drag = time selection · click = playhead');
const fadeIn = () => first().getByTestId('arrangement-clip-fade-in-handle');
const trimL = () => first().getByTitle('Trim — left edge');
async function resetScroll() { await page.evaluate(() => { let e = document.querySelector('[data-clip-kind="audio"]'); while (e) { if (e.scrollLeft) e.scrollLeft = 0; e = e.parentElement; } }); await page.waitForTimeout(300); }
async function zoom(tag) { await blur(); for (const [k, n] of [['=', 'zoomIn'], ['-', 'zoomOut']]) { const per = []; for (let i = 0; i < 5; i++) { const a = await now(); await page.keyboard.press(k); const b = await quiet(400); const s = await snap(a, b); per.push({ commits: s.commits.length, rendered: s.commits.map((c) => c.rendered) }); } out.scenarios[`${n}.${tag}`] = { per, clipsMounted: await clips.count() }; save(); } await resetScroll(); }
async function suite(tag) {
  await resetScroll();
  const h = await center(header());
  const ca = await now(); await page.mouse.click(h.x, h.y); const cb = await quiet();
  const cs = await snap(ca, cb); out.scenarios[`click.${tag}`] = { commits: cs.commits.map((c) => c.rendered) }; save();
  const bb = await body().boundingBox();
  await drag(`range.${tag}`, { x: Math.max(bb.x, 0) + 40, y: bb.y + bb.height * 0.6 }, 120);
  await page.mouse.click(h.x, h.y); await page.waitForTimeout(300);
  const f = await center(fadeIn());
  await drag(`fadeIn.${tag}`, f, 60, 30, () => first().getAttribute('data-fade-in'));
  await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
  const tb = await trimL().boundingBox();
  await drag(`trimStart.${tag}`, { x: tb.x + tb.width / 2, y: tb.y + tb.height * 0.6 }, 40, 30, () => first().getAttribute('data-clip-start'));
  await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
  if (tag.startsWith('30')) { await page.evaluate(() => { const all = document.querySelectorAll('[data-clip-kind="audio"]'); let e = all[all.length - 1]; while (e) { if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible') e.scrollLeft = e.scrollWidth; e = e.parentElement; } }); await page.waitForTimeout(300); out.lastBox = out.lastBox ?? {}; out.lastBox[tag] = await moveTarget().boundingBox(); } const h2 = await center(moveTarget().getByTitle(/ — drag to move$/));
  await drag(`move.${tag}`, h2, 80, 30, () => moveTarget().getAttribute('data-clip-start'));
  await resetScroll();
  await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
}
async function play(on) { await blur(); await page.keyboard.press('Space'); const pb = page.getByRole('button', { name: /^(Play|Pause)$/ }); const want = on ? 'Pause' : 'Play'; for (let i = 0; i < 150 && (await pb.getAttribute('aria-label')) !== want; i++) await page.waitForTimeout(100); if ((await pb.getAttribute('aria-label')) !== want) { out.playFail = (out.playFail ?? 0) + 1; out.lastStatus = await page.evaluate(() => document.body.innerText.slice(0, 0)); save(); throw new Error('play toggle failed ' + want + ' ' + (await pb.count())); } await page.waitForTimeout(800); }
await zoom('1clip');
await suite('1clip.stopped');
await play(true); out.audioStates1 = await page.evaluate(() => window.__czabaPerf.audioContextStates());
await suite('1clip.playing');
await play(false);
// play/pause commit size
{ const a = await now(); await play(true); const b = await now(); await play(false); const c = await now();
  const s1 = await snap(a, b), s2 = await snap(b, c);
  out.scenarios['playPause.1clip'] = { play: s1.commits.map((x) => x.rendered), pause: s2.commits.map((x) => x.rendered), playStarts: s1.starts.length }; save(); }
// build 30 clips
const h = await center(header()); await page.mouse.click(h.x, h.y); await page.waitForTimeout(200);
const counts = [];
for (let i = 0; i < 29; i++) { await blur(); await page.keyboard.press('Control+d'); await page.waitForTimeout(120); counts.push(await clips.count()); if (counts.at(-1) !== i + 2) break; }
out.dup = { counts, final: await clips.count(), status: await page.locator('[role="status"]').allTextContents().catch(() => []) }; save();
// clear selection/range by clicking first clip header
await header().scrollIntoViewIfNeeded(); await page.mouse.click((await center(header())).x, (await center(header())).y); await page.waitForTimeout(300);
await page.keyboard.press('Escape'); await blur();
for (const [k, n] of [['=', 'zoomIn'], ['-', 'zoomOut']]) {
  const per = [];
  for (let i = 0; i < 5; i++) { const a = await now(); await page.keyboard.press(k); const b = await quiet(400); const s = await snap(a, b); per.push({ commits: s.commits.length, rendered: s.commits.map((c) => c.rendered) }); }
  out.scenarios[`${n}.30clips`] = { per, clipsMounted: await clips.count() }; save();
}
await resetScroll(); moveTarget = () => clips.last();
await suite('30clips.stopped');
await play(true);
await suite('30clips.playing');
{ const a = await now(); await play(false); const b = await now(); await play(true); const c = await now(); await play(false);
  const s1 = await snap(a, b), s2 = await snap(b, c);
  out.scenarios['playPause.30clips'] = { pause: s1.commits.map((x) => x.rendered), play: s2.commits.map((x) => x.rendered), playStarts: s2.starts.length }; save(); }
out.wallMs = Date.now() - t0; save();
await browser.close();
console.log('done', out.wallMs);
