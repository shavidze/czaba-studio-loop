const L = require('./c210lib.cjs');
(async () => { const br = await L.launch(); const out={};
 for (const [vw,vh] of [[1440,900],[1280,720]]) { const { ctx, page } = await L.openLab(br, 'http://127.0.0.1:5173', vw, vh);
  const read = () => page.evaluate(() => { const m=[...document.querySelectorAll('[data-testid=arrangement-track-meter]')].map(e=>{const c=e.querySelector('span.origin-right'); return c?c.style.transform:null;}); const mm=document.querySelector('[data-testid=arrangement-master-meter]'); const mc=mm&&mm.querySelector('span.origin-right'); return { tracks:m, master: mc?mc.style.transform:null }; });
  const tv=L.sl(page,'Volume — Music'); await L.keyTo(page,tv,-12,'ArrowDown'); await L.space(page,'Pause');
  const res={}; for (const [k,loc] of [['track',tv],['master',L.sl(page,'Master Volume')]]) { const samples=[]; await L.drag(page, loc, k, { delay: 20, mid: async (i)=>{ if(i%5===0) samples.push(await read()); } });
   const col=(f)=>[...new Set(samples.map(f))]; res[k]={ n:samples.length, distinctMaster: col(s=>s.master).length, distinctTrack: samples[0].tracks.map((_,j)=>col(s=>s.tracks[j]).length), first: samples[0], last: samples.at(-1) }; }
  await L.space(page,'Play'); out[vw]=res; await ctx.close(); }
 L.save('meters.json', out); console.log(JSON.stringify(out)); await br.close(); })();
