// B round 506->507 probe: global AudioPlayer icon buttons. usage: BASE=... node ap-507.cjs <outdir> <tag>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const out = process.argv[2]; const tag = process.argv[3] || 'head';
const WIDTHS = (process.env.WIDTHS || '1440,1280,375').split(',').map(Number);
const VH = { 1440: 900, 1280: 720, 375: 812 };
const NAMES = ['Close player', 'Previous track', 'Next track', 'Mute|Unmute'];
fs.mkdirSync(out, { recursive: true });
function lum(c){const m=c.match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(m[0])+0.7152*f(m[1])+0.0722*f(m[2]);}
(async () => {
  const browser = await chromium.launch();
  const rows = [];
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: VH[w] }, reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba-entrance-seen','1'); localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); } catch {} });
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000);
    await page.keyboard.press('Escape');
    await page.evaluate(() => { const b = [...document.querySelectorAll('button[aria-label="Play preview"]')][0]; b.scrollIntoView({ block: 'center' }); b.click(); });
    await page.getByRole('button', { name: 'Close player' }).waitFor({ timeout: 10000 });
    await page.waitForTimeout(800);
    const read = async (re) => page.evaluate((src) => {
      const r = new RegExp('^(' + src + ')$');
      const el = [...document.querySelectorAll('button')].find(b => r.test(b.getAttribute('aria-label') || ''));
      if (!el) return null; const cs = getComputedStyle(el); const b = el.getBoundingClientRect();
      let bg = 'rgba(0, 0, 0, 0)', n = el.parentElement; while (n && (bg = getComputedStyle(n).backgroundColor) === 'rgba(0, 0, 0, 0)') n = n.parentElement;
      return { label: el.getAttribute('aria-label'), title: el.getAttribute('title'), box: [b.x, b.y, b.width, b.height].map(v => Math.round(v * 10) / 10), radius: cs.borderRadius, bg: cs.backgroundColor, color: cs.color, opacity: cs.opacity, transform: cs.transform, padding: cs.padding, border: cs.borderStyle, cls: el.className, parentBg: bg };
    }, re);
    const player = await page.evaluate(() => { const c = document.querySelector('button[aria-label="Close player"]'); let n = c; for (let i = 0; i < 6 && n; i++) n = n.parentElement; const b = (n || c).getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map(v => Math.round(v)); });
    for (const nm of NAMES) {
      const rest = await read(nm); if (!rest) { rows.push({ w, nm, missing: true }); continue; }
      const loc = page.locator('button').filter({ has: page.locator(':scope') }).and(page.locator(`button[aria-label="${rest.label}"]`));
      await loc.hover(); await page.waitForTimeout(300); const hover = await read(nm);
      await page.mouse.move(0, 0); await page.waitForTimeout(200);
      await loc.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
      const kbd = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { label: a.getAttribute('aria-label'), fv: a.matches(':focus-visible'), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, offset: cs.outlineOffset }; });
      const bb = await loc.boundingBox();
      await page.screenshot({ path: path.join(out, `${tag}-${w}-${rest.label.replace(/\W+/g, '_')}-focus.png`), clip: { x: Math.max(0, bb.x - 12), y: Math.max(0, bb.y - 12), width: bb.width + 24, height: bb.height + 24 } });
      const fg = lum(rest.color), pb = lum(rest.parentBg);
      rows.push({ w, nm, rest, hover, kbd, restContrastVsPanel: Math.round(((Math.max(fg, pb) + 0.05) / (Math.min(fg, pb) + 0.05)) * 100) / 100 });
    }
    await page.screenshot({ path: path.join(out, `${tag}-${w}-player.png`) });
    rows.push({ w, player, errors });
    await ctx.close();
  }
  fs.writeFileSync(path.join(out, `${tag}.jsonl`), rows.map(r => JSON.stringify(r)).join('\n') + '\n');
  await browser.close(); console.log('rows', rows.length);
})().catch(e => { console.error(e); process.exit(1); });
