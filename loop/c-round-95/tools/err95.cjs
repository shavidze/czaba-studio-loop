// C round 95: node err95.cjs <1280|1440> <net|decode|http|both|normal> [add]
// Fresh incognito context, no credentials. Real Playwright Chromium.
const X = require('./ext.cjs'); const { sleep } = X;
const W = +process.argv[2]; const SC = process.argv[3]; const ADD = process.argv[4] === 'add';
const vp = W === 1280 ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const LOADING = 'დემო კოლექცია იტვირთება…';
const FAILED = (n) => `დემო კოლექციიდან ${n} წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`;
const NET = 'შეცდომა: ფაილი ვერ ჩაიტვირთა (ქსელი)';
const DEC = 'შეცდომა: ფაილი ვერ გაიშიფრა';
const H404 = 'შეცდომა: ფაილი ვერ ჩაიტვირთა (404)';
const AUD = /\.(mp3|wav|ogg|flac|m4a)(\?|$)/;
const DUR = /\d{2}:\d{2}\.\d{3}/;
const ENGLISH = /Failed to fetch|decode|Unable|EncodingError|TypeError|DOMException|NetworkError|net::|Error:/i;
(async () => {
  const R = { vp: `${vp.width}x${vp.height}`, scenario: SC, audio: {}, hyd: [], routed: [] };
  const b = await X.launch(); const { ctx, page: p, S } = await X.newCtx(b, vp, `${SC}${W}`);
  p.on('console', (m) => { if (/hydrat|did not match|server rendered/i.test(m.text())) R.hyd.push(m.text().slice(0, 200)); });
  p.on('request', (q) => { const u = q.url(); if (AUD.test(u)) { const k = u.replace(X.BASE, ''); R.audio[k] = (R.audio[k] || 0) + 1; } });
  const me = /\/middle-east\.mp3(\?|$)/, hero = /\/videos\/hero\/hero-music\.mp3(\?|$)/;
  if (SC !== 'normal') {
    await p.route(AUD, async (rt) => {
      const u = rt.request().url();
      const hit = me.test(u) || (SC === 'both' && hero.test(u));
      if (!hit) return rt.continue();
      R.routed.push(u.replace(X.BASE, ''));
      if (SC === 'net' || SC === 'both') return rt.abort();
      if (SC === 'decode') return rt.fulfill({ status: 200, contentType: 'audio/mpeg', body: 'not audio' });
      if (SC === 'http') return rt.fulfill({ status: 404 });
      return rt.continue();
    });
  }
  await p.goto(X.URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 });
  R.status = await X.waitStatus(p, (s) => s !== LOADING && s != null, 120000);
  await sleep(2500); R.statusAfter = await X.status(p);
  R.rows = await p.$$eval('[role=option][data-source-id]', (os) => os.map((o) => ({ id: o.dataset.sourceId, drag: o.getAttribute('draggable'), t: o.innerText.replace(/\s+/g, ' ').trim() })));
  await p.waitForSelector('body'); R.body = await p.evaluate(() => document.body ? document.body.innerText : '');
  R.englishHits = (R.body.match(new RegExp(ENGLISH.source, 'gi')) || []);
  R.failedToFetch = R.body.includes('Failed to fetch');
  await X.decline(p);
  await p.screenshot({ path: `${X.SHOTS}/${SC}-${R.vp}.png`, fullPage: false });
  const row = (id) => R.rows.find((r) => r.id === id) || { t: '' };
  const failedIds = SC === 'both' ? ['demo-middle-east', 'demo-hero-music'] : SC === 'normal' ? [] : ['demo-middle-east'];
  const others = R.rows.filter((r) => !failedIds.includes(r.id));
  const expRow = SC === 'decode' ? DEC : SC === 'http' ? H404 : NET;
  R.checks = {
    nineRows: R.rows.length === 9,
    othersHaveDuration: others.every((r) => DUR.test(r.t) && !/შეცდომა/.test(r.t)),
    failedRowText: failedIds.every((id) => row(id).t.includes(expRow)),
    failedRowNoDuration: failedIds.every((id) => !DUR.test(row(id).t)),
    status: SC === 'normal' ? R.status === X.READY && R.statusAfter === X.READY : R.status === FAILED(failedIds.length) && R.statusAfter === FAILED(failedIds.length),
    noRawEnglish: !R.failedToFetch && R.englishHits.length === 0,
    audioOnce: Object.values(R.audio).every((n) => n === 1),
    noHyd: R.hyd.length === 0,
    noErrors: S.errors.length === 0,
    net: S.forbidden.length === 0 && S.authHeaders.length === 0,
  };
  if (ADD) {
    const clips = () => p.$$eval('[data-clip-id]', (e) => e.length);
    const A = { before: await clips() };
    const o = p.locator('[role=option][data-source-id="demo-middle-east"]'); await o.scrollIntoViewIfNeeded();
    await o.click(); await sleep(300); A.selected = await o.getAttribute('aria-selected');
    await p.keyboard.press('Enter'); await sleep(800);
    A.afterEnter = await clips(); A.statusAfterEnter = await X.status(p);
    const addBtn = await p.$$eval('button', (bs) => bs.filter((x) => /დამატება/.test(x.textContent)).map((x) => ({ t: x.textContent.trim(), dis: x.disabled })));
    A.addButtons = addBtn;
    await X.geo(p);
    const ob = await o.boundingBox(); const lb = await p.evaluate(() => { const l = document.querySelector('[data-track-id="music"]'); const r = (l.querySelector('[data-grid-seconds]') || l).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    const ox = Math.round(ob.x + ob.width / 2), oy = Math.round(ob.y + ob.height / 2);
    await p.mouse.move(ox, oy); await p.mouse.down(); await p.mouse.move(ox + 12, oy, { steps: 3 });
    await p.mouse.move(Math.round(lb.x + 200), Math.round(lb.y + lb.h / 2), { steps: 14 }); await sleep(300); await p.mouse.up(); await sleep(900);
    A.afterDrag = await clips(); A.statusAfterDrag = await X.status(p);
    await p.screenshot({ path: `${X.SHOTS}/add-refused-${R.vp}.png` });
    R.add = A; R.checks.addRefused = A.before === A.afterEnter && A.afterEnter === A.afterDrag;
  }
  R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.unpkg = S.unpkg; R.third = [...new Set(S.thirdParty)]; R.noise = S.noise;
  delete R.body;
  R.pass = Object.values(R.checks).every(Boolean);
  X.save(`err-${SC}-${R.vp}.json`, R); console.log(JSON.stringify(R, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
