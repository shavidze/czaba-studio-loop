// B round 101 read-only probe: Chromium AX tree of the export progress region (GATE101-S1); candidates applied as runtime DOM attribute edits only.
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function open(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, acceptDownloads: true });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab'); await sleep(1500);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  const o = p.locator('[role=option][data-source-id="demo-middle-east"]'); await o.waitFor({ timeout: 90000 }); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 90000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  await o.focus(); await p.keyboard.press('Enter'); await sleep(500);
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
  await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title'); await sleep(600);
  return { ctx, p };
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  const out = {};
  for (const cand of ['baseline', 'aria-hidden-p', 'labelledby']) {
    const { ctx, p } = await open(browser);
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Accessibility.enable');
    await p.evaluate((cand) => {
      window.__freeze = false;
      new MutationObserver(() => { const l = document.querySelector('[data-testid=arrangement-export-progress-label]'); const b = document.querySelector('[data-testid=arrangement-export-progress]'); if (!l || !b) return;
        if (cand === 'aria-hidden-p' && l.getAttribute('aria-hidden') !== 'true') l.setAttribute('aria-hidden', 'true');
        if (cand === 'labelledby') { if (!l.id) l.id = 'probe-progress-label'; if (b.hasAttribute('aria-label')) { b.removeAttribute('aria-label'); b.setAttribute('aria-labelledby', l.id); } } }).observe(document.body, { subtree: true, childList: true });
    }, cand);
    const b = await p.evaluate(() => { const x = [...document.querySelectorAll('[data-testid=arrangement-export-footer] button')].find((y) => /ექსპორტი$/.test(y.textContent.trim())); const r = x.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await p.mouse.click(b.x, b.y);
    let got = null; const t0 = Date.now();
    while (!got && Date.now() - t0 < 20000) {
      await sleep(20);
      const has = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-export-progress]'));
      if (!has) continue;
      const { nodes } = await cdp.send('Accessibility.getFullAXTree');
      const label = await p.evaluate(() => document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null);
      const re = /(რენდერი|WAV-ის ჩაწერა) · \d+%/;
      const hits = nodes.filter((n) => !n.ignored && ((n.name && re.test(String(n.name.value))) || (n.value && re.test(String(n.value.value))) || (n.properties || []).some((q) => q.name === 'valuetext' && re.test(String(q.value.value)))))
        .map((n) => ({ role: n.role?.value, name: n.name?.value, value: n.value?.value, valuetext: (n.properties || []).find((q) => q.name === 'valuetext')?.value?.value ?? null }));
      const bar = nodes.filter((n) => n.role?.value === 'progressbar').map((n) => ({ ignored: n.ignored, name: n.name?.value, value: n.value?.value, props: (n.properties || []).map((q) => `${q.name}=${q.value?.value}`) }));
      got = { label, hits, bar };
    }
    out[cand] = got;
    const t1 = Date.now(); while (Date.now() - t1 < 60000 && (await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-export-cancel]')))) await sleep(100);
    await ctx.close();
  }
  fs.writeFileSync(__dirname + '/probe-ax-result.json', JSON.stringify(out, null, 1));
  await browser.close(); console.log(JSON.stringify(out, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
