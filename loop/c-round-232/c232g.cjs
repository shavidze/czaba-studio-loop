// C round 232: Georgian-layout key via CDP, AltGraph attempt. usage: node c232g.cjs <outDir>
const fs = require('node:fs'); const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch(); const R = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = (R[k] = {});
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
    await p.waitForFunction(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Add'); return x && !x.disabled; }, undefined, { timeout: 120000 });
    await new Promise((s) => setTimeout(s, 900));
    await p.evaluate(() => { window.__ev = []; window.addEventListener('keydown', (e) => { if (e.code === 'KeyO') window.__ev.push({ key: e.key, ctrl: e.ctrlKey, alt: e.altKey, ag: e.getModifierState('AltGraph'), dp: e.defaultPrevented }); }); });
    const st = () => p.evaluate(() => ({ ov: !!document.querySelector('[data-testid="arrangement-overview"]'), key: localStorage.getItem('czaba-studio-overview-hidden'), status: document.querySelector('[data-testid="arrangement-status"]')?.textContent }));
    const cdp = await ctx.newCDPSession(p);
    const send = async (type, extra) => cdp.send('Input.dispatchKeyEvent', { type, modifiers: 3, code: 'KeyO', key: 'ო', windowsVirtualKeyCode: 79, nativeVirtualKeyCode: 79, ...extra });
    await send('rawKeyDown'); await send('keyUp'); await new Promise((s) => setTimeout(s, 300));
    r.georgianCtrlAlt = { ...(await st()), ev: await p.evaluate(() => window.__ev.slice(-1)[0]) };
    await send('rawKeyDown'); await send('keyUp'); await new Promise((s) => setTimeout(s, 300));
    r.georgianAgain = await st();
    try { await p.keyboard.down('AltGraph'); await p.keyboard.press('KeyO'); await p.keyboard.up('AltGraph'); await new Promise((s) => setTimeout(s, 300)); r.altGraph = { ...(await st()), ev: await p.evaluate(() => window.__ev.slice(-1)[0]) }; } catch (e) { r.altGraph = { error: String(e).slice(0, 200) }; }
    r.errors = errs; await ctx.close();
  }
  fs.writeFileSync(path.join(out, 'c232g.json'), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R, null, 1)); await b.close();
})();
