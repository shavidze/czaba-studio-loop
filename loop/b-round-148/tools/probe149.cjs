const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const CSS = `[data-studio-theme="obsidian"],
body:has([data-studio-theme="obsidian"]) {
  --color-background: #0e0d0c; --color-surface: #161412; --color-elevated: #1d1a17; --color-muted-bg: #24201c;
  --color-outline: #24211e; --color-outline-hover: #2e2a26; --color-outline-strong: #3a3530; --color-outline-light: rgb(36 33 30 / 0.5);
  --color-foreground: #ece6da; --color-muted: #a39b8e; --color-dim: #928a7d; --color-brand: #c9a46a; --color-brand-hover: #d9b87f;
  --color-brand-foreground: #0e0d0c; --color-accent: #c9a46a; --color-positive: #8fa382; --color-warning: #d9a35b; --color-destructive: #d2776a;
}`;
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const w of [1440, 1280]) {
    const ctx = await b.newContext({ viewport: { width: w, height: w === 1440 ? 900 : 720 } }); const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
    await p.evaluate((css) => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); document.querySelector('.studio-container').setAttribute('data-studio-theme', 'obsidian'); }, CSS);
    await p.waitForTimeout(300);
    const r = {};
    r.base = await p.evaluate(() => { const q = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).backgroundColor : null; };
      return { html: getComputedStyle(document.documentElement).getPropertyValue('--color-brand').trim(), body: getComputedStyle(document.body).backgroundColor, ws: q('.studio-container'), header: q('.studio-container > header'), selRow: q('[data-testid="arrangement-library-tree"] [aria-selected="true"], [data-testid="arrangement-library-tree"] [aria-current="true"]') }; });
    await p.screenshot({ path: `shots/probe149-ws-${w}.png` });
    await p.getByRole('button', { name: /^Export/ }).first().click(); await p.waitForTimeout(1000);
    r.exportPanel = await p.evaluate(() => { const d = document.querySelector('[role="dialog"][aria-labelledby="arrangement-export-title"]'); if (!d) return null; const panel = d.firstElementChild; const t = document.getElementById('arrangement-export-title'); return { panelBg: getComputedStyle(panel).backgroundColor, panelBorder: getComputedStyle(panel).borderTopColor, title: getComputedStyle(t).color, backdrop: getComputedStyle(d).backgroundColor }; });
    await p.screenshot({ path: `shots/probe149-export-${w}.png` });
    out[w] = r; await ctx.close();
  }
  await b.close(); fs.writeFileSync('out/probe149.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
})();
