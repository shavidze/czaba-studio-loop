import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const out = {};
const browser = await chromium.launch();
const NAMES = { 'demo-middle-east':'Middle East — public preview','demo-hero-music':'CZABA hero — public preview','demo-synth-mix':'Full mix','demo-stem-pulse':'Pulse','demo-stem-bass':'Bass','demo-stem-pad':'Pad','demo-stem-lead':'Melody' };
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 60000 }).catch(()=>{});
  await page.waitForTimeout(1500);
  const georgianBefore = await page.evaluate(() => {
    const g = /[Ⴀ-ჿ]/;
    const txt = [...new Set([...document.body.innerText.matchAll(/[^\n]*[Ⴀ-ჿ][^\n]*/g)].map(m=>m[0].trim()))];
    const attrs = [];
    for (const el of document.querySelectorAll('*')) for (const a of el.attributes) if (g.test(a.value) && /^(title|aria-|alt|placeholder)/.test(a.name)) attrs.push(a.name+'='+a.value);
    return { textLines: txt, attrs: [...new Set(attrs)] };
  });
  const measure = () => page.evaluate(() => {
    const list = document.querySelector('[data-testid="arrangement-library-list"]');
    const opts = [...list.querySelectorAll('[role="option"]')];
    const boxes = opts.map(o => { const b=o.getBoundingClientRect(); return { id:o.dataset.sourceId, y:+b.y.toFixed(2), h:+b.height.toFixed(2) }; });
    const gaps = boxes.slice(1).map((b,i)=>+(b.y-(boxes[i].y+boxes[i].h)).toFixed(2));
    const heads = [...list.querySelectorAll('[data-b-sketch-heading]')].map(hd => { const b=hd.getBoundingClientRect(); const cs=getComputedStyle(hd); return { text: hd.textContent, h:+b.height.toFixed(2), w:+b.width.toFixed(2), lineHeight: cs.lineHeight, truncated: hd.scrollWidth>hd.clientWidth }; });
    return { scrollHeight: list.scrollHeight, clientHeight: list.clientHeight, listW: list.getBoundingClientRect().width, boxes, gaps, heads,
      textNodes: list.querySelectorAll('[data-testid="arrangement-library-option-title"]').length + list.querySelectorAll('[data-testid="arrangement-library-option-context"]').length + heads.length };
  });
  const before = await measure();
  await page.evaluate((NAMES) => {
    const list = document.querySelector('[data-testid="arrangement-library-list"]');
    for (const o of list.querySelectorAll('[role="option"]')) {
      const n = NAMES[o.dataset.sourceId]; if (n) o.querySelector('[data-testid="arrangement-library-option-title"]').textContent = n;
      o.querySelector('[data-testid="arrangement-library-option-context"]')?.remove();
    }
    const opts = [...list.querySelectorAll(':scope > [role="option"]')];
    const groups = [['CZABA public previews + synthetic SFX', opts.slice(0,4)], ['Synthetic demo · Night Pulse', opts.slice(4)]];
    groups.forEach(([label, members], i) => {
      const g = document.createElement('div'); g.setAttribute('role','group'); g.setAttribute('aria-labelledby','bsk-h'+i); g.className='space-y-1';
      const hd = document.createElement('div'); hd.id='bsk-h'+i; hd.className='truncate px-2 pt-2 pb-0.5 text-xs text-muted'; hd.title=label; hd.textContent=label; hd.setAttribute('data-b-sketch-heading','');
      list.insertBefore(g, members[0]); g.appendChild(hd); members.forEach(m=>g.appendChild(m));
    });
  }, NAMES);
  await page.waitForTimeout(300);
  const after = await measure();
  await page.screenshot({ path: `probe/sketch-${w}.png` });
  const lib = await page.locator('[data-testid="arrangement-library-list"]').boundingBox();
  await page.screenshot({ path: `probe/sketch-list-${w}.png`, clip: { x: 0, y: Math.max(0,lib.y-60), width: 320, height: Math.min(h-Math.max(0,lib.y-60), lib.height+80) } });
  out[w] = { georgianBefore, before, after };
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
