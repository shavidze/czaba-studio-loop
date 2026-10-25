const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const w of [1440, 1280]) {
    const p = await b.newPage({ viewport: { width: w, height: w === 1440 ? 900 : 720 } });
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-testid="arrangement-shortcut-hint"]');
    await p.evaluate(() => document.fonts.ready);
    const variants = ['', 'word-spacing:0.08em', 'word-spacing:0.12em', 'word-spacing:0.16em', 'font-feature-settings:"case" 1', 'font-variant-position:normal'];
    out[w] = {};
    for (const v of variants) {
      out[w][v || 'base'] = await p.evaluate((v) => {
        const el = document.querySelector('[data-testid="arrangement-shortcut-hint"]');
        const ws = document.querySelector('[data-studio-theme="obsidian"]');
        ws.style.cssText += ';' + v;
        const r = (t) => { const s = document.createElement('span'); s.textContent = t; s.style.whiteSpace = 'pre'; el.appendChild(s); const x = s.getBoundingClientRect().width; s.remove(); return x; };
        const res = { sp: r(' '), dot: r('·'), sds: r(' · '), bullet: r('•'), hintW: el.getBoundingClientRect().width, fs: getComputedStyle(el).fontSize, ff: getComputedStyle(el).fontFamily.slice(0, 30) };
        ws.style.cssText = ws.style.cssText.replace(';' + v, '').replace(v, '');
        return res;
      }, v);
    }
    out[w].inter = await p.evaluate(async () => { await document.fonts.load('12px Inter'); const s = document.createElement('span'); s.style.cssText='font:12px Inter;white-space:pre'; document.body.appendChild(s); const m={}; for (const [k,t] of [['sp',' '],['dot','·'],['sds',' · ']]) { s.textContent=t; m[k]=s.getBoundingClientRect().width; } s.remove(); return m; });
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
