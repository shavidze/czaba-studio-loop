const L = require('./lib.cjs');
(async () => {
  const b = await L.launch(); const net = [];
  const O = await L.openStudio(b, { width: 1440, height: 900 }, 'bodyscan', net);
  const r = await O.page.evaluate(() => {
    const G = /[Ⴀ-ჿ]/; const hits = [];
    const ws = document.querySelector('[data-testid=arrangement-video-dock]').closest('body > * > *') ;
    const where = (el) => { let e = el; while (e && e !== document.body) { if (e.dataset && e.dataset.testid) return e.dataset.testid; e = e.parentElement; } return 'body'; };
    for (const el of document.body.querySelectorAll('*')) { if (['SCRIPT','STYLE'].includes(el.tagName)) continue; for (const a of ['aria-label','title','placeholder','aria-valuetext']) { const v = el.getAttribute(a); if (v && G.test(v)) hits.push([where(el), a, v.slice(0,80)]); } }
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (n.parentElement && ['SCRIPT','STYLE'].includes(n.parentElement.tagName)) continue; if (G.test(n.nodeValue)) hits.push([where(n.parentElement), 'text', n.nodeValue.trim().slice(0,80)]); }
    const root = document.querySelector('[data-testid=arrangement-library]'); let top = root; while (top.parentElement && top.parentElement !== document.body) top = top.parentElement;
    return { hits, bodyChildren: [...document.body.children].map((c) => `${c.tagName}.${(c.className||'').toString().slice(0,40)}#${c.dataset.testid||''}`) };
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
