const L = require('./lib.cjs');
(async () => { const b = await L.launch(); const c = await b.newContext({ deviceScaleFactor: 2 }); const p = await c.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  const r = await p.evaluate(async () => { const out = {}; for (const w of ['1px', '1.5px', '2px', '2.5px']) { const d = document.createElement('div'); d.style.outline = `${w} solid red`; d.style.border = `${w} solid red`; document.body.appendChild(d); const cs = getComputedStyle(d); out[w] = { outline: cs.outlineWidth, border: cs.borderTopWidth }; d.remove(); }
    const rules = []; for (const s of document.styleSheets) { try { for (const ru of s.cssRules) if (ru.selectorText === ':focus-visible' || (ru.selectorText || '').includes('data-focus-source')) rules.push(ru.cssText); } catch (e) {} } out.rules = rules; out.ua = navigator.userAgent; return out; });
  console.log(JSON.stringify(r, null, 1)); await b.close(); })();
