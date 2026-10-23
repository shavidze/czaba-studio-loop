// C round 109 browser rows. usage: node c109.cjs <axnojs|axhyd|flow|pages> [WxH]
const X = require('./lib109.cjs'); const { sleep } = X;
const { createRequire } = require('module'); const { chromium } = createRequire('/home/runner/czaba-project/store/package.json')('playwright');
const fs = require('fs');
const row = process.argv[2]; const VPS = process.argv[3] || '1280x720'; const VP = { width: +VPS.split('x')[0], height: +VPS.split('x')[1] };
const DEL = '⌫ წაშლა — კლიპის წაშლა — სიცარიელე დარჩება';
const HEAD = 'Arrangement · მთლიანი პროექტი';
const HYD = /hydrat|did not match|Text content does not match|server rendered|Prop `.*` did not match/i;
const scan = () => {
  const bad = []; const F = '�', Z = '\u0000';
  for (const e of document.querySelectorAll('*')) for (const a of e.attributes) if (a.value.includes(F) || a.value.includes(Z)) bad.push({ tag: e.tagName, attr: a.name, v: a.value.slice(0, 120) });
  const w = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.data.includes(F) || n.data.includes(Z)) bad.push({ text: n.data.slice(0, 120) });
  const html = document.documentElement.outerHTML;
  const del = [...document.querySelectorAll('[aria-label]')].filter((e) => e.getAttribute('aria-label').startsWith('⌫')).map((e) => e.getAttribute('aria-label'));
  return { fffdInHtml: html.split(F).length - 1, nulInHtml: html.split(Z).length - 1, bad, del, headingHit: document.body.innerText.includes('Arrangement · მთლიანი პროექტი'), headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => h.textContent.trim()).filter((t) => /Arrangement/.test(t)) };
};
(async () => {
  const R = { row, vp: VPS, startedUtc: new Date().toISOString() }; let checks = []; let b, S = { errors: [] }; const hyd = [];
  try {
    b = await X.launch();
    if (row === 'axnojs') {
      const ctx = await b.newContext({ viewport: VP, javaScriptEnabled: false }); const p = await ctx.newPage();
      const req = []; p.on('request', (q) => { const u = q.url(); if (/studio-token|recording-|\/api\/download|r2\./.test(u) || q.headers().authorization) req.push(u); });
      const r = await p.goto(X.URL, { waitUntil: 'load' }); R.status = r.status();
      R.jsOff = await p.evaluate(() => ({ remixCtx: typeof window.__remixContext, scripts: document.scripts.length }));
      R.scan = await p.evaluate(scan);
      R.forbidden = req;
      await p.screenshot({ path: `${X.SHOTS}/axnojs-${VPS}.png` });
      checks = [['200', R.status === 200], ['page JS did not run', R.jsOff.remixCtx === 'undefined'], ['no FFFD', R.scan.fffdInHtml === 0], ['no NUL', R.scan.nulInHtml === 0], ['bad nodes 0', R.scan.bad.length === 0], ['del label exact', R.scan.del.length >= 1 && R.scan.del.includes(DEL)], ['heading', R.scan.headingHit], ['no forbidden', req.length === 0]];
    } else {
      const s = await X.newCtx(b, VP, `${row}-${VPS}`); const p = s.page; S = s.S;
      p.on('framenavigated', (f) => { if (f === p.mainFrame()) (R.navs = R.navs || []).push(Date.now() + ' ' + f.url()); }); p.on('console', (m) => { if (HYD.test(m.text())) hyd.push(m.text().slice(0, 300)); });
      if (row === 'pages') {
        R.pages = [];
        for (const path of ['/', '/products', '/about']) {
          const e0 = S.errors.length, h0 = hyd.length;
          const r = await p.goto(X.BASE + path, { waitUntil: 'load' }); await sleep(5000);
          const info = await p.evaluate(scan);
          R.pages.push({ path, status: r.status(), title: await p.title(), textLen: (await p.evaluate(() => document.body.innerText.length)), errors: S.errors.slice(e0), hydration: hyd.slice(h0), fffd: info.fffdInHtml, bad: info.bad.length });
          await p.screenshot({ path: `${X.SHOTS}/pages${path.replace(/\W/g, '_')}-${VPS}.png` });
        }
        checks = R.pages.map((x) => [`${x.path} ok`, x.status === 200 && x.textLen > 50 && x.errors.length === 0 && x.hydration.length === 0 && x.fffd === 0]);
      } else {
        await p.addInitScript(() => { const O = window.AudioContext; window.__acs = []; window.AudioContext = class extends O { constructor(...a) { super(...a); window.__acs.push(this); } }; });
        await p.goto(X.URL, { waitUntil: 'domcontentloaded' });
        await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(3000);
        await X.decline? null : null;
        await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) x.click(); }); await sleep(300);
        const t0 = Date.now(); while (Date.now() - t0 < 90000) { const n = await p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((o) => /იტვირთება…/.test(o.textContent)).length); if (n === 0) break; await sleep(250); }
        await sleep(500);
        if (row === 'axhyd') {
          R.scan = await p.evaluate(scan); R.hydration = hyd; R.errors = S.errors;
          await p.screenshot({ path: `${X.SHOTS}/axhyd-${VPS}.png` });
          checks = [['no FFFD', R.scan.fffdInHtml === 0], ['no NUL', R.scan.nulInHtml === 0], ['bad 0', R.scan.bad.length === 0], ['del label exact', R.scan.del.includes(DEL)], ['heading', R.scan.headingHit], ['no hydration warn', hyd.length === 0], ['no errors', S.errors.length === 0]];
        } else if (row === 'flow') {
          const o = p.locator('[role=option][data-source-id="demo-middle-east"]'); await o.scrollIntoViewIfNeeded();
          const t1 = Date.now(); while (Date.now() - t1 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
          await o.focus(); await p.keyboard.press('Enter'); await sleep(1200);
          R.clips = await p.$$eval('[data-clip-id]', (els) => els.map((e) => ({ lane: e.closest('[data-track-id]')?.getAttribute('data-track-id'), start: e.getAttribute('data-clip-start'), end: e.getAttribute('data-clip-end') })));
          await X.blur(p);
          await p.click('[data-testid=arrangement-fit]'); await sleep(600);
          R.zoomAfterFit = await p.textContent('[data-testid=arrangement-zoom-readout]');
          R.projectEnd = await p.textContent('[data-testid=arrangement-project-end]');
          await X.blur(p);
          const pos0 = await p.textContent('[data-testid=arrangement-position]');
          const ph0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-playhead]')?.getBoundingClientRect().left ?? null);
          await p.click('button[aria-label="Play"]'); const w0 = Date.now();
          await sleep(500); const ac1 = await p.evaluate(() => window.__acs.map((c) => ({ state: c.state, t: c.currentTime, sr: c.sampleRate })));
          await sleep(1500);
          const ac2 = await p.evaluate(() => window.__acs.map((c) => ({ state: c.state, t: c.currentTime })));
          const pos1 = await p.textContent('[data-testid=arrangement-position]');
          const ph1 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-playhead]')?.getBoundingClientRect().left ?? null);
          await p.click('button[aria-label="Pause"]'); const wall = (Date.now() - w0) / 1000; await sleep(800);
          const pos2 = await p.textContent('[data-testid=arrangement-position]'); await sleep(800);
          const pos3 = await p.textContent('[data-testid=arrangement-position]');
          R.transport = { pos0, pos1, pos2, pos3, ph0, ph1, wall, ac1, ac2 };
          await p.screenshot({ path: `${X.SHOTS}/flow-afterplay-${VPS}.png` });
          R.scopeLabel = await X.openDlg(p);
          await X.selectFormat(p, 'wav');
          R.exp = await X.exportFull(p);
          R.files = R.exp.files.map((f) => ({ name: f.name, size: f.size, info: f.file ? X.wavInfo(f.file) : null, path: f.file }));
          await p.screenshot({ path: `${X.SHOTS}/flow-export-${VPS}.png` });
          for (const f of R.files) if (f.path) { fs.unlinkSync(f.path); f.deleted = !fs.existsSync(f.path); }
          const toS = (t) => { const m = /(\d+):(\d+\.\d+)/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : NaN; };
          const endS = toS(/— (\S+)$/.exec(R.scopeLabel || '')?.[1]); const w = R.files[0]?.info;
          R.derived = { endS, wavS: w?.seconds, adv: toS(pos1) - toS(pos0), paused: pos2 === pos3 };
          R.hydration = hyd; R.errors = S.errors;
          checks = [['one clip', R.clips.length === 1], ['playhead advanced >1s', R.derived.adv > 1], ['playhead pixel moved', ph1 > ph0], ['audio ctx running+advancing', ac2.some((c, i) => c.state === 'running' && c.t > (ac1[i]?.t ?? 0))], ['paused stays', R.derived.paused],
            ['wav riff/wave', w?.riff === 'RIFF' && w?.wave === 'WAVE'], ['24/48k/2ch', w?.bits === 24 && w?.sr === 48000 && w?.ch === 2], ['duration = project (±1ms)', Math.abs(w?.seconds - endS) < 0.0011], ['no NaN', w?.nan === 0], ['non-silent', w?.rms > 0.001], ['deleted', R.files.every((f) => f.deleted)], ['no hydration', hyd.length === 0], ['no errors', S.errors.length === 0]];
        }
      }
      R.net = { forbidden: S.forbidden, auth: S.authHeaders, third: [...new Set(S.thirdParty)] };
      checks.push(['PX-NET forbidden 0', S.forbidden.length === 0], ['PX-NET auth 0', S.authHeaders.length === 0]);
    }
  } catch (e) { R.exception = String(e.stack || e); }
  R.checks = checks; R.pass = !R.exception && checks.length > 0 && checks.every((c) => c[1]);
  X.save(`${row}-${VPS}.json`, R); console.log(JSON.stringify(R, null, 1).slice(0, 6000));
  if (b) await b.close();
})();
