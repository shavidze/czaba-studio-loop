// B round 163 planning probe: reproduce SABA-B-1 (envelope visibility) and SABA-B-2 (overview corners) at HEAD 0e4287f. node saba-probe.cjs <out.json>
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const env = () => {
  const c = document.querySelector('[data-clip-kind=audio]'); if (!c) return null;
  const cs = (e) => e ? getComputedStyle(e) : null;
  const line = c.querySelector('[data-testid=arrangement-clip-envelope-line]');
  const pl = line && line.querySelector('polyline');
  const pt = c.querySelector('[data-testid=arrangement-clip-envelope-point]');
  const wf = c.querySelector('[data-testid=arrangement-clip-waveform]');
  const body = wf ? wf.parentElement : null;
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [+b.x.toFixed(2), +b.y.toFixed(2), +b.width.toFixed(2), +b.height.toFixed(2)]; };
  return { clipBg: cs(c).backgroundColor, clipClass: c.className, bodyColor: body && cs(body).color, waveformFill: wf && cs(wf.querySelector('path')).fill,
    lineStroke: pl && cs(pl).stroke, lineStrokeWidth: pl && cs(pl).strokeWidth, lineOpacity: line && cs(line).opacity,
    pointBg: pt && cs(pt).backgroundColor, pointBorder: pt && cs(pt).borderTopColor, pointBox: r(pt), points: c.querySelectorAll('[data-testid=arrangement-clip-envelope-point]').length,
    lineBox: r(line), clipBox: r(c), muted: !!c.closest('[data-track-id]')?.querySelector('button[aria-pressed=true][aria-label^="Mute"]') };
};
const ov = () => {
  const o = document.querySelector('[data-testid=arrangement-overview]'); if (!o) return null;
  const chain = []; let e = o; for (let i = 0; i < 4 && e; i++, e = e.parentElement) { const s = getComputedStyle(e); const b = e.getBoundingClientRect(); chain.push({ tag: e.tagName, tid: e.dataset.testid || null, cls: (e.className && e.className.baseVal === undefined ? e.className : '').slice(0, 160), box: [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(2)), radius: s.borderRadius, border: `${s.borderTopWidth} ${s.borderTopColor}`, overflow: s.overflow, bg: s.backgroundColor, padding: s.padding }); }
  const kids = [...o.children].map((k) => { const s = getComputedStyle(k); const b = k.getBoundingClientRect(); return { tid: k.dataset.testid || null, cls: k.className.slice(0, 160), box: [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(2)), radius: s.borderRadius, border: `${s.borderTopWidth} ${s.borderTopColor} / bottom ${s.borderBottomWidth} ${s.borderBottomColor}`, bg: s.backgroundColor, left: k.style.left, width: k.style.width }; });
  return { chain, kids };
};
(async () => {
  const b = await L.launch(); const res = {};
  for (const W of [1440, 1280]) {
    res[W] = {}; const net = [];
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b163-${W}`, net);
    await p.mouse.move(2, 2); await sleep(300);
    // overview, empty project
    res[W].overviewEmpty = await p.evaluate(ov);
    const o = await p.locator('[data-testid=arrangement-overview]').boundingBox();
    await p.screenshot({ path: out.replace('.json', `-${W}-overview-empty.png`), clip: { x: o.x - 12, y: o.y - 24, width: Math.min(420, o.width + 24), height: o.height + 40 } });
    await p.screenshot({ path: out.replace('.json', `-${W}-overview-empty-right.png`), clip: { x: o.x + o.width - 200, y: o.y - 8, width: 212, height: o.height + 16 } });
    await L.setSnapOff(p);
    await X.L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
    res[W].overviewClip = await p.evaluate(ov);
    await p.screenshot({ path: out.replace('.json', `-${W}-overview-clip.png`), clip: { x: o.x - 12, y: o.y - 24, width: Math.min(420, o.width + 24), height: o.height + 40 } });
    const cid = await p.evaluate(() => document.querySelector('[data-clip-kind=audio]').dataset.clipId);
    await p.click('[data-testid=arrangement-envelope-toggle]'); await sleep(300); await L.blur(p);
    const cb = await X.clipBox(p, cid);
    await p.mouse.dblclick(cb.x + Math.min(160, cb.width * 0.4), cb.y + cb.height * 0.6); await sleep(500);
    res[W].status = await L.status(p);
    await L.selectClip(p, cid); await p.mouse.move(2, 2); await sleep(300);
    res[W].selected = await p.evaluate(env);
    const shotClip = async (name) => { const c = await X.clipBox(p, cid); await p.screenshot({ path: out.replace('.json', `-${W}-${name}.png`), clip: { x: c.x, y: c.y - 4, width: Math.min(360, c.width), height: c.height + 8 } }); };
    await shotClip('env-selected');
    // unselected: click empty lane area far right in another lane
    await p.keyboard.press('Escape'); await sleep(300);
    await p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-status]'); s && s.scrollIntoView({ block: 'nearest' }); });
    res[W].afterEscape = await p.evaluate(env);
    await shotClip('env-after-esc');
    // hover the point
    const pt = await p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-point]`).first().boundingBox();
    if (pt) { await p.mouse.move(pt.x + pt.width / 2, pt.y + pt.height / 2); await sleep(300); res[W].hover = await p.evaluate(env); await shotClip('env-hover'); await p.mouse.move(2, 2); }
    // muted lane
    await X.muteLanes(p, ['music']); await sleep(300);
    res[W].muted = await p.evaluate(env); await shotClip('env-muted');
    res[W].net = X.netOk ? X.netOk(net) : null;
    await ctx.close();
    console.log(W, JSON.stringify(res[W].selected), '\n', JSON.stringify(res[W].muted), '\n', JSON.stringify(res[W].overviewEmpty, null, 0).slice(0, 1500));
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1));
})();
