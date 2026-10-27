// B round 204->205 planning: LeadMagnet popup focus probe. usage: node lmprobe.cjs <port> <W> <H> <tag>  (copied by A round 205; output -> a-round-205/out)
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs'); const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [port, W, H, tag] = [process.argv[2], +process.argv[3], +process.argv[4], process.argv[5] || 'x'];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  const out = { port, W, H, steps: [] };
  const snap = async (label) => out.steps.push({ label, ...(await page.evaluate(() => {
    const a = document.activeElement; const d = document.querySelector('[role="dialog"]');
    const fd = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'FREE DOWNLOAD');
    return { active: a ? `${a.tagName}:${(a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 40)}` : null,
      activeInDialog: !!(fd && a && fd.closest('.fixed') && fd.closest('.fixed').contains(a)),
      dialog: d ? { name: d.getAttribute('aria-labelledby'), modal: d.getAttribute('aria-modal') } : null,
      popup: !!fd, scrollY: window.scrollY, bodyPos: document.body.style.position, bodyTop: document.body.style.top,
      fv: a ? a.matches(':focus-visible') : null, outline: a ? getComputedStyle(a).outlineStyle + ' ' + getComputedStyle(a).outlineWidth : null };
  })) });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await sleep(1500);
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.55));
  await sleep(1500);
  await page.evaluate(() => { const els=[...document.querySelectorAll('a[href],button')].filter((e)=>{const r=e.getBoundingClientRect();return r.top>100&&r.bottom<innerHeight-50&&r.width>0;}); if (els[0]) els[0].focus(); }); await sleep(400);
  await snap('before-open');
  for (let i = 0; i < 40; i++) { const p = await page.evaluate(() => !![...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'FREE DOWNLOAD')); if (p) break; await sleep(250); }
  await sleep(600); await snap('open');
  for (let i = 1; i <= 4; i++) { await page.keyboard.press('Tab'); await sleep(200); await snap('tab' + i); }
  await page.keyboard.press('Shift+Tab'); await sleep(200); await snap('shift-tab');
  await page.click('button[aria-label="Close"]'); await sleep(300); await snap('close+300'); await sleep(1500); await snap('close+1800');
  await page.screenshot({ path: path.join(__dirname, '..', 'out', `lm-${tag}-${W}.png`) });
  fs.writeFileSync(path.join(__dirname, '..', 'out', `lm-${tag}-${W}.json`), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out.steps.map((s) => [s.label, s.active, s.activeInDialog, s.popup, s.scrollY, s.bodyPos, s.dialog && s.dialog.modal])));
  await browser.close();
})();
