// B round 305 microbench: cost of building and applying 30 waveform paths (4096 columns) in three formats.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.setContent('<div id=root></div>');
  const res = await page.evaluate(() => {
    const N = 30, C = 4096;
    const h = new Float32Array(C); for (let i = 0; i < C; i++) h[i] = 0.02 + 0.9 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.011));
    const fmt = {
      head: () => { const p = ['M0 1']; for (let c = 0; c < C; c++) p.push(`V${(1 - h[c]).toFixed(3)}H${c + 1}`); for (let c = C - 1; c >= 0; c--) p.push(`V${(1 + h[c]).toFixed(3)}H${c}`); p.push('Z'); return p.join(''); },
      intAbs: () => { const p = ['M0 1000']; for (let c = 0; c < C; c++) p.push(`V${Math.round((1 - h[c]) * 1000)}H${c + 1}`); for (let c = C - 1; c >= 0; c--) p.push(`V${Math.round((1 + h[c]) * 1000)}H${c}`); p.push('Z'); return p.join(''); },
      intRel: () => { let s = 'M0 1000'; for (let c = 0; c < C; c++) s += `V${Math.round((1 - h[c]) * 1000)}h1`; for (let c = C - 1; c >= 0; c--) s += `V${Math.round((1 + h[c]) * 1000)}h-1`; return s + 'Z'; },
    };
    const root = document.getElementById('root');
    const out = {};
    for (const [name, f] of Object.entries(fmt)) {
      root.innerHTML = '';
      const paths = [];
      for (let i = 0; i < N; i++) { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', `0 0 ${C} ${name === 'head' ? 2 : 2000}`); svg.setAttribute('preserveAspectRatio', 'none'); svg.style.cssText = 'display:block;width:4000px;height:60px'; const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); svg.appendChild(p); root.appendChild(svg); paths.push(p); }
      root.getBoundingClientRect();
      const runs = [];
      for (let r = 0; r < 5; r++) {
        const t0 = performance.now(); const ds = []; for (let i = 0; i < N; i++) ds.push(f());
        const t1 = performance.now(); for (let i = 0; i < N; i++) { paths[i].setAttribute('d', r % 2 ? ds[i] + ' ' : ds[i]); }
        const t2 = performance.now(); root.getBoundingClientRect(); paths[0].getBBox();
        const t3 = performance.now();
        runs.push({ build: +(t1 - t0).toFixed(1), set: +(t2 - t1).toFixed(1), layout: +(t3 - t2).toFixed(1), len: ds[0].length * N });
      }
      out[name] = runs;
    }
    return out;
  });
  fs.writeFileSync('path-bench.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
  await browser.close();
})();
