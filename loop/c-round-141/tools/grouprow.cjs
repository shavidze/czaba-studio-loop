const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
(async () => {
  const b = await L.launch(); const out = {}; const net = [];
  for (const w of [1440, 1280]) {
    const { ctx, page: p } = await L.openStudio(b, X.VPS[w], `grow-${w}`, net);
    await L.setSnapOff(p);
    await p.click(L.nameSel('music')); await sleep(250); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(300);
    await L.blur(p); await p.keyboard.press('Control+g'); await sleep(500);
    out[w] = await p.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [+b.x.toFixed(1), +b.y.toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; }; return { label: document.querySelector('[data-testid=arrangement-group-name]').getAttribute('aria-label'), row: r('[data-testid=arrangement-group-row]'), fold: r('[data-testid=arrangement-group-fold]'), name: r('[data-testid=arrangement-group-name]'), mute: r('[data-testid=arrangement-group-mute]'), solo: r('[data-testid=arrangement-group-solo]'), volume: r('[data-testid=arrangement-group-volume]'), music: r('[data-track-id="music"] [data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]'), stems: r('[data-track-id="stems"] [data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]') }; });
    await p.screenshot({ path: path.join(L.SHOTS, `group-row-${w}.png`) });
    await ctx.close();
  }
  const exp = { rowH: 28, fold: [296, 24, 24], name: [322, 24], mute: [403, 24, 24], solo: [429, 24, 24], nameW: 79, fader: [455, 48, 4] };
  const v = {};
  for (const w of [1440, 1280]) { const o = out[w]; const d = (a, b) => Math.abs(a - b) <= 1;
    v[w] = { rowH: d(o.row[3], 28), fold: d(o.fold[0], 296) && d(o.fold[2], 24) && d(o.fold[3], 24), name: d(o.name[0], 322) && d(o.name[3], 24) && d(o.name[2], 79), mute: d(o.mute[0], 403) && d(o.mute[2], 24) && d(o.mute[3], 24), solo: d(o.solo[0], 429) && d(o.solo[2], 24) && d(o.solo[3], 24), fader: d(o.volume[0], 455) && d(o.volume[2], 48) && d(o.volume[3], 4) }; }
  const r140 = JSON.parse(fs.readFileSync(path.join(L.ROOT, '..', 'c-round-140', 'out', 'c140-1440-r1-group.json'), 'utf8')).checks.groupRowBoxes || null;
  fs.writeFileSync(path.join(L.OUT, 'group-row-boxes.json'), JSON.stringify({ out, exp, verdict: v, r140reg: r140, net: X.netOk(net) }, null, 1));
  console.log(JSON.stringify({ out, v, net: X.netOk(net) }));
  await b.close();
})();
