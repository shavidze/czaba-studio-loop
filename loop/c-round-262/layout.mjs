import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
const label = process.argv[3] ?? 'after';
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const res = {};
const browser = await chromium.launch();

async function ready(page) {
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

const measure = (page) => page.evaluate(() => {
  const r = (el) => { if (!el) return null; const q = el.getBoundingClientRect(); return { x: +q.x.toFixed(2), y: +q.y.toFixed(2), w: +q.width.toFixed(2), h: +q.height.toFixed(2), right: +q.right.toFixed(2), bottom: +q.bottom.toFixed(2) }; };
  const master = document.querySelector('[data-testid="arrangement-master"]');
  const footer = document.querySelector('footer');
  const row = footer ? [...footer.children].filter((c) => c.tagName === 'DIV').at(-1) : null;
  const sc = [...document.querySelectorAll('footer button')].find((b) => /Shortcuts/.test(b.textContent ?? ''));
  const leaves = footer ? [...footer.querySelectorAll('*')].filter((e) => e.children.length === 0 && !master.contains(e) && e.getBoundingClientRect().width > 0) : [];
  const m = master.getBoundingClientRect();
  const overlaps = leaves.filter((e) => { const q = e.getBoundingClientRect(); return q.left < m.right - 0.01 && q.right > m.left + 0.01 && q.top < m.bottom - 0.01 && q.bottom > m.top + 0.01; }).map((e) => `${e.tagName}:${(e.textContent ?? '').trim().slice(0, 40)}`);
  const truncP = row ? [...row.children].filter((c) => c.tagName === 'P').map((p) => ({ tid: p.getAttribute('data-testid'), text: (p.textContent ?? '').trim().slice(0, 120), sw: p.scrollWidth, cw: p.clientWidth, h: +p.getBoundingClientRect().height.toFixed(2), lines: Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight || '16')), ws: getComputedStyle(p).whiteSpace, ov: getComputedStyle(p).textOverflow })) : [];
  return {
    header: r(document.querySelector('header')),
    transport: r(document.querySelector('[data-testid="arrangement-transport"]')),
    footer: r(footer),
    footerScroll: footer ? { sw: footer.scrollWidth, cw: footer.clientWidth } : null,
    row: r(row),
    rowKids: row ? [...row.children].map((c) => `${c.tagName}|${c.getAttribute('data-testid') ?? ''}`) : [],
    master: r(master),
    masterInFooter: !!footer?.contains(master),
    masterInHeader: !!document.querySelector('header')?.contains(master),
    masterInRow: !!row?.contains(master),
    shortcuts: r(sc),
    gap: sc ? +(sc.getBoundingClientRect().x - m.right).toFixed(2) : null,
    scroller: r(document.querySelector('[data-testid="arrangement-timeline-scroller"]')),
    overlaps,
    paragraphs: truncP,
    hasRange: !!document.querySelector('[data-testid="arrangement-range"]'),
  };
});

for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const v = `${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await ready(page);
  res[v] = { normal: await measure(page), authUser: await page.evaluate(() => localStorage.getItem('auth_user')) };
  await page.screenshot({ path: `${out}/${label}-empty-${v}.png` });
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await page.waitForTimeout(1200);
  res[v].clip = await measure(page);
  await page.screenshot({ path: `${out}/${label}-clip-${v}.png` });
  const body = page.locator('[title="drag = time selection · click = insert marker"]').first();
  const bb = await body.boundingBox();
  if (bb) {
    await page.mouse.move(bb.x + 40, bb.y + bb.height / 2);
    await page.mouse.down();
    await page.mouse.move(bb.x + 140, bb.y + bb.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    res[v].range = await measure(page);
    await page.screenshot({ path: `${out}/${label}-range-${v}.png` });
  } else res[v].range = 'clip body not found';
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const clip = page.locator('[title$="— drag to move"]').first();
  const cb = await clip.boundingBox();
  const lanes = await page.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((l) => { const q = l.getBoundingClientRect(); return { id: l.getAttribute('data-track-id'), y: q.y, h: q.height }; }));
  res[v].lanes = lanes;
  if (cb) {
    const sx = cb.x + Math.min(30, cb.width / 2); const sy = cb.y + cb.height / 2;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    const target = lanes.find((l) => l.y > cb.y + cb.height) ?? lanes.find((l) => l.y + l.h < cb.y);
    const ty = target ? target.y + target.h / 2 : sy + 80;
    await page.mouse.move(sx + 2, sy + 10, { steps: 3 });
    await page.mouse.move(sx + 4, ty, { steps: 10 });
    await page.waitForTimeout(400);
    res[v].laneMove = await measure(page);
    res[v].laneMoveTarget = target ?? null;
    await page.screenshot({ path: `${out}/${label}-lanemove-${v}.png` });
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await page.waitForTimeout(400);
    res[v].afterLaneMove = await measure(page);
  } else res[v].laneMove = 'clip not found';
  res[v].errors = errors;
  await ctx.close();
}

// narrow sweep
res.narrow = {};
for (const [w, h] of [[1024, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await ready(page);
  res.narrow.normal1024 = await measure(page);
  await page.screenshot({ path: `${out}/${label}-empty-1024x720.png` });
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await page.waitForTimeout(1200);
  res.narrow.clip1024 = await measure(page);
  await page.screenshot({ path: `${out}/${label}-clip-1024x720.png` });
  const sweep = [];
  let first = null;
  for (let ww = 1024; ww >= 640; ww -= 8) {
    await page.setViewportSize({ width: ww, height: 720 });
    await page.waitForTimeout(150);
    const m = await measure(page);
    sweep.push({ w: ww, overlaps: m.overlaps.length, footerH: m.footer.h, overflow: m.footerScroll.sw - m.footerScroll.cw, masterX: m.master.x });
    if (first === null && (m.overlaps.length > 0 || m.footerScroll.sw > m.footerScroll.cw)) { first = { w: ww, m }; }
  }
  res.narrow.sweepClip = sweep;
  res.narrow.firstOverlapClip = first ? { w: first.w, overlaps: first.m.overlaps, footerH: first.m.footer.h } : null;
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/${label}.json`, JSON.stringify(res, null, 1));
for (const v of ['1440x900', '1280x720']) {
  const d = res[v];
  const s = (k) => (typeof d[k] === 'object' ? { footerH: d[k].footer?.h, scrollerH: d[k].scroller?.h, master: d[k].master, gap: d[k].gap, sc: d[k].shortcuts && [d[k].shortcuts.x, d[k].shortcuts.right], ov: d[k].overlaps, fo: d[k].footerScroll, inF: d[k].masterInFooter, inH: d[k].masterInHeader, inRow: d[k].masterInRow, hdr: d[k].header?.h, tr: d[k].transport?.h, kids: d[k].rowKids, p: d[k].paragraphs, range: d[k].hasRange } : d[k]);
  console.log(v, JSON.stringify({ normal: s('normal'), clip: s('clip'), range: s('range'), laneMove: s('laneMove'), errors: d.errors, authUser: d.authUser }, null, 0));
}
console.log('narrow', JSON.stringify({ n: res.narrow.normal1024.overlaps, nf: res.narrow.normal1024.footerScroll, c: res.narrow.clip1024.overlaps, cf: res.narrow.clip1024.footerScroll, first: res.narrow.firstOverlapClip }));
