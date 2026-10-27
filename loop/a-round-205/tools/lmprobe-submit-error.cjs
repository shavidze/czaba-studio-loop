// A round 205: focus after a failing (slow) submit. usage: node lmprobe-submit-error.cjs <port> <tag>
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs'); const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [port, tag] = [process.argv[2], process.argv[3] || 'x'];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  await page.route('**/api/subscribe', async (r) => { await sleep(800); await r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Server says no"}' }); });
  const out = { steps: [] };
  const snap = async (label) => out.steps.push({ label, ...(await page.evaluate(() => {
    const a = document.activeElement; const d = document.querySelector('[role="dialog"]');
    return { active: a ? `${a.tagName}:${(a.getAttribute('aria-label') || a.getAttribute('placeholder') || a.textContent || '').trim().slice(0, 30)}` : null,
      inDialog: !!(d && a && (d === a || d.contains(a))), dialog: !!d, alert: [...document.querySelectorAll('[role="alert"]')].map((x) => x.textContent.trim()) };
  })) });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await sleep(1500);
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.55));
  await page.getByRole('button', { name: 'FREE DOWNLOAD' }).waitFor({ timeout: 15000 }); await sleep(600);
  await page.keyboard.press('Tab'); await sleep(200); await page.keyboard.press('Enter'); await sleep(500); await snap('email-step');
  await page.keyboard.type('a205@example.com'); await page.keyboard.press('Enter'); await sleep(300); await snap('submitting');
  await sleep(1200); await snap('after-error');
  await page.keyboard.press('Tab'); await sleep(250); await snap('tab');
  await page.keyboard.press('Shift+Tab'); await sleep(250); await snap('shift-tab');
  await page.keyboard.press('Escape'); await sleep(500); await snap('escape');
  fs.writeFileSync(path.join(__dirname, '..', 'out', `lm-submit-error-${tag}.json`), JSON.stringify(out, null, 1));
  for (const s of out.steps) console.log(s.label, '|', s.active, s.inDialog, s.dialog, JSON.stringify(s.alert));
  await browser.close();
})();
