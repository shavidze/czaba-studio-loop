// usage: BASE=http://127.0.0.1:5173 node measure-501.mjs <outdir> <tag>
// Stage 2b-2 targets: free-downloads "Download" (toggle), home NewsletterSection "Subscribe" (submit),
// hire-us "Send Message" (submit). Needs the loop mock-api on :5199 for the home page.
// Submitting state: the form POST is held by page.route until the measurement is taken.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const tag = process.argv[3] || 'head';
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const targets = [
  { id: 'FD-DOWNLOAD', path: '/free-downloads', name: 'Download', nth: 0 },
  { id: 'NL-SUBSCRIBE', path: '/', name: 'Subscribe', field: 'input[name="email"][placeholder="Enter your email"]', busy: 'Subscribing...' },
  { id: 'HU-SEND', path: '/hire-us', name: 'Send Message', busy: 'Sending...' },
];
const props = ['display','width','height','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopLeftRadius','borderTopWidth','fontSize','fontWeight','color','backgroundColor','boxShadow','gap','opacity','cursor','pointerEvents','transitionProperty'];
const vps = [[1440,900],[1280,720],[375,812]];
const lum = (rgb) => { const m = rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(c=> c<=0.03928? c/12.92 : ((c+0.055)/1.055)**2.4); return 0.2126*m[0]+0.7152*m[1]+0.0722*m[2]; };
const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return +((x+0.05)/(y+0.05)).toFixed(2); };
const read = (el, ps) => el.evaluate((n, ps) => { const s = getComputedStyle(n); const r = n.getBoundingClientRect(); const o = {}; for (const p of ps) o[p] = s[p]; o.box = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; o.type = n.getAttribute('type'); o.disabled = n.disabled === true; o.text = n.textContent.trim(); o.svg = n.querySelectorAll('svg').length; o.cls = n.className; return o; }, ps);
const res = [];
const browser = await chromium.launch();
for (const [w,h] of vps) {
  for (const t of targets) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); } catch {} });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
    try { await page.goto(BASE + t.path, { waitUntil: 'load', timeout: 45000 }); } catch {}
    await page.waitForTimeout(3000);
    const loc = page.getByRole('button', { name: t.name, exact: true });
    const n = await loc.count();
    const row = { id: t.id, vp: `${w}x${h}`, count: n, errors: errors.slice(0, 4) };
    if (n) {
      const el = loc.nth(t.nth ?? 0);
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);
      row.rest = await read(el, props);
      row.restContrast = ratio(row.rest.color, row.rest.backgroundColor);
      if (t.field) { const f = page.locator(t.field).first(); row.field = await read(f, ['height','borderTopLeftRadius']); }
      const form = el.locator('xpath=ancestor::form[1]');
      const clip = (await form.count()) ? await form.boundingBox() : await el.boundingBox();
      if (clip) await page.screenshot({ path: `${out}/${tag}-${t.id}-${w}.png`, clip: { x: Math.max(0, clip.x - 16), y: Math.max(0, clip.y - 16), width: Math.min(w - Math.max(0, clip.x - 16), clip.width + 32), height: clip.height + 32 } });
      await el.hover(); await page.waitForTimeout(400);
      row.hover = await read(el, ['backgroundColor','color','opacity']);
      row.hoverContrast = ratio(row.hover.color, row.hover.backgroundColor);
      await page.mouse.move(0, 0);
      if (w !== 375) {
        let hit = false;
        for (let i = 0; i < 80 && !hit; i++) { await page.keyboard.press('Tab'); hit = await el.evaluate((n) => document.activeElement === n); }
        row.kbd = hit ? await el.evaluate((n) => { const s = getComputedStyle(n); return { fv: n.matches(':focus-visible'), outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, outlineOffset: s.outlineOffset, outlineColor: s.outlineColor }; }) : 'not-reached';
        if (hit) { const c = await el.boundingBox(); if (c) await page.screenshot({ path: `${out}/${tag}-${t.id}-focus-${w}.png`, clip: { x: Math.max(0,c.x-12), y: Math.max(0,c.y-12), width: c.width+24, height: c.height+24 } }); }
        if (hit && t.id === 'FD-DOWNLOAD') { await page.keyboard.press('Enter'); await page.waitForTimeout(400); row.afterEnter = { expanded: await el.getAttribute('aria-expanded'), sendLink: await page.getByRole('button', { name: 'Send Download Link', exact: true }).count() }; await page.keyboard.press('Enter'); await page.waitForTimeout(300); row.afterEnter2 = await el.getAttribute('aria-expanded'); }
        const b = await el.boundingBox();
        if (b) { await el.evaluate((n) => n.blur()); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.waitForTimeout(150); row.press = await el.evaluate((n) => { const s = getComputedStyle(n); return { fv: n.matches(':focus-visible'), outlineStyle: s.outlineStyle, opacity: s.opacity }; }); await page.mouse.up(); await page.mouse.move(0, 0); if (t.id === 'FD-DOWNLOAD') { await el.click(); } }
      }
      if (t.busy && w === 1440) {
        let release; const held = new Promise((r) => { release = r; });
        await page.route((u) => u.pathname === new URL(BASE + t.path).pathname || u.search.includes('_data') || u.pathname.endsWith('.data'), async (r) => { if (r.request().method() === 'POST') { await held; await r.abort(); } else await r.continue(); });
        if (t.id === 'NL-SUBSCRIBE') await page.fill(t.field, 'probe@example.invalid');
        if (t.id === 'HU-SEND') { await page.fill('#name', 'Probe'); await page.fill('#email', 'probe@example.invalid'); await page.fill('#message', 'Probe message'); }
        await el.click();
        await page.waitForTimeout(800);
        const busy = page.getByRole('button', { name: t.busy, exact: true });
        row.busyCount = await busy.count();
        if (row.busyCount) { row.busy = await read(busy.first(), props); row.busySvg = await busy.first().evaluate((n) => { const v = n.querySelector('svg'); return v ? { color: getComputedStyle(v).color, cls: v.getAttribute('class') } : null; }); row.borderWhite = await busy.first().evaluate((n) => (n.closest('form') ?? n).querySelectorAll('[class*="border-white"]').length); const c = await busy.first().boundingBox(); if (c) await page.screenshot({ path: `${out}/${tag}-${t.id}-busy-${w}.png`, clip: { x: Math.max(0,c.x-16), y: Math.max(0,c.y-16), width: c.width+32, height: c.height+32 } }); }
        release();
      }
    }
    res.push(row);
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(`${out}/${tag}.json`, JSON.stringify(res, null, 1));
for (const r of res) console.log(r.id, r.vp, 'n', r.count, r.rest ? `${r.rest.box} bg ${r.rest.backgroundColor} fg ${r.rest.color} r ${r.rest.borderTopLeftRadius} pad ${r.rest.paddingTop}/${r.rest.paddingLeft} fs ${r.rest.fontSize}/${r.rest.fontWeight} c ${r.restContrast} hov ${r.hover.backgroundColor} ${r.hoverContrast}` : '', r.field ? `field h ${r.field.height} r ${r.field.borderTopLeftRadius} box ${r.field.box}` : '', r.kbd ? `kbd ${JSON.stringify(r.kbd)} press ${JSON.stringify(r.press)}` : '', r.afterEnter ? `enter ${JSON.stringify(r.afterEnter)} ${r.afterEnter2}` : '', r.busy ? `BUSY ${r.busy.text} dis ${r.busy.disabled} op ${r.busy.opacity} pe ${r.busy.pointerEvents} bg ${r.busy.backgroundColor} box ${r.busy.box} svg ${JSON.stringify(r.busySvg)} bw ${r.borderWhite}` : (r.busyCount === 0 ? 'BUSY not reached' : ''));
