// usage: node store-pages.cjs <headOrigin> <treeOrigin> <outDir>
// Loads Store pages + /studio-lab on HEAD (twice: control) and tree at 1440x900 and 1280x720 in Chromium; compares body innerText,
// h1 count, header "Free Samples"; counts elements carrying any of the 12 removed utility tokens; records chunk 404s and console errors.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const [HEAD, TREE, OUT] = process.argv.slice(2);
const PAGES = ['/', '/store', '/products/middle-east', '/free-downloads', '/about', '/studio-lab'];
const VIEWS = [[1440, 900], [1280, 720]];
const TOKENS = ['h-[400px]','hover:bg-foreground/20','left-[15%]','md:group-hover:opacity-100','md:opacity-0','opacity-30','opacity-[0.03]','origin-top','right-[15%]','shadow-teal-500/50','w-[1px]','w-[3px]'];
async function visit(browser, origin, path, [w, h], shot) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const consoleErrors = []; const chunk404 = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
  page.on('response', (r) => { if (r.url().includes('/assets/') && r.status() >= 400) chunk404.push(`${r.status()} ${r.url()}`); });
  const resp = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => ({ status: () => `ERR ${e.message.slice(0, 80)}` }));
  await page.waitForTimeout(3000);
  const data = await page.evaluate((tokens) => {
    const text = document.body.innerText.replace(/\s+/g, ' ').trim();
    const tokenEls = tokens.map((t) => [t, [...document.querySelectorAll('[class]')].filter((el) => (el.getAttribute('class') || '').split(/\s+/).includes(t)).length]);
    const header = document.querySelector('header');
    return { text, h1: document.querySelectorAll('h1').length, freeSamples: !!header && /Free Samples/.test(header.innerText), tokenEls: Object.fromEntries(tokenEls) };
  }, TOKENS);
  if (shot) await page.screenshot({ path: shot, fullPage: false });
  await ctx.close();
  return { status: typeof resp.status === 'function' ? resp.status() : resp.status, ...data, consoleErrors, chunk404 };
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const rows = [];
  for (const path of PAGES) for (const v of VIEWS) {
    const tag = `${path.replace(/\//g, '_') || '_root'}-${v[0]}`;
    const head = await visit(browser, HEAD, path, v, `${OUT}/head${tag}.png`);
    const head2 = await visit(browser, HEAD, path, v, null);
    const tree = await visit(browser, TREE, path, v, `${OUT}/tree${tag}.png`);
    const firstDiff = (a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i >= Math.max(a.length, b.length) ? null : { at: i, a: a.slice(Math.max(0, i - 40), i + 80), b: b.slice(Math.max(0, i - 40), i + 80) }; };
    rows.push({ path, viewport: v.join('x'), status: [head.status, tree.status], h1: [head.h1, tree.h1], freeSamples: [head.freeSamples, tree.freeSamples],
      textLen: [head.text.length, head2.text.length, tree.text.length], controlHeadHeadEqual: head.text === head2.text, headTreeEqual: head.text === tree.text,
      headTreeFirstDiff: head.text === tree.text ? null : firstDiff(head.text, tree.text), controlFirstDiff: head.text === head2.text ? null : firstDiff(head.text, head2.text),
      tokenElsHead: Object.values(head.tokenEls).reduce((a, b) => a + b, 0), tokenElsTree: Object.values(tree.tokenEls).reduce((a, b) => a + b, 0),
      chunk404: [...head.chunk404, ...tree.chunk404], consoleErrorsTree: tree.consoleErrors, consoleErrorsHeadCount: head.consoleErrors.length });
    console.log(JSON.stringify(rows[rows.length - 1]).slice(0, 400));
  }
  await browser.close();
  fs.writeFileSync(`${OUT}/store-pages.json`, JSON.stringify(rows, null, 1));
})();
