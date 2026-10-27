// B round 206 -> 207 planning probe (SABA-B-6): map every computed cursor in the Studio workspace.
// usage: node cursormap.cjs <1440|1280>
const X = require('./lib122.cjs');
const { L, sleep } = X;
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const OUT = path.join(__dirname, '..', 'out');
const SH = path.join(__dirname, '..', 'shots');

const scan = (p, label) => p.evaluate((label) => {
  const step = 6;
  const found = {};
  const desc = (el) => {
    const parts = [];
    let e = el;
    for (let i = 0; e && i < 6; i += 1, e = e.parentElement) {
      const t = e.getAttribute && (e.getAttribute('data-testid') || e.getAttribute('aria-label'));
      if (t) { parts.push(t.slice(0, 50)); break; }
      parts.push(e.tagName.toLowerCase());
    }
    return parts.join('<');
  };
  for (let y = 0; y < innerHeight; y += step) {
    for (let x = 0; x < innerWidth; x += step) {
      const el = document.elementFromPoint(x, y);
      if (!el) continue;
      const c = getComputedStyle(el).cursor;
      if (c === 'auto' || c === 'default' || c === 'pointer') continue;
      const own = el.getAttribute('class') || '';
      const k = `${c} | ${desc(el)}`;
      if (!found[k]) found[k] = { cursor: c, el: desc(el), tag: el.tagName.toLowerCase(), cls: own.slice(0, 160), n: 0, at: [x, y] };
      found[k].n += 1;
    }
  }
  return { label, entries: Object.values(found).sort((a, b) => b.n - a.n) };
}, label);

(async () => {
  const b = await L.launch();
  const net = [];
  const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b206cur-${W}`, net, { noFontWait: true });
  const res = { W, states: [] };
  await p.mouse.move(2, 2);
  res.snap = await L.setSnapOff(p);
  res.add1 = await L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
  res.add2 = await L.addAt(p, 'demo-soft-impact', 'sfx', 10); await sleep(600);
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
  await p.mouse.move(2, 2); await sleep(300);
  res.states.push(await scan(p, 'a-clips+video, Env off'));
  await p.screenshot({ path: path.join(SH, `cur-${W}-a.png`) });
  const cid = await p.evaluate(() => document.querySelector('[data-track-id=music] [data-clip-kind=audio]').dataset.clipId);
  await p.click('[data-testid=arrangement-envelope-toggle]'); await sleep(300); await L.blur(p);
  let cb = await X.clipBox(p, cid);
  await p.mouse.dblclick(cb.x + 160, cb.y + cb.height * 0.6); await sleep(500);
  await p.mouse.move(2, 2); await sleep(300);
  res.states.push(await scan(p, 'b-Env on, one breakpoint'));
  await p.screenshot({ path: path.join(SH, `cur-${W}-b.png`) });
  const pt = await p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-point]`).first().boundingBox();
  const ed = await p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-editor]`).boundingBox();
  const cursorAt = (x, y) => p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? { c: getComputedStyle(e).cursor, t: e.getAttribute('data-testid'), body: getComputedStyle(document.body).cursor, html: getComputedStyle(document.documentElement).cursor } : null; }, [x, y]);
  res.hoverPoint = await (async () => { await p.mouse.move(pt.x + pt.width / 2, pt.y + pt.height / 2); await sleep(200); return cursorAt(pt.x + pt.width / 2, pt.y + pt.height / 2); })();
  await p.mouse.down(); await p.mouse.move(pt.x + pt.width / 2, pt.y + 20, { steps: 5 });
  res.dragPoint = await cursorAt(pt.x + pt.width / 2, pt.y + 20);
  await p.mouse.up(); await sleep(300);
  res.hoverEditor = await cursorAt(ed.x + ed.width * 0.8, ed.y + ed.height * 0.3);
  // floating video
  await L.blur(p);
  const exp = p.getByRole('button', { name: 'Expand video' });
  res.expandCount = await exp.count();
  if (res.expandCount) {
    await exp.first().click(); await sleep(800);
    await p.mouse.move(2, 2); await sleep(300);
    res.states.push(await scan(p, 'c-video floating, Env on'));
    await p.screenshot({ path: path.join(SH, `cur-${W}-c.png`) });
    const vb = await p.locator('[data-testid=arrangement-video-box]').boundingBox();
    res.videoFloating = await p.locator('[data-testid=arrangement-video-box]').getAttribute('data-video-floating');
    res.hoverVideo = await cursorAt(vb.x + vb.width / 2, vb.y + vb.height / 2);
    await p.mouse.move(vb.x + vb.width / 2, vb.y + vb.height / 2); await p.mouse.down(); await p.mouse.move(vb.x + vb.width / 2 - 30, vb.y + vb.height / 2 + 10, { steps: 5 });
    res.dragVideo = await cursorAt(vb.x + vb.width / 2 - 30, vb.y + vb.height / 2 + 10);
    await p.mouse.up();
  }
  res.net = X.netOk(net);
  await ctx.close(); await b.close();
  fs.writeFileSync(path.join(OUT, `cursormap-${W}.json`), JSON.stringify(res, null, 1));
  for (const s of res.states) { console.log('##', s.label); for (const e of s.entries) console.log(`  ${e.cursor.padEnd(12)} n=${String(e.n).padStart(5)} ${e.el} @${e.at}`); }
  console.log(JSON.stringify({ hoverPoint: res.hoverPoint, dragPoint: res.dragPoint, hoverEditor: res.hoverEditor, videoFloating: res.videoFloating, hoverVideo: res.hoverVideo, dragVideo: res.dragVideo }, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
