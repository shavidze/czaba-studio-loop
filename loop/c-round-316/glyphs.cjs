const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [, , base, path, vpArg] = process.argv;
const [vw, vh] = vpArg.split('x').map(Number);
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: 'load', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    let i = 0;
    const walk = el => {
      if (el.nodeType !== 1) return;
      const direct = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (direct) el.setAttribute('data-cg', String(i++));
      for (const c of el.children) walk(c);
    };
    walk(document.body);
  });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '[data-cg]' });
  const out = [];
  const nonAscii = {};
  for (const id of nodeIds) {
    const attrs = (await cdp.send('DOM.getAttributes', { nodeId: id })).attributes;
    const key = attrs[attrs.indexOf('data-cg') + 1];
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: id });
    const { outerHTML } = await cdp.send('DOM.getOuterHTML', { nodeId: id });
    const text = await page.evaluate(k => { const el = document.querySelector(`[data-cg="${k}"]`); return [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(); }, key);
    for (const ch of text) if (ch.charCodeAt(0) > 126) { nonAscii[ch] = nonAscii[ch] || new Set(); fonts.forEach(f => nonAscii[ch].add(f.familyName)); }
    out.push({ k: Number(key), text: text.slice(0, 40), fonts: fonts.map(f => `${f.familyName}:${f.glyphCount}`).sort() });
  }
  out.sort((a, b) => a.k - b.k);
  const na = Object.fromEntries(Object.entries(nonAscii).map(([c, s]) => [`${c} U+${c.codePointAt(0).toString(16).toUpperCase()}`, [...s]]));
  console.log(JSON.stringify({ nodes: out, nonAscii: na }, null, 1));
  await browser.close();
})();
