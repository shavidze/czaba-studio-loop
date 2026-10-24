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
    await L.seekTo(p, 5); await L.blur(p); res.ph5 = await L.posNow(p); res.selAt5 = (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.lane + '@' + c.start);
    { const before = await snap(p); await altgr(cdp, '€', 'KeyE', 69); const after = await snap(p); res.rows.push({ focus: 'timeline, playhead 5 inside selected SFX clip', key: '€', code: 'KeyE', before, after, arrangementChanged: before.clips !== after.clips }); }
    { const s0 = await snap(p); await p.keyboard.press('Control+z'); await sleep(350); res.undoSplit = { s0, s1: await snap(p) }; }
    await p.click(L.nameSel('sfx')); await sleep(200); await L.seekTo(p, 10); await L.blur(p);
    { const before = await snap(p); await altgr(cdp, '@', 'KeyV', 86); const after = await snap(p); res.rows.push({ focus: 'timeline, playhead 10, SFX lane active, clipboard = Soft impact', key: '@', code: 'KeyV', before, after, arrangementChanged: before.clips !== after.clips }); }
    { const s0 = await snap(p); await p.keyboard.press('Control+z'); await sleep(350); res.undoPaste = { s0, s1: await snap(p) }; }
    res.received = await p.evaluate(() => (window.__kd || []).length);
      } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(OUTD, `d3b-altgr2-${RUNID}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ err: res.error, sel: res.selectedPlayhead, tl: res.timelinePlayhead, rows: res.rows.map((r) => `${r.focus} ${r.key}: changed=${r.arrangementChanged} ${r.err || ''} | ${r.after && r.after.status.slice(0, 70)} | ${r.after && r.after.active}`), ph5: res.ph5, sel5: res.selAt5, undoSplit: res.undoSplit, undoPaste: res.undoPaste, net: res.net }, null, 1));
  await b.close();
})();
