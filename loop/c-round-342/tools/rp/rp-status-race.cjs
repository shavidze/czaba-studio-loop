const L = require('./lib.cjs'); const fs = require('fs'); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => { const b = await L.chromium.launch(); const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) { const k = `${w}x${h}`; out[k] = {};
  for (const scen of ['same-text-key-in-drag', 'collection-add-in-drag']) {
    const o = await L.openStudio(b, { width: w, height: h }, 'race-' + k, [], {}); const p = o.page;
    await p.locator('[role=option][data-source-id]').first().focus(); await p.keyboard.press('Enter'); await sleep(900);
    const bb0 = await p.locator('[data-clip-id]').first().boundingBox(); await p.mouse.click(bb0.x + bb0.width / 2, bb0.y + 8); await sleep(400);
    await p.evaluate(() => { const el = document.querySelector('[data-testid=arrangement-status]'); window.__log = []; const rec = (why) => window.__log.push({ t: +performance.now().toFixed(1), why, text: el.textContent.trim().slice(0, 90), live: el.getAttribute('aria-live') }); new MutationObserver((m) => m.forEach((x) => rec(x.type + ':' + (x.addedNodes.length) + '/' + x.removedNodes.length))).observe(el, { childList: true, characterData: true, subtree: true }); const par = el.parentElement; new MutationObserver((m) => m.forEach((x) => { if (x.target !== el && !el.contains(x.target)) rec('parent:' + x.addedNodes.length + '/' + x.removedNodes.length); })).observe(par, { childList: true }); });
    const hd = await p.locator('[data-testid="arrangement-clip-fade-in-handle"]').first().boundingBox();
    await p.mouse.move(hd.x + 5, hd.y + 5); await p.mouse.down();
    for (let i = 0; i < 6; i++) { await p.mouse.move(hd.x + 5 + i * 8, hd.y + 5, { steps: 1 }); await sleep(30); }
    if (scen === 'same-text-key-in-drag') { await p.keyboard.press('g'); await p.mouse.move(hd.x + 60, hd.y + 5); await p.keyboard.press('g'); await p.mouse.move(hd.x + 66, hd.y + 5); }
    else { await p.locator('[role=option][data-source-id]').nth(1).evaluate((e) => e.focus()); await p.keyboard.press('Enter'); await p.mouse.move(hd.x + 60, hd.y + 5); await sleep(200); await p.mouse.move(hd.x + 70, hd.y + 5); }
    await sleep(300); const midStatus = await L.status(p); await p.mouse.up(); await sleep(900);
    const log = await p.evaluate(() => window.__log); const end = await L.status(p);
    let dupRemount = 0; for (let i = 1; i < log.length; i++) if (log[i].text === log[i - 1].text && /1\/1|childList/.test(log[i].why) && log[i].why.startsWith('childList')) dupRemount++;
    out[k][scen] = { midStatus, end, mutations: log.length, dupRemount, distinctTexts: [...new Set(log.map((x) => x.text))], log: log.slice(0, 60) };
    console.log(k, scen, 'mut', log.length, 'dup', dupRemount, 'texts', out[k][scen].distinctTexts.length, '| mid:', midStatus.slice(0, 70), '| end:', end.slice(0, 70));
    await o.ctx.close(); } }
fs.writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-342/out/rp-status-race.json', JSON.stringify(out, null, 1)); await b.close(); })();
