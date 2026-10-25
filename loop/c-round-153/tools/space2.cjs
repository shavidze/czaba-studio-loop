const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path'); const net = [];
const PRE = `[data-studio-theme="obsidian"], body:has([data-studio-theme="obsidian"]) { --font-sans: var(--c151-sans) !important; --font-mono: var(--c151-mono) !important; font-family: var(--c151-body) !important; }`;
const W = +process.argv[2] || 1440;
(async () => { const b = await L.launch(); const { page: p } = await L.openStudio(b, X.VPS[W], 'space2', net); const r = { vp: W };
  const meas = () => p.evaluate(async () => { const hint = document.querySelector('[data-testid=arrangement-shortcut-hint]'); const tn = [...hint.childNodes].find((n) => n.nodeType === 3); const rg = document.createRange(); rg.setStart(tn, 5); rg.setEnd(tn, 8); const sds = rg.getBoundingClientRect().width; rg.setStart(tn, 6); rg.setEnd(tn, 7); const dot = rg.getBoundingClientRect().width; rg.setStart(tn, 5); rg.setEnd(tn, 6); const sp = rg.getBoundingClientRect().width;
    return { ff: getComputedStyle(hint).fontFamily.slice(0, 40), text: JSON.stringify(tn.textContent.slice(5, 8)), spaceDotSpace: +sds.toFixed(2), dot: +dot.toFixed(2), space: +sp.toFixed(2), hintW: +hint.getBoundingClientRect().width.toFixed(1), seps: (hint.textContent.match(/ · /g) || []).length }; });
  r.post = await meas();
  await p.evaluate(async () => { await document.fonts.load('12px Inter'); });
  r.interCheck = await p.evaluate(() => document.fonts.check('12px Inter'));
  await p.evaluate((css) => { const h = getComputedStyle(document.documentElement); const s = document.documentElement.style; s.setProperty('--c151-sans', h.getPropertyValue('--font-sans')); s.setProperty('--c151-mono', h.getPropertyValue('--font-mono')); s.setProperty('--c151-body', h.fontFamily); const el = document.createElement('style'); el.textContent = css; document.head.appendChild(el); }, PRE);
  await p.evaluate(() => document.fonts.ready); await sleep(800);
  r.pre = await meas();
  // platform font of hint under pre, to prove Inter is used
  await p.evaluate(() => document.querySelector('[data-testid=arrangement-shortcut-hint]').setAttribute('data-sp', '1'));
  const cdp = await p.context().newCDPSession(p); await cdp.send('DOM.enable'); await cdp.send('CSS.enable'); const { root } = await cdp.send('DOM.getDocument', { depth: -1 }); const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '[data-sp]' }); r.prePlatform = (await cdp.send('CSS.getPlatformFontsForNode', { nodeId })).fonts;
  const bb = await p.locator('[data-testid=arrangement-shortcut-hint]').boundingBox(); await p.screenshot({ path: path.join(L.SHOTS, `hint-zoom-inter-sim-${W}.png`), clip: { x: bb.x, y: bb.y - 2, width: 420, height: bb.height + 4 } });
  fs.writeFileSync(path.join(L.OUT, `space2-${W}.json`), JSON.stringify(r, null, 1)); console.log(JSON.stringify(r)); await b.close(); })();
