const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const base = 'http://127.0.0.1:5173';
const vp = { width: 1280, height: 720 };

const focusInfo = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const cs = getComputedStyle(el);
  const b = el.getBoundingClientRect();
  let op = 1;
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) op *= Number.parseFloat(getComputedStyle(n).opacity);
  return {
    tag: el.tagName,
    cls: typeof el.className === 'string' ? el.className.slice(0, 60) : '',
    name: el.getAttribute('aria-label') || el.getAttribute('placeholder') || (el.textContent || '').trim().slice(0, 30),
    outline: `${cs.outlineStyle} ${cs.outlineWidth} offset ${cs.outlineOffset}`,
    boxShadow: cs.boxShadow,
    effOpacity: op,
    focusSource: document.documentElement.dataset.focusSource ?? null,
    rect: { x: b.x, y: b.y, w: b.width, h: b.height },
  };
};

async function shot(page, name, info) {
  if (!info) return;
  const r = info.rect ?? info;
  await page.screenshot({
    path: `${__dirname}/${name}.png`,
    clip: { x: Math.max(0, r.x - 12), y: Math.max(0, r.y - 12), width: r.w + 24, height: r.h + 24 },
  }).catch(() => {});
}

async function freshPage(browser) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  return { ctx, page };
}

(async () => {
  const browser = await chromium.launch();
  const out = {};
  {
    const { ctx, page } = await freshPage(browser);
    await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(1500);
    out.freshAttr = await page.evaluate(() => document.documentElement.dataset.focusSource ?? null);
    for (let i = 0; i < 120; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(80);
      if (await page.evaluate(() => /play preview/i.test(document.activeElement?.getAttribute('aria-label') || ''))) break;
    }
    await page.waitForTimeout(500);
    out.playPreview = await page.evaluate(focusInfo);
    await shot(page, 'tree-play-preview-focus-1280', out.playPreview);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    out.afterTabAwayOverlayOpacity = await page.evaluate(() => {
      const o = [...document.querySelectorAll('div')].find((d) => d.className.includes?.('group-hover:opacity-100') && d.className.includes('focus-within:opacity-100'));
      return o ? getComputedStyle(o).opacity : null;
    });
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(600);
    out.palette = await page.evaluate(focusInfo);
    await shot(page, 'tree-palette-input-1280', out.palette);
    await ctx.close();
  }
  {
    const { ctx, page } = await freshPage(browser);
    await page.goto(`${base}/store`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const play = page.getByRole('button', { name: /play preview/i }).first();
    out.storePlayCount = await page.getByRole('button', { name: /play preview/i }).count();
    if (out.storePlayCount > 0) {
      await play.click({ force: true }).catch((e) => (out.playErr = String(e)));
      await page.waitForTimeout(1500);
      out.sliders = [];
      for (let i = 0; i < 200; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(60);
        const info = await page.evaluate(focusInfo);
        if (info && info.tag === 'INPUT' && /audio-player/.test(info.cls)) {
          await page.waitForTimeout(400);
          const settled = await page.evaluate(focusInfo);
          await shot(page, `tree-${settled.cls.split(' ')[0]}-1280`, settled.rect);
          out.sliders.push(settled);
          if (out.sliders.length >= 2) break;
        }
      }
      out.audioPlayerPresent = await page.evaluate(() => document.querySelectorAll('.audio-player-progress, .audio-player-volume-slider').length);
    }
    await ctx.close();
  }
  {
    const r = {};
    const { ctx, page } = await freshPage(browser);
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(3000);
    r.initial = await page.evaluate(() => document.documentElement.dataset.focusSource ?? null);
    const play = page.getByRole('button', { name: /^play/i }).first();
    await play.click().catch((e) => (r.playErr = String(e)));
    await page.waitForTimeout(300);
    r.afterMouse = await page.evaluate(focusInfo);
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    r.afterTab = await page.evaluate(focusInfo);
    const czaba = page.getByRole('link', { name: /czaba/i }).first();
    r.czabaLinks = await page.getByRole('link', { name: /czaba/i }).count();
    if (r.czabaLinks > 0) {
      await czaba.click().catch((e) => (r.navErr = String(e)));
      await page.waitForURL(`${base}/`, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1200);
      r.onHomeUrl = page.url();
      r.onHomeAttrAfterClick = await page.evaluate(() => document.documentElement.dataset.focusSource ?? null);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      r.onHomeAttrAfterTab = await page.evaluate(() => document.documentElement.dataset.focusSource ?? null);
      const studioLink = page.getByRole('link', { name: /^studio$/i }).first();
      await studioLink.click().catch((e) => (r.nav2Err = String(e)));
      await page.waitForTimeout(3000);
      r.backUrl = page.url();
      r.backAttrAfterClick = await page.evaluate(() => document.documentElement.dataset.focusSource ?? null);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      r.backAttrAfterTab = await page.evaluate(() => document.documentElement.dataset.focusSource ?? null);
    }
    out.studio = r;
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${__dirname}/extra-probe-tree.json`, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
