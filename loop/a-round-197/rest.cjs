const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const src = fs.readFileSync(path.join(__dirname, 'flag-ring.cjs'), 'utf8');
const decodePng = new Function('zlib', `${src.match(/function decodePng[\s\S]*?\n}\n/)[0]}; return decodePng;`)(zlib);
const W = +(process.argv[2] || 1440);
const DIR = path.join(__dirname, 'rest');
fs.mkdirSync(DIR, { recursive: true });

async function shoot(port) {
  process.env.A_BASE = `http://127.0.0.1:${port}`;
  delete require.cache[require.resolve('./lib197.cjs')];
  const L = require('./lib197.cjs');
  const { browser, page, log } = await L.openStudio(W);
  const state = async () =>
    page.evaluate(() => {
      const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
      const q = (s) => [...document.querySelectorAll(s)].map((e) => { const r = e.getBoundingClientRect(); return [e.dataset.testid || e.getAttribute('aria-label') || e.tagName, +r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)]; });
      return {
        scrollTop: sc.scrollTop,
        scrollLeft: sc.scrollLeft,
        spt: sc.style.scrollPaddingTop,
        boxes: { chrome: q('[data-testid=arrangement-timeline-scroller] > div > div.sticky'), markerStrip: q('[data-testid=arrangement-marker-strip]'), loopStrip: q('[data-testid=arrangement-loop-strip]'), lanes: q('[data-track-id]'), flags: q('[data-testid=arrangement-marker]'), labels: q('[data-marker-label]') },
      };
    });
  await page.mouse.move(2, 2);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await L.sleep(400);
  const load = await state();
  const fileA = path.join(DIR, `${port}-${W}-default.png`);
  await page.screenshot({ path: fileA });
  await page.click('[data-testid=arrangement-marker-add]');
  await L.sleep(500);
  if ((await page.$$('[data-testid=arrangement-marker]')).length === 0) {
    await page.keyboard.press('Enter');
    await L.sleep(500);
  }
  await page.mouse.move(2, 2);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await L.sleep(400);
  const marker = await state();
  const fileB = path.join(DIR, `${port}-${W}-marker.png`);
  await page.screenshot({ path: fileB });
  await browser.close();
  return { load, marker, fileA, fileB, errors: log.errors, consoleErrors: log.console, hydration: log.hydration };
}

function compare(a, b, allow) {
  const A = decodePng(fs.readFileSync(a));
  const B = decodePng(fs.readFileSync(b));
  if (A.w !== B.w || A.h !== B.h) return { size: [A.w, A.h, B.w, B.h] };
  let outside = 0;
  let inside = 0;
  const bb = [1e9, 1e9, -1, -1];
  for (let y = 0; y < A.h; y++) {
    for (let x = 0; x < A.w; x++) {
      const p = A.px(x, y);
      const q = B.px(x, y);
      if (p[0] === q[0] && p[1] === q[1] && p[2] === q[2]) continue;
      const cx = x / 2;
      const cy = y / 2;
      if (allow && cx >= allow[0] && cx < allow[0] + allow[2] && cy >= allow[1] && cy < allow[1] + allow[3]) {
        inside++;
        continue;
      }
      outside++;
      bb[0] = Math.min(bb[0], cx);
      bb[1] = Math.min(bb[1], cy);
      bb[2] = Math.max(bb[2], cx);
      bb[3] = Math.max(bb[3], cy);
    }
  }
  return { changedOutside: outside, changedInsideFlagBox: inside, bboxCss: outside ? bb : null };
}

(async () => {
  const ref = await shoot(5183);
  const tree = await shoot(5173);
  const flag = tree.marker.boxes.flags[0];
  const allow = flag ? [flag[1], flag[2], flag[3], flag[4]] : null;
  const res = {
    W,
    loadScroll: { ref: [ref.load.scrollTop, ref.load.scrollLeft, ref.load.spt], tree: [tree.load.scrollTop, tree.load.scrollLeft, tree.load.spt] },
    defaultVsRef: compare(tree.fileA, ref.fileA, null),
    markerVsRef: compare(tree.fileB, ref.fileB, allow),
    boxesEqual: {
      chrome: JSON.stringify(ref.marker.boxes.chrome) === JSON.stringify(tree.marker.boxes.chrome),
      markerStrip: JSON.stringify(ref.marker.boxes.markerStrip) === JSON.stringify(tree.marker.boxes.markerStrip),
      loopStrip: JSON.stringify(ref.marker.boxes.loopStrip) === JSON.stringify(tree.marker.boxes.loopStrip),
      lanes: JSON.stringify(ref.marker.boxes.lanes) === JSON.stringify(tree.marker.boxes.lanes),
      labels: JSON.stringify(ref.marker.boxes.labels) === JSON.stringify(tree.marker.boxes.labels),
    },
    flagRef: ref.marker.boxes.flags,
    flagTree: tree.marker.boxes.flags,
    errors: { ref: ref.errors.length, tree: tree.errors.length, treeConsole: tree.consoleErrors, hydration: tree.hydration.length },
  };
  fs.writeFileSync(path.join(DIR, `rest-${W}.json`), JSON.stringify({ res, ref, tree }, null, 1));
  console.log(JSON.stringify(res));
})().catch((e) => { console.error(e); process.exit(1); });
