// B round 164 planning probe: real mouse clip-header move held; Tab to a marker flag; F2; type; Enter; move; release. HEAD 7952439.
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const flags = (p) => p.evaluate(() => [...document.querySelectorAll('[data-marker-label]')].map((s) => s.textContent));
const inputOpen = (p) => p.evaluate(() => !!document.querySelector('[data-testid=arrangement-marker-name-input]'));
const active = (p) => p.evaluate(() => { const a = document.activeElement; return a ? (a.dataset.testid || a.getAttribute('aria-label') || a.tagName).slice(0, 80) : null; });
const hdr = (cid) => `[data-clip-id="${cid}"] [title^="Move"], [data-clip-id="${cid}"] > div:first-child`;
(async () => {
  const b = await L.launch(); const res = {};
  for (const W of [1440, 1280]) {
    const net = []; const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b164tab-${W}`, net);
    await L.setSnapOff(p);
    await L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
    const cid = await p.evaluate(() => document.querySelector('[data-clip-kind=audio]').dataset.clipId);
    await L.seekTo(p, 5); await p.click('[data-testid=arrangement-marker-add]'); await sleep(200); await p.keyboard.press('Control+A'); await p.keyboard.type('Intro'); await p.keyboard.press('Enter'); await sleep(300); await L.blur(p);
    const r = { flags0: await flags(p), undo0: await X.undoTitle(p) };
    const h = await p.evaluate((cid) => { const c = document.querySelector(`[data-clip-id="${cid}"]`); const e = [...c.querySelectorAll('div[title]')].find((d) => /Move|Drag/i.test(d.title)) || c.firstElementChild; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, title: e.title.slice(0, 60) }; }, cid);
    r.header = h;
    const cb0 = await X.clipBox(p, cid);
    const sx = h.x + 80, sy = h.y + h.h / 2;
    await p.mouse.move(sx, sy); await p.mouse.down(); await p.mouse.move(sx + 40, sy, { steps: 5 }); await sleep(200);
    r.during0 = { active: await active(p), status: await L.status(p) };
    // focus the flag by keyboard while the button is held
    r.tabs = 0; for (let i = 0; i < 120; i++) { await p.keyboard.press('Tab'); r.tabs++; const a = await p.evaluate(() => document.activeElement && document.activeElement.dataset.testid); if (a === 'arrangement-marker') break; }
    r.focusVia = 'real Tab presses while the mouse button is held';
    r.duringFocus = await active(p);
    await p.keyboard.press('F2'); await sleep(250);
    r.afterF2 = { inputOpen: await inputOpen(p), active: await active(p), status: await L.status(p) };
    if (r.afterF2.inputOpen) { await p.keyboard.press('Control+A'); await p.keyboard.type('Lost?'); }
    await p.keyboard.press('Enter'); await sleep(250);
    r.afterEnter = { inputOpen: await inputOpen(p), status: await L.status(p), flags: await flags(p), undo: await X.undoTitle(p) };
    await p.mouse.move(sx + 100, sy, { steps: 6 }); await sleep(150);
    r.afterMove = { flags: await flags(p) };
    await p.mouse.up(); await sleep(500);
    const cb1 = await X.clipBox(p, cid);
    r.afterRelease = { status: await L.status(p), flags: await flags(p), undo: await X.undoTitle(p), clipDx: +(cb1.x - cb0.x).toFixed(1) };
    await p.keyboard.press('Control+z'); await sleep(300);
    r.afterUndo1 = { flags: await flags(p), undo: await X.undoTitle(p), status: await L.status(p) };
    await p.keyboard.press('Control+z'); await sleep(300);
    r.afterUndo2 = { flags: await flags(p), undo: await X.undoTitle(p), status: await L.status(p) };
    await p.screenshot({ path: out.replace('.json', `-${W}.png`) });
    res[W] = r; console.log(W, JSON.stringify(r, null, 0));
    res[`${W}-net`] = X.netOk ? X.netOk(net) : net;
    await ctx.close();
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1));
})();
