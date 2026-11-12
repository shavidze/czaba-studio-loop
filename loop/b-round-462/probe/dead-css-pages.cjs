// usage: node dead-css-pages.cjs <headOrigin> <treeOrigin> <prunedList.txt> <outDir> [<cssInjectedIntoTreeReads> <onlyPath>]
// The optional pair is the non-vacuity check: it injects one CSS rule into every tree read of <onlyPath>; the compare must then differ.
// Style-sensitive HEAD vs tree compare for the dead-CSS deletion. Per page x viewport (Chromium, reducedMotion reduce, Playwright fake clock fixed at 2026-11-12T00:00Z and advanced 3.5 s):
// - computed-style fingerprint of every element (tag, rounded box, 22 properties incl. animation-name) on HEAD, HEAD again (control) and tree;
// - a reduced fingerprint without box, transform and opacity (the parts infinite JS/CSS animations move) on the same reads;
// - number of elements matching any removed selector branch, with pseudo-classes and pseudo-elements stripped (querySelectorAll), on HEAD and tree;
// - every document animation is paused at currentTime 0 before reading (infinite hero/404 animations ignore reduced motion);
// - computed animation-name values that are a removed @keyframes; chunk 404s; tree console errors; viewport screenshots.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const [HEAD, TREE, LIST, OUT, INJECT, ONLY] = process.argv.slice(2);
const ALL_PAGES = ['/', '/store', '/products/middle-east', '/free-downloads', '/about', '/hire-us', '/support', '/faq', '/cart', '/search', '/account/login', '/no-such-page-463', '/studio-lab'];
const PAGES = ONLY ? [ONLY] : ALL_PAGES;
const VIEWS = [[1440, 900], [1280, 720]];
const lines = fs.readFileSync(LIST, 'utf8').split('\n').filter(Boolean);
const branches = (h) => { const out = []; let d = 0, cur = ''; for (const ch of h) { if (ch === '(') d++; else if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out; };
const selectors = [...new Set(lines.filter((l) => !l.includes('@keyframes')).flatMap((l) => branches(l.slice(l.indexOf(': ') + 2)).map((b) => b.replace(/::?[a-zA-Z-]+(\((?:[^()]|\([^()]*\))*\))?/g, '').trim()).filter(Boolean)))];
const keyframes = lines.filter((l) => l.includes('@keyframes')).map((l) => l.split(' ').pop());
const PROPS = ['display','position','visibility','opacity','color','background-color','background-image','font-family','font-size','font-weight','line-height','letter-spacing','margin','padding','border','border-radius','box-shadow','transform','filter','z-index','overflow','animation-name'];
async function visit(browser, origin, path, [w, h], shot, inject) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const consoleErrors = []; const chunk404 = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
  page.on('response', (r) => { if (r.url().includes('/assets/') && r.status() >= 400) chunk404.push(`${r.status()} ${r.url()}`); });
  await page.clock.install({ time: new Date('2026-11-12T00:00:00Z') });
  const resp = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => ({ status: () => `ERR ${e.message.slice(0, 80)}` }));
  if (inject) await page.addStyleTag({ content: inject });
  await page.clock.runFor(3500);
  await page.waitForTimeout(500);
  const data = await page.evaluate(({ selectors, keyframes, PROPS }) => {
    const running = document.getAnimations();
    for (const a of running) { a.pause(); a.currentTime = 0; }
    const els = [...document.querySelectorAll('body *')];
    const fp = els.map((el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      return [el.tagName, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), ...PROPS.map((p) => cs.getPropertyValue(p))].join('|'); });
    let invalidSelectors = 0; const removedClassEls = selectors.reduce((n, sel) => { try { return n + document.querySelectorAll(sel).length; } catch { invalidSelectors += 1; return n; } }, 0);
    const deadAnim = els.map((el) => getComputedStyle(el).animationName).filter((a) => a.split(',').some((x) => keyframes.includes(x.trim())));
    const reduced = els.map((el) => { const cs = getComputedStyle(el); return [el.tagName, ...PROPS.filter((q) => q !== 'transform' && q !== 'opacity').map((q) => cs.getPropertyValue(q))].join('|'); });
    return { fp, reduced, invalidSelectors, removedClassEls, deadAnim: deadAnim.length, url: location.pathname, frozenAnimations: running.length };
  }, { selectors, keyframes, PROPS });
  if (shot) await page.screenshot({ path: shot, fullPage: false });
  await ctx.close();
  return { status: typeof resp.status === 'function' ? resp.status() : resp.status, ...data, consoleErrors, chunk404 };
}
function cmp(a, b) { const n = Math.max(a.length, b.length); const diffs = []; for (let i = 0; i < n; i++) if (a[i] !== b[i]) diffs.push(i);
  return { equal: diffs.length === 0, lenA: a.length, lenB: b.length, differing: diffs.length, first: diffs.slice(0, 3).map((i) => ({ i, a: (a[i] || '').slice(0, 300), b: (b[i] || '').slice(0, 300) })) }; }
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const rows = [];
  for (const path of PAGES) for (const v of VIEWS) {
    const tag = `${path.replace(/\//g, '_') || '_root'}-${v[0]}`;
    const head = await visit(browser, HEAD, path, v, `${OUT}/head${tag}.png`);
    const head2 = await visit(browser, HEAD, path, v, null);
    const tree = await visit(browser, TREE, path, v, `${OUT}/tree${tag}.png`, INJECT);
    const control = cmp(head.fp, head2.fp); const ht = cmp(head.fp, tree.fp);
    const rControl = cmp(head.reduced, head2.reduced); const rht = cmp(head.reduced, tree.reduced);
    rows.push({ path, viewport: v.join('x'), status: [head.status, tree.status], url: [head.url, tree.url], elements: [head.fp.length, tree.fp.length],
      controlHeadHeadEqual: control.equal, reducedControlEqual: rControl.equal, reducedHeadTreeEqual: rht.equal, reducedHeadTreeFirst: rht.first, headTreeEqual: ht.equal, headTreeDiffering: ht.differing, controlDiffering: control.differing, headTreeFirst: ht.first, controlFirst: control.first,
      frozen: [head.frozenAnimations, tree.frozenAnimations], invalidSelectors: head.invalidSelectors, removedClassElsHead: head.removedClassEls, removedClassElsTree: tree.removedClassEls, deadAnimHead: head.deadAnim, deadAnimTree: tree.deadAnim,
      chunk404: [...head.chunk404, ...tree.chunk404], consoleErrorsTree: tree.consoleErrors });
    const r = rows[rows.length - 1];
    console.log(`${r.path} ${r.viewport} status=${r.status} el=${r.elements} control=${r.controlHeadHeadEqual}(${r.controlDiffering}) headTree=${r.headTreeEqual}(${r.headTreeDiffering}) reduced=${r.reducedControlEqual}/${r.reducedHeadTreeEqual} removedCls=${r.removedClassElsHead}/${r.removedClassElsTree} deadAnim=${r.deadAnimHead}/${r.deadAnimTree} 404=${r.chunk404.length}`);
  }
  await browser.close();
  fs.writeFileSync(`${OUT}/dead-css-pages.json`, JSON.stringify({ selectorsChecked: selectors.length, keyframesChecked: keyframes, rows }, null, 1));
})();
