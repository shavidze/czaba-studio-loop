const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path');
const [base, vp, out] = process.argv.slice(2); const [w, h] = vp.split('x').map(Number);
const file = '/home/runner/czaba-project/tmp/studio-real-loop/media/beeps-6s-vp9-opus.webm';
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  await ctx.addInitScript(() => {
    const nc = AudioNode.prototype.connect; window.__an = new Map();
    AudioNode.prototype.connect = function (d, ...r) { if (d instanceof AudioDestinationNode) { let an = window.__an.get(d.context); if (!an) { an = d.context.createAnalyser(); an.fftSize = 2048; window.__an.set(d.context, an); } nc.call(this, an); } return nc.call(this, d, ...r); };
    window.__lvl = () => { let pk = 0; for (const an of window.__an.values()) { const dd = new Float32Array(an.fftSize); an.getFloatTimeDomainData(dd); for (const v of dd) pk = Math.max(pk, Math.abs(v)); } return pk; };
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  await p.goto(base + '/studio-lab'); await p.waitForFunction(() => /Demo collection ready/.test((document.body?.innerText||"")), null, { timeout: 120000 });
  await p.waitForTimeout(1000);
  await p.getByTestId('arrangement-video-input').setInputFiles(file);
  const vclip = p.locator('[data-clip-kind="video"]').first(); await vclip.waitFor({ timeout: 30000 });
  await p.waitForFunction(() => { const n = document.querySelector('[data-clip-kind="video"]'); return n && !/Sound is decoding/.test(n.textContent); }, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  const res = { vp, errs, runs: {} };
  const info = () => p.evaluate(() => { const n = document.querySelector('[data-clip-kind="video"]'); return { start: n.getAttribute('data-clip-start'), dur: n.getAttribute('data-clip-duration') || n.getAttribute('data-clip-end'), text: n.textContent.slice(0, 80) }; });
  res.initial = await info();
  const play = async (label, dur = 6500) => {
    // ensure playhead at 0
    const pb=()=>p.locator('[data-playing]').first().getAttribute('data-playing');
    if ((await pb())==='true'){ await p.keyboard.press('Space'); await p.waitForTimeout(400);} 
    await p.keyboard.press('Home').catch(() => {}); await p.waitForTimeout(300);
    const s = [];
    await p.locator('body').evaluate(() => document.activeElement && document.activeElement.blur());
    const clock0 = await p.evaluate(()=>[...document.querySelectorAll('[data-testid*="clock"],[data-testid*="time"],[aria-label*="Playhead"],[aria-label*="position"]')].map(e=>e.getAttribute('data-testid')+':'+(e.textContent||'').slice(0,20)+':'+(e.getAttribute('aria-valuetext')||'')).slice(0,6)); res.clock0 = res.clock0||{}; res.clock0[label]=clock0;
    let t0 = Date.now(); await p.keyboard.press('Space');
    // refusal handling
    await p.waitForTimeout(300);
    const st = await p.getByTestId('arrangement-status').textContent(); const playing0 = await pb();
    while (Date.now() - t0 < dur) { s.push({ t: (Date.now() - t0) / 1000, lvl: Number(await p.evaluate(() => window.__lvl())) }); await p.waitForTimeout(80); }
    if ((await pb())==='true'){ await p.keyboard.press('Space'); await p.waitForTimeout(400);}
    res.runs[label] = { playing0, status: st.slice(0, 80), samples: s };
  };
  await play('before');
  const mv = vclip.getByTitle(/ — drag to move$/); const bx = await mv.boundingBox();
  const x = bx.x + Math.min(120, bx.width / 2), y = bx.y + bx.height / 2;
  await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + 120, y, { steps: 20 }); await p.mouse.up(); await p.waitForTimeout(700);
  res.afterMove = await info();
  await p.screenshot({ path: path.join(__dirname, '..', 'shots', `vsound-moved-${vp}.png`) });
  await play('moved');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(600);
  res.afterUndo = await info();
  await play('undo');
  res.errors = errs; fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ init: res.initial, moved: res.afterMove, undo: res.afterUndo }));
  await b.close();
})().catch((e) => { console.log('ERR', String(e).slice(0, 500)); process.exit(1); });
