// B round 505 -> 506 planning probe: LeadMagnet buttons (DPG-BUTTON-CLEANUP-2 stage 2e).
// Usage: BASE=http://127.0.0.1:5173 node lm-506.cjs <out-dir> <tag>
// Opens the popup by exit intent (scroll 55 %, document mouseleave), then per step reads the action button
// at rest, hover, mouse press and keyboard focus, walks offer -> email -> success with /api/subscribe stubbed
// (held 1.2 s so the SENDING... state can be read), and records document.activeElement after each step.
// Also runs one unstubbed submit (cloud: 500 "Server configuration error") and the empty-email submit.
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const OUT = process.argv[2];
const TAG = process.argv[3] || 'run';
const WIDTHS = (process.env.WIDTHS || '1440,1280,375').split(',').map(Number);
const H = (W) => (W === 1440 ? 900 : W === 1280 ? 720 : 812);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

const READ = `(name) => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return { missing: 'dialog' };
  const b = [...d.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || x.textContent || '').trim() === name);
  if (!b) return { missing: name };
  const cs = getComputedStyle(b);
  const r = b.getBoundingClientRect();
  const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return { tag: b.tagName, type: b.getAttribute('type'), text: b.textContent.trim(), box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(1)),
    bg: cs.backgroundColor, color: cs.color, font: cs.fontSize + ' ' + cs.fontWeight, tt: cs.textTransform, ls: cs.letterSpacing,
    pad: cs.padding, radius: cs.borderRadius, shadow: cs.boxShadow, opacity: cs.opacity, transform: cs.transform, cursor: cs.cursor,
    disabled: b.disabled, pe: cs.pointerEvents, fv: b.matches(':focus-visible'), os: cs.outlineStyle, ow: cs.outlineWidth, oo: cs.outlineOffset, oc: cs.outlineColor,
    topIsButton: !!hit && (hit === b || b.contains(hit)), maxW: cs.maxWidth };
}`;
const ACTIVE = `() => { const el = document.activeElement; if (!el || el === document.body) return { tag: el ? el.tagName : null };
  const d = document.querySelector('[role="dialog"]');
  return { tag: el.tagName, name: (el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.textContent || '').trim().slice(0, 40), inDialog: !!d && d.contains(el), fv: el.matches(':focus-visible') }; }`;
const DIALOG = `() => { const d = document.querySelector('[role="dialog"]'); if (!d) return null; const r = d.getBoundingClientRect();
  const kids = [...d.querySelectorAll('h2, form, input, button, p[role="alert"]')].map((e) => { const q = e.getBoundingClientRect(); return [e.tagName, (e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.textContent || '').trim().slice(0, 24), +q.y.toFixed(1), +q.height.toFixed(1)]; });
  return { box: [r.width, r.height], kids }; }`;

function lum(c) {
  const m = c.match(/[\d.]+/g).map(Number);
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]);
}
const contrast = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };

async function openPopup(browser, W) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H(W) }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await page.evaluate(() => window.scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * 0.55)));
  await sleep(1500);
  await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, clientX: 10 })));
  for (let i = 0; i < 60; i++) { if (await page.locator('[role="dialog"]').count()) break; await sleep(100); }
  await sleep(700);
  return { ctx, page, errors };
}

async function states(page, name, shot) {
  const loc = page.getByRole('dialog').getByRole('button', { name, exact: true });
  await page.mouse.move(2, 2);
  await sleep(250);
  const rest = await page.evaluate(`(${READ})(${JSON.stringify(name)})`);
  const box = await loc.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(350);
  const hover = await page.evaluate(`(${READ})(${JSON.stringify(name)})`);
  await page.mouse.down();
  await sleep(250);
  const press = await page.evaluate(`(${READ})(${JSON.stringify(name)})`);
  await page.mouse.move(2, 2);
  await page.mouse.up();
  await sleep(250);
  // keyboard focus: focus the previous element, then Tab onto the target
  await page.evaluate((n) => { const d = document.querySelector('[role="dialog"]'); const els = [...d.querySelectorAll('button:not([disabled]), input:not([disabled])')]; const i = els.findIndex((x) => (x.getAttribute('aria-label') || x.textContent || '').trim() === n); (els[i - 1] || els[els.length - 1]).focus(); }, name);
  await page.keyboard.press('Tab');
  await sleep(300);
  const kbd = await page.evaluate(`(${READ})(${JSON.stringify(name)})`);
  const pad = 10;
  await page.screenshot({ path: path.join(OUT, `${shot}-focus.png`), clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + 2 * pad, height: box.height + 2 * pad } });
  const bodyBg = await page.evaluate(() => getComputedStyle(document.querySelector('[role="dialog"]')).backgroundColor);
  return { rest, hover, press, kbd, restContrast: contrast(rest.color, rest.bg), hoverContrast: contrast(hover.color, hover.bg), fillVsDialog: contrast(rest.bg, bodyBg), dialogBg: bodyBg };
}

async function run(browser, W) {
  const out = { W };
  const { ctx, page, errors } = await openPopup(browser, W);
  let posts = 0;
  let mode = 'ok';
  await page.route('**/api/subscribe', async (r) => {
    posts++;
    if (mode === 'ok') { await sleep(1200); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }); }
    return r.continue();
  });
  out.opened = await page.locator('[role="dialog"]').count();
  out.activeOnOpen = await page.evaluate(`(${ACTIVE})()`);
  out.offerDialog = await page.evaluate(`(${DIALOG})()`);
  await page.screenshot({ path: path.join(OUT, `${TAG}-${W}-offer.png`) });
  out.offer = await states(page, 'FREE DOWNLOAD', `${TAG}-${W}-free`);
  await page.getByRole('dialog').getByRole('button', { name: 'FREE DOWNLOAD', exact: true }).click();
  await sleep(500);
  out.activeOnEmail = await page.evaluate(`(${ACTIVE})()`);
  out.emailDialog = await page.evaluate(`(${DIALOG})()`);
  await page.screenshot({ path: path.join(OUT, `${TAG}-${W}-email.png`) });
  out.email = await states(page, 'CONTINUE', `${TAG}-${W}-continue`);
  // empty submit via click: validation error, no POST
  await page.getByRole('dialog').getByRole('button', { name: 'CONTINUE', exact: true }).click();
  await sleep(400);
  out.emptyAlert = await page.evaluate(() => { const a = document.querySelector('[role="dialog"] [role="alert"]'); return a ? a.textContent.trim() : null; });
  out.postsAfterEmpty = posts;
  // unstubbed submit (cloud: server returns 500)
  mode = 'pass';
  await page.getByRole('dialog').getByPlaceholder('Enter your email address').fill('probe@example.com');
  await page.getByRole('dialog').getByRole('button', { name: 'CONTINUE', exact: true }).click();
  await sleep(1500);
  out.unstubbedAlert = await page.evaluate(() => { const a = document.querySelector('[role="dialog"] [role="alert"]'); return a ? a.textContent.trim() : null; });
  out.stepAfterUnstubbed = await page.evaluate(() => /CLAIM YOUR OFFER/.test(document.querySelector('[role="dialog"]')?.innerText || '') ? 'email' : 'other');
  out.continueAfterError = await page.evaluate(`(${READ})("CONTINUE")`);
  out.activeAfterError = await page.evaluate(`(${ACTIVE})()`);
  // stubbed submit via Enter in the field, read SENDING... while held
  mode = 'ok';
  await page.getByRole('dialog').getByPlaceholder('Enter your email address').fill('probe2@example.com');
  await page.getByRole('dialog').getByPlaceholder('Enter your email address').press('Enter');
  await sleep(300);
  out.sending = await page.evaluate(`(${READ})("SENDING...")`);
  await page.screenshot({ path: path.join(OUT, `${TAG}-${W}-sending.png`) });
  await sleep(1600);
  out.postsTotal = posts;
  out.activeOnSuccess = await page.evaluate(`(${ACTIVE})()`);
  out.successDialog = await page.evaluate(`(${DIALOG})()`);
  await page.screenshot({ path: path.join(OUT, `${TAG}-${W}-success.png`) });
  out.success = await states(page, 'BACK TO SITE', `${TAG}-${W}-back`);
  await page.getByRole('dialog').getByRole('button', { name: 'BACK TO SITE', exact: true }).focus();
  await page.keyboard.press('Enter');
  await sleep(600);
  out.closedAfterBack = (await page.locator('[role="dialog"]').count()) === 0;
  out.lm = await page.evaluate(() => localStorage.getItem('czaba_lead_magnet'));
  out.errors = errors;
  await ctx.close();
  // Esc / Close control pass
  const second = await openPopup(browser, W);
  out.escOpened = await second.page.locator('[role="dialog"]').count();
  await second.page.keyboard.press('Escape');
  await sleep(500);
  out.escClosed = (await second.page.locator('[role="dialog"]').count()) === 0;
  await second.ctx.close();
  return out;
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--disable-lcd-text'] });
  const lines = [];
  for (const W of WIDTHS) {
    const r = await run(browser, W);
    lines.push(JSON.stringify(r));
    console.log(TAG, W, 'opened', r.opened, 'active', JSON.stringify(r.activeOnOpen), 'free', JSON.stringify(r.offer.rest.box), r.offer.rest.radius, 'continue', JSON.stringify(r.email.rest.box), r.email.rest.bg, 'back', JSON.stringify(r.success.rest.box), 'posts', r.postsAfterEmpty, r.postsTotal, 'afterError', JSON.stringify(r.activeAfterError), 'success-active', JSON.stringify(r.activeOnSuccess), 'esc', r.escClosed, 'errors', r.errors.length);
  }
  fs.writeFileSync(path.join(OUT, `${TAG}.jsonl`), lines.join('\n') + '\n');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
