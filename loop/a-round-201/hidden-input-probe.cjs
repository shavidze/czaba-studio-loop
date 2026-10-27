const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const html = (ring) => `<!doctype html><html><head><style>
body{background:#0b0a09;margin:40px;font:14px sans-serif;color:#ece6da}
:focus-visible{outline:1.5px solid color-mix(in srgb,#c9a46a 80%,transparent);outline-offset:var(--focus-offset,2px)}
html[data-focus-source="pointer"] :focus-visible{outline:none}
label{position:relative;display:inline-flex;min-height:44px;align-items:center;border:1px solid #24211e;border-radius:8px;padding:0 16px}
label.ring:focus-within{box-shadow:0 0 0 2px #c9a46a}
input{position:absolute;inset:0;opacity:0;cursor:pointer}
</style></head><body><button id="b">before</button> <label id="l" class="${ring?'ring':''}">Choose video<input id="f" aria-label="Choose local video" type="file" accept="video/*"></label></body></html>`;
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const out = {};
  for (const ring of (process.env.UNF ? [false] : [true, false])) {
    await page.setContent(html(ring));
    await page.focus('#b');
    if (!process.env.UNF) await page.keyboard.press('Tab'); else await page.evaluate(() => document.activeElement.blur());
    const st = await page.evaluate(() => { const f = document.getElementById('f'); const s = getComputedStyle(f); const l = getComputedStyle(document.getElementById('l')); return { active: document.activeElement.id, focusVisible: f.matches(':focus-visible'), outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, opacity: s.opacity, labelBoxShadow: l.boxShadow }; });
    const box = await page.locator('#l').boundingBox();
    const clip = { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 };
    const name = process.env.UNF ? 'unfocused-control.png' : (ring ? 'ref-focus-within-ring.png' : 'tree-r94-removed.png');
    const buf = await page.screenshot({ clip, path: name });
    const { PNG } = (() => { try { return require('/home/runner/czaba-project/store/node_modules/pngjs'); } catch { return {}; } })();
    let brass = null;
    if (PNG) { const png = PNG.sync.read(buf); brass = 0; for (let i = 0; i < png.data.length; i += 4) { const r = png.data[i], g = png.data[i+1], b = png.data[i+2]; if (r > 120 && g > 90 && b < 120 && r - b > 50) brass++; } }
    out[ring ? 'ref' : 'tree'] = { ...st, brassPixels: brass, screenshot: name };
  }
  console.log(JSON.stringify(out, null, 1));
  fs.writeFileSync(process.env.UNF ? 'unfocused-control.json' : 'hidden-input-probe.json', JSON.stringify(out, null, 1));
  await browser.close();
})();
