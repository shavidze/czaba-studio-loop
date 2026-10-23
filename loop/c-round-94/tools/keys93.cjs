// KEYS-REG idle 1440: Tab/Shift+Tab cycle, arrows in format group, Esc
const X = require('./ext.cjs'); const { sleep, blur } = X;
const id = (p) => p.evaluate(() => { const d = document.querySelector('#arrangement-export-title')?.closest('[role=dialog]'); const a = document.activeElement; if (!a || a === document.body) return 'BODY';
  const t = a.dataset?.testid; const txt = (a.textContent || '').trim(); const inside = !!(d && d.contains(a));
  const s = t ? t.replace('arrangement-export-', '') : a.getAttribute('aria-label') === 'Close' ? 'X' : a.tagName === 'BUTTON' ? 'BTN:' + txt : a.tagName === 'INPUT' ? 'INPUT:' + a.name + (a.disabled ? ':disabled' : '') : a.tagName + ':' + txt.slice(0, 20);
  return (inside ? '' : '#OUT:') + s; });
const fmt = (p) => p.evaluate(() => document.querySelector('input[name="arrangement-export-format"]:checked')?.dataset.testid);
(async () => {
  const b = await X.launch(); const { ctx, page: p, S } = await X.newCtx(b, { width: 1440, height: 900 }, 'keys1440'); const R = {};
  await X.setup(p, 0); await X.closeDlg(p); await blur(p);
  await p.getByRole('button', { name: 'Export', exact: true }).focus(); await p.keyboard.press('Enter'); await p.waitForSelector('#arrangement-export-title'); await sleep(500);
  R.initial = await id(p);
  R.fwd = []; for (let i = 0; i < 7; i++) { await p.keyboard.press('Tab'); await sleep(80); R.fwd.push(await id(p)); }
  R.back = []; for (let i = 0; i < 7; i++) { await p.keyboard.press('Shift+Tab'); await sleep(80); R.back.push(await id(p)); }
  await p.focus('[data-testid=arrangement-export-format-wav]'); R.arrows = [];
  for (const k of ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp']) { await p.keyboard.press(k); await sleep(120); R.arrows.push({ k, focus: await id(p), checked: await fmt(p), btn: (await X.exportBtnBox(p)).text }); }
  await p.keyboard.press('Escape'); await sleep(500);
  R.esc = await p.evaluate(() => ({ open: !!document.querySelector('#arrangement-export-title'), focus: document.activeElement?.textContent?.trim().slice(0, 20) }));
  R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders;
  X.save('keys-1440x900.json', R); console.log(JSON.stringify(R, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
