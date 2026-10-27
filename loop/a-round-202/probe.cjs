const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const label = process.argv[2] || 'ref';
const base = process.argv[3] || 'http://127.0.0.1:5173';
const outDir = __dirname;

const info = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  let op = 1;
  let n = el;
  while (n && n.nodeType === 1) {
    op *= Number.parseFloat(getComputedStyle(n).opacity);
    n = n.parentElement;
  }
  const cs = getComputedStyle(el);
  const parse = (c) => {
    const s = c.match(/color\(srgb ([^)]+)\)/);
    if (s) {
      const q = s[1].split(/[ /]+/).filter(Boolean).map(Number);
      return { r: q[0] * 255, g: q[1] * 255, b: q[2] * 255, a: q[3] === undefined ? 1 : q[3] };
    }
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
  };
  let bg = null;
  let a = el.parentElement;
  while (a) {
    const c = parse(getComputedStyle(a).backgroundColor);
    if (c && c.a > 0.5) {
      bg = c;
      break;
    }
    a = a.parentElement;
  }
  bg = bg || { r: 11, g: 10, b: 9, a: 1 };
  const oc = parse(cs.outlineColor) || { r: 0, g: 0, b: 0, a: 0 };
  const mix = (x, y) => Math.round(x * oc.a + y * (1 - oc.a));
  const ring = { r: mix(oc.r, bg.r), g: mix(oc.g, bg.g), b: mix(oc.b, bg.b) };
  const lum = (c) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const l1 = lum(ring);
  const l2 = lum(bg);
  const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  const r = el.getBoundingClientRect();
  return {
    tag: el.tagName,
    name: el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 40),
    href: el.getAttribute('href'),
    display: cs.display,
    outlineStyle: cs.outlineStyle,
    outlineWidth: cs.outlineWidth,
    outlineOffset: cs.outlineOffset,
    outlineColor: cs.outlineColor,
    boxShadow: cs.boxShadow,
    borderColor: cs.borderColor,
    background: cs.backgroundColor,
    effOpacity: op,
    rect: { x: r.x, y: r.y, w: r.width, h: r.height },
    focusSource: document.documentElement.dataset.focusSource ?? null,
    ringContrast: Math.round(contrast * 100) / 100,
  };
};

async function brassSides(page, decoder, rect) {
  const m = 5;
  const clip = {
    x: Math.max(0, rect.x - m),
    y: Math.max(0, rect.y - m),
    width: rect.w + 2 * m,
    height: rect.h + 2 * m,
  };
  if (clip.width < 2 || clip.height < 2) return null;
  const buf = await page.screenshot({ clip });
  return decoder.evaluate(
    async ({ src, m, w, h }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      const sides = { top: 0, bottom: 0, left: 0, right: 0 };
      for (let yy = 0; yy < c.height; yy++) {
        for (let xx = 0; xx < c.width; xx++) {
          const i = (yy * c.width + xx) * 4;
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          if (!(r > 120 && g > 90 && b < 140 && r - b > 40)) continue;
          if (yy < m) sides.top++;
          else if (yy >= c.height - m) sides.bottom++;
          else if (xx < m) sides.left++;
          else if (xx >= c.width - m) sides.right++;
        }
      }
      return sides;
    },
    { src: `data:image/png;base64,${buf.toString('base64')}`, m, w: clip.width, h: clip.height },
  );
}

async function tabTo(page, pred, max = 80) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(120);
    const ok = await page.evaluate(pred);
    if (ok) {
      await page.waitForTimeout(450);
      return true;
    }
  }
  return false;
}

(async () => {
  const browser = await chromium.launch();
  const decoder = await browser.newPage();
  const out = { label, base, at: new Date().toISOString(), pages: {} };
  const vp = { width: 1280, height: 720 };
  const targets = {
    '/store': [
      ['search input', () => document.activeElement?.matches('input[type="search"], input[placeholder*="earch" i]')],
      ['sort select', () => document.activeElement?.tagName === 'SELECT'],
      ['button', () => document.activeElement?.tagName === 'BUTTON' && !!document.activeElement.closest('main')],
      ['product card link', () => document.activeElement?.matches('a[href^="/products/"]')],
      ['play preview', () => /play preview/i.test(document.activeElement?.getAttribute('aria-label') || '')],
    ],
    '/': [
      ['button', () => document.activeElement?.tagName === 'BUTTON'],
      ['product card link', () => document.activeElement?.matches('a[href^="/products/"]')],
      ['play preview', () => /play preview/i.test(document.activeElement?.getAttribute('aria-label') || '')],
    ],
  };
  for (const [path, list] of Object.entries(targets)) {
    const res = {};
    for (const [name, pred] of list) {
      const ctx = await browser.newContext({ viewport: vp });
      await ctx.addInitScript(() => {
        try {
          localStorage.setItem('czaba-lead-magnet-dismissed', String(Date.now()));
          localStorage.setItem('cookie-consent', 'accepted');
        } catch {}
      });
      const page = await ctx.newPage();
      await page.goto(base + path, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const found = await tabTo(page, pred);
      if (!found) {
        res[name] = { found: false };
      } else {
        const i = await page.evaluate(info);
        const sides = i ? await brassSides(page, decoder, i.rect) : null;
        let inner = null;
        if (name === 'product card link') {
          inner = await page.evaluate(() => {
            const d = document.activeElement.querySelector('div');
            const r = d?.getBoundingClientRect();
            const g = document.activeElement.closest('article')?.parentElement?.getBoundingClientRect();
            const art = document.activeElement.closest('article')?.getBoundingClientRect();
            return {
              innerRect: r && { x: r.x, y: r.y, w: r.width, h: r.height },
              innerRadius: d && getComputedStyle(d).borderRadius,
              linkRadius: getComputedStyle(document.activeElement).borderRadius,
              articleRect: art && { x: art.x, y: art.y, w: art.width, h: art.height },
              gridRect: g && { x: g.x, y: g.y, w: g.width, h: g.height },
              linkRects: [...document.activeElement.getClientRects()].map((q) => ({ x: q.x, y: q.y, w: q.width, h: q.height })),
            };
          });
          if (inner?.innerRect) inner.innerBrass = await brassSides(page, decoder, inner.innerRect);
          await page.screenshot({ path: `${outDir}/${label}-cardlink-1280.png`, clip: { x: Math.max(0, i.rect.x - 10), y: Math.max(0, i.rect.y - 10), width: Math.min(i.rect.w + 20, 600), height: Math.min(i.rect.h + 20, 600) } }).catch(() => {});
        }
        res[name] = { found: true, ...i, brassSides: sides, inner };
      }
      await ctx.close();
    }
    out.pages[path] = res;
  }
  const mouse = {};
  {
    const ctx = await browser.newContext({ viewport: vp });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem('czaba-lead-magnet-dismissed', String(Date.now()));
        localStorage.setItem('cookie-consent', 'accepted');
      } catch {}
    });
    const page = await ctx.newPage();
    await page.goto(`${base}/store`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(1500);
    for (const [name, sel] of [
      ['search input', 'input[type="search"], input[placeholder*="earch" i]'],
      ['sort select', 'select'],
    ]) {
      const loc = page.locator(sel).first();
      if ((await loc.count()) === 0) {
        mouse[name] = { found: false };
        continue;
      }
      await loc.click();
      await page.waitForTimeout(300);
      mouse[name] = await page.evaluate(info);
      await page.keyboard.press('Escape');
    }
    await ctx.close();
  }
  out.mouse = mouse;
  {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage();
    await page.goto(`${base}/scenes/pulse-loop-kit`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(2000);
    out.scenes = await page.evaluate(() => {
      const t = [...document.querySelectorAll('label, button')].find((e) => /Choose video/.test(e.textContent || ''));
      const r = t?.getBoundingClientRect();
      return {
        url: location.pathname,
        title: document.title,
        bodyText: document.body.innerText.slice(0, 200),
        chooseVideo: t ? { tag: t.tagName, rect: { x: r.x, y: r.y, w: r.width, h: r.height } } : null,
      };
    });
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${outDir}/probe-${label}.json`, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
