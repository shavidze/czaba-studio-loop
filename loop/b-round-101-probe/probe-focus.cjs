// B round 101 read-only probe: export dialog focus guard (A-R88 #1/#3) and progress label AX (GATE101-S1). No source change; runtime DOM attribute edits only in the AX candidate runs.
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const DIR = __dirname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  const downloads = [];
  p.on('download', (d) => downloads.push(d.suggestedFilename()));
  await p.goto('http://127.0.0.1:5173/studio-lab');
  await sleep(1500);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  const o = p.locator('[role=option][data-source-id="demo-middle-east"]');
  await o.waitFor({ timeout: 90000 });
  await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 90000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  await o.focus(); await p.keyboard.press('Enter'); await sleep(500);
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
  await p.getByRole('button', { name: 'Export', exact: true }).click();
  await p.waitForSelector('#arrangement-export-title'); await sleep(600);
  return { ctx, p, errors, downloads };
}

const meas = () => {
  const f = document.querySelector('[data-testid=arrangement-export-footer]');
  let pnl = f.parentElement; while (pnl && getComputedStyle(pnl).overflowY !== 'auto') pnl = pnl.parentElement;
  const a = document.activeElement;
  const fr = f.getBoundingClientRect();
  const ar = a ? a.getBoundingClientRect() : null;
  const card = a && a.closest ? a.closest('label') : null;
  const cr = card ? card.getBoundingClientRect() : null;
  return {
    active: a ? (a.dataset.testid || a.getAttribute('aria-label') || a.textContent.trim().slice(0, 20) || a.tagName) : null,
    inFooter: !!(a && f.contains(a)),
    scrollTop: pnl.scrollTop, maxScroll: pnl.scrollHeight - pnl.clientHeight,
    footerTop: +fr.top.toFixed(1), footerH: +fr.height.toFixed(1),
    targetBottom: ar ? +ar.bottom.toFixed(1) : null,
    cardBottom: cr ? +cr.bottom.toFixed(1) : null,
    cardUnderFooterPx: cr ? +(cr.bottom - fr.top).toFixed(1) : null,
    targetUnderFooterPx: ar ? +(ar.bottom - fr.top).toFixed(1) : null,
    label: document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null,
    status: f.querySelector('[role=status],[role=alert]')?.textContent?.slice(0, 60) ?? null,
  };
};

async function tabCycle(p, n) {
  const out = [await p.evaluate(meas)];
  for (let i = 0; i < n; i++) { await p.keyboard.press('Tab'); await sleep(120); out.push(await p.evaluate(meas)); }
  return out;
}
async function waitDone(p, timeout = 240000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const s = await p.evaluate(() => document.querySelector('[data-testid=arrangement-export-footer] [role=status],[data-testid=arrangement-export-footer] [role=alert]')?.textContent ?? '');
    const busy = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-export-cancel]'));
    if (!busy && s && !/^რენდერი და|იტვირთება/.test(s)) return s;
    await sleep(50);
  }
  return null;
}
async function clickExport(p) {
  const b = await p.evaluate(() => { const x = [...document.querySelectorAll('[data-testid=arrangement-export-footer] button')].find((y) => /ექსპორტი$/.test(y.textContent.trim())); const r = x.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await p.mouse.click(b.x, b.y);
}
const axCount = async (p) => {
  const snap = await p.locator('[role=dialog]').ariaSnapshot();
  const l = await p.evaluate(() => document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null);
  if (!l) return null;
  const pct = /(\d+%)$/.exec(l); const key = l.split(' · ')[0];
  const lines = snap.split('\n').filter((x) => x.includes(key) && (!pct || x.includes(pct[1])));
  return { label: l, matchingLines: lines, count: lines.length, progressLines: snap.split('\n').filter((x) => /progressbar/.test(x)) };
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const res = {};
  for (const vp of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
    const key = `${vp.width}x${vp.height}`; const R = {};
    // A + B: idle Tab cycle, then WAV done, Tab cycle in done state
    {
      const { ctx, p, errors, downloads } = await open(browser, vp);
      R.idleCycle = await tabCycle(p, 6);
      await clickExport(p);
      R.doneStatus = await waitDone(p);
      await sleep(500);
      R.afterDoneFocus = await p.evaluate(meas);
      R.doneCycle = await tabCycle(p, 7);
      await p.screenshot({ path: `${DIR}/done-cycle-end-${key}.png` });
      R.downloadsA = downloads.slice(); R.errorsA = errors;
      await ctx.close();
    }
    // C (#3) + D (AX baseline): start export, Tab to a body control during render, sample until done
    {
      const { ctx, p, errors, downloads } = await open(browser, vp);
      await p.evaluate(() => { window.__fs = []; const f = document.querySelector('[data-testid=arrangement-export-footer]'); new ResizeObserver(() => window.__fs.push(Math.round(f.getBoundingClientRect().height))).observe(f); });
      await clickExport(p);
      await sleep(30);
      R.renderStartFocus = await p.evaluate(meas);
      const tabs = [];
      for (let i = 0; i < 4; i++) { await p.keyboard.press('Tab'); await sleep(40); const m = await p.evaluate(meas); tabs.push(m); if (/format/.test(m.active || '') || /scope/.test(m.active || '')) break; }
      R.renderTabs = tabs;
      R.axBaseline = await axCount(p);
      const samples = [];
      const t0 = Date.now();
      while (Date.now() - t0 < 240000) { const m = await p.evaluate(meas); const l = samples.at(-1); if (!l || l.footerH !== m.footerH || l.scrollTop !== m.scrollTop || l.active !== m.active) samples.push({ ms: Date.now() - t0, ...m }); const busy = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-export-cancel]')); if (!busy && m.status && !/^რენდერი და|იტვირთება/.test(m.status)) break; await sleep(20); }
      await sleep(600); samples.push({ final: true, ...(await p.evaluate(meas)) });
      R.renderSamples = samples; R.footerHeights = await p.evaluate(() => window.__fs);
      await p.screenshot({ path: `${DIR}/after-done-focused-body-${key}.png` });
      R.downloadsC = downloads.slice(); R.errorsC = errors;
      await ctx.close();
    }
    // D candidates (1280 only): aria-hidden on the <p>; aria-labelledby on the bar
    if (vp.width === 1280) {
      for (const cand of ['aria-hidden-p', 'labelledby']) {
        const { ctx, p } = await open(browser, vp);
        await p.evaluate((cand) => { new MutationObserver(() => { const l = document.querySelector('[data-testid=arrangement-export-progress-label]'); const b = document.querySelector('[data-testid=arrangement-export-progress]'); if (!l || !b) return; if (cand === 'aria-hidden-p') { if (l.getAttribute('aria-hidden') !== 'true') l.setAttribute('aria-hidden', 'true'); } else { if (!l.id) l.id = 'probe-progress-label'; if (b.hasAttribute('aria-label')) { b.removeAttribute('aria-label'); b.setAttribute('aria-labelledby', l.id); } } }).observe(document.body, { subtree: true, childList: true }); }, cand);
        await clickExport(p);
        let ax = null; const t0 = Date.now();
        while (!ax && Date.now() - t0 < 20000) { await sleep(30); try { ax = await axCount(p); } catch (e) { ax = null; } }
        R[`ax_${cand}`] = ax;
        await waitDone(p);
        await ctx.close();
      }
    }
    res[key] = R;
  }
  fs.writeFileSync(`${DIR}/probe-focus-result.json`, JSON.stringify(res, null, 1));
  await browser.close();
  console.log('done');
})().catch((e) => { console.error(e); process.exit(1); });
