const L = require('./lib.cjs');
(async () => { const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, { width: 1440, height: 900 }, 'probe', net);
  const r = await p.evaluate(() => {
    const own = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('').trim();
    const out = [];
    for (const e of document.querySelectorAll('.studio-container *')) { const t = own(e); if (!t) continue; const tid = e.getAttribute('data-testid') || (e.closest('[data-testid]')||{getAttribute:()=>''}).getAttribute('data-testid'); out.push(`${e.tagName}|${tid}|${getComputedStyle(e).fontFamily.slice(0,30)}|${t.slice(0,50)}`); }
    return { h: [...document.querySelectorAll('h1,h2,h3')].map((h) => h.tagName + ':' + h.textContent.trim().slice(0, 60)), out: out.slice(0, 400), inputs: [...document.querySelectorAll('.studio-container input')].map(i=>i.getAttribute('data-testid')+'='+i.value) };
  });
  console.log(JSON.stringify(r, null, 0).replace(/","/g, '"\n"')); console.log(JSON.stringify(net[0].errors)); await b.close(); })();
