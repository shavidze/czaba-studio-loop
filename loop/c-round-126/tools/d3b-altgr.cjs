// C round 126 — D3-B AltGr probe (C-R125-OBS-CTRL-ALT-PASTE-SPLIT). Trusted CDP key events with layout-faithful key/code.
// AltGr on Windows = Ctrl+Alt; key = produced char. E -> '€' (DE/PL/HU...), V -> '@' (HU). 1440x900.
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const RUNID = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
const net = []; const OUTD = path.join(L.ROOT, 'out', 'd3b'); fs.mkdirSync(OUTD, { recursive: true });
const snap = (p) => p.evaluate(() => ({
  clips: [...document.querySelectorAll('[data-clip-id]')].map((e) => `${e.closest('[data-track-id]').dataset.trackId}@${e.dataset.clipStart}`).sort().join(' '),
  status: ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim(),
  undo: ([...document.querySelectorAll('button')].find((b) => /Undo/.test(b.textContent)) || {}).textContent || null,
  active: document.activeElement ? `${document.activeElement.tagName}[${document.activeElement.getAttribute('data-testid') || document.activeElement.getAttribute('aria-label') || document.activeElement.type || ''}] value=${'value' in document.activeElement ? document.activeElement.value : ''}` : null,
}));
async function altgr(cdp, key, code, vk) {
  const base = { modifiers: 3, key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, text: key, unmodifiedText: key });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  await sleep(400);
}
(async () => {
  const b = await L.launch(); const res = { runId: RUNID, method: 'CDP Input.dispatchKeyEvent (trusted), modifiers=Ctrl|Alt, key=produced char, code=KeyE/KeyV', rows: [] };
  try {
    const { page: p, ctx } = await L.openStudio(b, X.VPS[1440], `d3b-${RUNID}`, net);
    const cdp = await ctx.newCDPSession(p);
    await L.setSnapOff(p);
    await L.addAt(p, 'demo-hero-music', 'music', 0);
    await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
    const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id;
    await L.selectClip(p, sfx); await L.blur(p);
    res.selectedPlayhead = await L.posNow(p);
    await p.keyboard.press('Control+c'); await sleep(300);
    res.afterCopy = await snap(p);
    // listener records what the page actually received
    await p.evaluate(() => { window.__kd = []; window.addEventListener('keydown', (e) => window.__kd.push({ key: e.key, code: e.code, ctrl: e.ctrlKey, alt: e.altKey, trusted: e.isTrusted, prevented: null, t: e.target.tagName }), true); });
    const fields = [
      { name: 'library search', sel: 'input[type=search], [data-testid=arrangement-library] input' },
      { name: 'BPM field', sel: '[data-testid=arrangement-tempo-input]' },
      { name: 'Clip Gain field', sel: '[data-testid=arrangement-detail-clip-gain-input]' },
    ];
    for (const f of fields) {
      for (const [k, c, vk] of [['€', 'KeyE', 69], ['@', 'KeyV', 86]]) {
        const loc = p.locator(f.sel).first();
        if (!(await loc.count())) { res.rows.push({ focus: f.name, key: k, err: 'field not found' }); continue; }
        await loc.click(); await sleep(200);
        const before = await snap(p); await altgr(cdp, k, c, vk); const after = await snap(p);
        res.rows.push({ focus: f.name, key: k, code: c, before, after, arrangementChanged: before.clips !== after.clips || before.undo !== after.undo });
        await p.keyboard.press('Escape'); await sleep(150);
        await loc.fill('').catch(() => {});
        await L.blur(p);
      }
    }
    // marker name editor (M opens it)
    await L.blur(p); await p.keyboard.press('m'); await sleep(400);
    for (const [k, c, vk] of [['€', 'KeyE', 69], ['@', 'KeyV', 86]]) {
      const before = await snap(p); await altgr(cdp, k, c, vk); const after = await snap(p);
      res.rows.push({ focus: 'marker name editor (after M)', key: k, code: c, before, after, arrangementChanged: before.clips !== after.clips });
    }
    await p.keyboard.press('Escape'); await sleep(200); await L.blur(p);
    // timeline focus: reselect sfx (playhead inside), then AltGr+E, AltGr+V
    await L.selectClip(p, sfx).catch(() => {}); await L.blur(p);
    res.timelinePlayhead = await L.posNow(p);
    for (const [k, c, vk] of [['€', 'KeyE', 69], ['@', 'KeyV', 86]]) {
      const before = await snap(p); await altgr(cdp, k, c, vk); const after = await snap(p);
      res.rows.push({ focus: 'timeline (body, SFX clip selected, playhead inside)', key: k, code: c, before, after, arrangementChanged: before.clips !== after.clips });
    }
    // one-step Undo check
    const u0 = await snap(p); await p.keyboard.press('Control+z'); await sleep(350); const u1 = await snap(p); await p.keyboard.press('Control+z'); await sleep(350); const u2 = await snap(p);
    res.undo = { u0, u1, u2 };
    res.received = await p.evaluate(() => window.__kd.filter((e) => e.ctrl && e.alt));
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(OUTD, `d3b-altgr-${RUNID}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ err: res.error, sel: res.selectedPlayhead, tl: res.timelinePlayhead, rows: res.rows.map((r) => `${r.focus} ${r.key}: changed=${r.arrangementChanged} ${r.err || ''} | ${r.after && r.after.status.slice(0, 70)} | ${r.after && r.after.active}`), undo: res.undo && [res.undo.u0.clips, res.undo.u1.clips, res.undo.u2.clips, res.undo.u1.status], recv: res.received && res.received.slice(0, 12), net: res.net }, null, 1));
  await b.close();
})();
