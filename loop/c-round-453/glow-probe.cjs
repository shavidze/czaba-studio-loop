// usage: node glow-probe.cjs <base> <out.json> <viewports e.g. 1440,1280> <shotDir>
// STORE-2b-3b probe: rest / hover / active / keyboard focus of every live primary button, the inert
// shadow-glow utility, and a computed-style digest of /studio-lab (rest + Export dialog).
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const [base, outFile, vpArg = '1440,1280', shotDir = 'shots'] = process.argv.slice(2);
const SIZES = { 1440: [1440, 900], 1280: [1280, 720], 375: [375, 812] };

const TARGETS = [
  { id: 'HEADER-SIGNIN', route: '/', role: 'button', name: 'Sign In', scope: 'header' },
  { id: 'HERO-CTA', route: '/', role: 'link', name: 'Discover the Collection' },
  { id: 'NOTFOUND-CTA', route: '/no-such-page-453', role: 'link', name: 'Back Home' },
  { id: 'LOGIN-STUB', route: '/account/login', role: 'link', name: 'Back to Home' },
  { id: 'SEARCH-STUB', route: '/search', role: 'link', name: 'Back to Home' },
  { id: 'REQUIREAUTH-BUTTON', route: '/account', css: 'button:not(header button)', name: 'Sign In' },
  { id: 'GIFTCARD-SELECT', route: '/gift-cards', role: 'button', name: /^Select|Loading/ },
  { id: 'SUPPORT-START-CHAT', route: '/support', pre: 'Live Chat', role: 'button', name: 'Start Chat' },
];

const STYLE_KEYS = ['boxShadow', 'backgroundColor', 'backgroundImage', 'color', 'opacity', 'outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset'];

function lum([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function rgb(s) { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(/[ ,/]+/).map(Number); return p; }
function contrast(fg, bg) {
  const a = rgb(fg); const b = rgb(bg); if (!a || !b) return null;
  if (b.length > 3 && b[3] === 0) return null;
  const l1 = lum(a); const l2 = lum(b); return +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2));
}
function hueOf([r, g, b]) {
  r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b); const mn = Math.min(r, g, b); const d = mx - mn;
  if (d === 0) return null; let h;
  if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
  return Math.round((h * 60 + 360) % 360);
}
function analyse(st) {
  const shadow = st.boxShadow || 'none';
  const layers = shadow === 'none' ? [] : shadow.split(/,(?![^(]*\))/).map((l) => l.trim());
  const glowLayers = layers.filter((l) => { const nums = l.replace(/rgba?\([^)]*\)/, '').trim().split(/\s+/).map(parseFloat); return nums[0] === 0 && nums[1] === 0 && nums[2] > 0; });
  const tealLayers = layers.filter((l) => { const c = rgb(l); const h = c && hueOf(c); return h !== null && h >= 160 && h <= 200; });
  return { zeroOffsetGlowLayers: glowLayers.length, tealShadowLayers: tealLayers.length, textContrast: contrast(st.color, st.backgroundColor), bgHue: (() => { const c = rgb(st.backgroundColor); return c ? hueOf(c) : null; })() };
}

async function styles(loc) {
  return loc.evaluate((el, keys) => {
    const cs = getComputedStyle(el); const o = {}; for (const k of keys) o[k] = cs[k];
    const r = el.getBoundingClientRect(); o.box = [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 10) / 10);
    o.focusVisible = el.matches(':focus-visible'); return o;
  }, STYLE_KEYS);
}

async function studioDigest(page) {
  return page.evaluate(() => {
    const keys = ['boxShadow', 'backgroundColor', 'backgroundImage', 'color', 'opacity', 'outlineStyle', 'outlineColor', 'filter'];
    const rows = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      rows.push(keys.map((k) => cs[k]).join('|'));
    }
    return { count: rows.length, rows };
  });
}

(async () => {
  fs.mkdirSync(shotDir, { recursive: true });
  const browser = await chromium.launch();
  const out = { base, when: new Date().toISOString(), targets: [], inert: [], studio: [] };
  for (const vp of vpArg.split(',')) {
    const [w, h] = SIZES[vp];
    for (const t of TARGETS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().split('T')[0], dismissed: true, submitted: false })); } catch (e) {} });
      const page = await ctx.newPage();
      const row = { id: t.id, vp, route: t.route };
      try {
        await page.goto(base + t.route, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
        await page.waitForTimeout(1500);
        if (t.pre) {
          await page.getByRole('button', { name: new RegExp('^' + t.pre) }).first().click({ timeout: 8000 });
          await page.waitForTimeout(800);
        }
        const scope = t.scope ? page.locator(t.scope).first() : page;
        const loc = t.css
          ? page.locator(t.css, { hasText: new RegExp('^' + t.name + '$') }).first()
          : scope.getByRole(t.role, { name: t.name, exact: typeof t.name === 'string' }).first();
        await loc.waitFor({ state: 'visible', timeout: 8000 });
        await loc.scrollIntoViewIfNeeded();
        await page.mouse.move(2, h - 2);
        await page.waitForTimeout(450);
        row.text = (await loc.innerText()).trim().slice(0, 60);
        row.disabled = await loc.evaluate((el) => el.disabled === true || el.getAttribute('aria-disabled') === 'true');
        row.rest = await styles(loc);
        const b = await loc.boundingBox();
        const cx = b.x + b.width / 2; const cy = b.y + b.height / 2;
        await page.mouse.move(cx, cy);
        await page.waitForTimeout(450);
        row.hover = await styles(loc);
        await loc.screenshot({ path: path.join(shotDir, `${t.id}-${vp}-hover.png`) }).catch(() => {});
        await page.mouse.down();
        await page.waitForTimeout(300);
        row.active = await styles(loc);
        await page.mouse.move(2, h - 2);
        await page.mouse.up();
        await page.waitForTimeout(450);
        await page.keyboard.press('Tab');
        await loc.focus();
        await page.waitForTimeout(300);
        row.keyboardFocus = await styles(loc);
        await loc.screenshot({ path: path.join(shotDir, `${t.id}-${vp}-focus.png`) }).catch(() => {});
        for (const k of ['rest', 'hover', 'active', 'keyboardFocus']) row[k].analysis = analyse(row[k]);
      } catch (e) {
        row.error = String(e).split('\n')[0];
      }
      out.targets.push(row);
      await ctx.close();
    }
    for (const route of ['/', '/studio-lab']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
      await page.waitForTimeout(1000);
      const v = await page.evaluate(() => {
        const d = document.createElement('div'); d.className = 'shadow-glow'; d.style.width = '10px'; d.style.height = '10px';
        document.body.appendChild(d); const s = getComputedStyle(d).boxShadow; d.remove(); return s;
      });
      out.inert.push({ vp, route, shadowGlowUtility: v });
      await ctx.close();
    }
    {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.goto(base + '/studio-lab', { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
      await page.waitForTimeout(2500);
      await page.mouse.move(2, h - 2);
      const rest = await studioDigest(page);
      await page.screenshot({ path: path.join(shotDir, `studio-${vp}-rest.png`) });
      let dialog = { count: 0, rows: [] }; let exportOpened = false;
      try {
        await page.getByRole('button', { name: /^Export/ }).first().click({ timeout: 8000 });
        await page.getByRole('dialog').first().waitFor({ state: 'visible', timeout: 8000 });
        exportOpened = true;
        await page.waitForTimeout(800);
        dialog = await studioDigest(page);
        await page.screenshot({ path: path.join(shotDir, `studio-${vp}-export.png`) });
      } catch (e) { dialog.error = String(e).split('\n')[0]; }
      const hash = (r) => crypto.createHash('sha256').update(r.rows.join('\n')).digest('hex').slice(0, 16);
      out.studio.push({ vp, restCount: rest.count, restHash: hash(rest), exportOpened, exportCount: dialog.count, exportHash: hash(dialog), restRows: rest.rows, exportRows: dialog.rows });
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
  const summary = out.targets.map((r) => r.error ? `${r.id} ${r.vp} ERROR ${r.error}` : `${r.id} ${r.vp} rest[${r.rest.boxShadow}] hover[${r.hover.boxShadow} bg=${r.hover.backgroundColor} op=${r.hover.opacity} c=${r.hover.analysis.textContrast}] active[${r.active.boxShadow} op=${r.active.opacity}] fv=${r.keyboardFocus.focusVisible} outline=${r.keyboardFocus.outlineStyle}/${r.keyboardFocus.outlineWidth}`);
  console.log(summary.join('\n'));
  console.log(out.inert.map((i) => `INERT ${i.vp} ${i.route} ${i.shadowGlowUtility}`).join('\n'));
  console.log(out.studio.map((s) => `STUDIO ${s.vp} rest ${s.restCount} ${s.restHash} export ${s.exportOpened} ${s.exportCount} ${s.exportHash}`).join('\n'));
})();
