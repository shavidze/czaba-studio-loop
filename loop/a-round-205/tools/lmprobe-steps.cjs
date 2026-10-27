// A round 205: dialog name, post-click containment, email/success steps, restore. usage: node lmprobe-steps.cjs <port> <W> <H>
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs'); const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [port, W, H] = [process.argv[2], +process.argv[3], +process.argv[4]];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  await page.route('**/api/subscribe', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const out = { port, W, H, steps: [] };
  const snap = async (label) => out.steps.push({ label, ...(await page.evaluate(() => {
    const a = document.activeElement; const d = document.querySelector('[role="dialog"]');
    return { active: a ? `${a.tagName}:${(a.getAttribute('aria-label') || a.getAttribute('placeholder') || a.textContent || '').trim().slice(0, 40)}` : null,
      inDialog: !!(d && a && (d === a || d.contains(a))), dialog: !!d, scrollY: window.scrollY, bodyTop: document.body.style.top,
      fv: a ? a.matches(':focus-visible') : null, outline: a ? getComputedStyle(a).outlineStyle + ' ' + getComputedStyle(a).outlineWidth : null, alert: [...document.querySelectorAll('[role="alert"]')].map((x) => x.textContent.trim()) };
  })) });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await sleep(1500);
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.55));
  await sleep(1500);
  await page.evaluate(() => { const els=[...document.querySelectorAll('a[href],button')].filter((e)=>{const r=e.getBoundingClientRect();return r.top>100&&r.bottom<innerHeight-50&&r.width>0;}); if (els[0]) els[0].focus(); }); await sleep(400);
  await snap('before-open');
  const dlg = page.getByRole('dialog', { name: 'Get Your Tracks, Sound Effects & More' });
  await dlg.waitFor({ timeout: 15000 }); await sleep(600);
  out.offerNameMatches = await dlg.count(); await snap('open');
  await page.mouse.click(W / 2, 80); await sleep(300); await snap('after-blank-click');
  for (const k of ['Tab', 'Tab', 'Shift+Tab', 'Shift+Tab']) { await page.keyboard.press(k); await sleep(250); await snap('post-click ' + k); }
  await page.getByRole('button', { name: 'FREE DOWNLOAD' }).focus(); await page.keyboard.press('Enter'); await sleep(500);
  out.emailNameMatches = await page.getByRole('dialog', { name: 'CONTINUE TO CLAIM YOUR OFFER' }).count(); await snap('email-step');
  for (const k of ['Tab', 'Tab', 'Tab']) { await page.keyboard.press(k); await sleep(250); await snap('email ' + k); }
  await page.getByRole('button', { name: 'CONTINUE' }).focus(); await page.keyboard.press('Enter'); await sleep(400); await snap('empty-submit');
  await page.getByPlaceholder('Enter your email address').fill('a205@example.com'); await page.getByRole('button', { name: 'CONTINUE' }).focus(); await page.keyboard.press('Enter'); await sleep(1200);
  out.successNameMatches = await page.getByRole('dialog', { name: "We've sent your free mystery pack to your email!" }).count(); await snap('success-step');
  for (const k of ['Tab', 'Tab']) { await page.keyboard.press(k); await sleep(250); await snap('success ' + k); }
  await page.getByRole('button', { name: 'BACK TO SITE' }).focus(); await page.keyboard.press('Enter'); await sleep(300); await snap('back+300'); await sleep(1500); await snap('back+1800');
  out.storage = await page.evaluate(() => localStorage.getItem('czaba_lead_magnet'));
  await ctx.storageState({ path: path.join(__dirname, '..', '..', 'a-browse.json') });
  fs.writeFileSync(path.join(__dirname, '..', 'out', `lm-a205-steps-${W}.json`), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ o: out.offerNameMatches, e: out.emailNameMatches, s: out.successNameMatches, storage: out.storage }));
  for (const s of out.steps) console.log(s.label, '|', s.active, s.inDialog, s.scrollY, s.bodyTop, JSON.stringify(s.alert), s.fv, s.outline);
  await browser.close();
})();
