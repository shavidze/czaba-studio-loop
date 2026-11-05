// B round 314->315 probe: delay the peaks worker's first reply in the page and record whether the worker survives.
// Usage: node cold-start.cjs <baseURL> <delayMs> <out.json> [viewport WxH]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const [base, delayArg, out, vp = '1440x900'] = process.argv.slice(2);
const delayMs = Number(delayArg);
const [w, h] = vp.split('x').map(Number);
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  await context.addInitScript((delay) => {
    const log = [];
    window.__b315Workers = log;
    const Native = window.Worker;
    window.Worker = class extends Native {
      constructor(url, options) {
        super(url, options);
        const entry = { url: String(url), created: Math.round(performance.now()), firstReply: null, terminated: null, replies: 0 };
        log.push(entry);
        const isPeaks = entry.url.includes('peaks');
        let held = isPeaks;
        const queue = [];
        let handler = null;
        const release = () => { held = false; for (const e of queue.splice(0)) handler && handler.call(this, e); };
        if (isPeaks) setTimeout(release, delay);
        super.onmessage = (event) => {
          entry.replies += 1;
          if (entry.firstReply === null) entry.firstReply = Math.round(performance.now());
          if (held) queue.push(event); else if (handler) handler.call(this, event);
        };
        Object.defineProperty(this, 'onmessage', { get: () => handler, set: (fn) => { handler = fn; }, configurable: true });
        const terminate = this.terminate.bind(this);
        this.terminate = () => { if (entry.terminated === null) entry.terminated = Math.round(performance.now()); terminate(); };
      }
    };
  }, delayMs);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /ready|loaded|failed/i }).waitFor({ timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(delayMs + 4000);
  const result = await page.evaluate(() => ({
    workers: window.__b315Workers,
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null,
    previewWave: document.querySelectorAll('[data-testid="arrangement-library-preview-wave"] rect').length,
  }));
  result.delayMs = delayMs; result.viewport = vp; result.pageErrors = errors;
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(JSON.stringify(result));
  await browser.close();
})();
