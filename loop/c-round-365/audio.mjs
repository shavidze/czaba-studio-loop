import { createRequire } from 'node:module';
import { writeFileSync, readFileSync, rmSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const DIR='/home/runner/czaba-project/tmp/studio-real-loop/c-round-365';
const res={};
function parseWav(buf) {
  const out = { riff: buf.toString('ascii', 0, 4), wave: buf.toString('ascii', 8, 12), bytes: buf.length }; let p = 12;
  while (p + 8 <= buf.length) {
    const id = buf.toString('ascii', p, p + 4); const size = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') { out.format = buf.readUInt16LE(p + 8); out.channels = buf.readUInt16LE(p + 10); out.rate = buf.readUInt32LE(p + 12); out.bits = buf.readUInt16LE(p + 22); }
    if (id === 'data') { out.dataOffset = p + 8; out.dataSizeHeader = size; out.dataSize = Math.min(size, buf.length - p - 8); break; }
    p += 8 + size + (size % 2);
  }
  out.frames = out.dataSize / (out.channels * out.bits / 8); out.duration = out.frames / out.rate;
  let peak = 0, nz = 0, sumsq = 0, cnt = 0, nonFinite = 0; const bps = out.bits / 8; const n = out.dataSize / bps;
  for (let i = 0; i < n; i++) { const o = out.dataOffset + i * bps; const x = out.format === 3 ? buf.readFloatLE(o) : bps === 2 ? buf.readInt16LE(o) / 32768 : bps === 3 ? buf.readIntLE(o, 3) / 8388608 : buf.readInt32LE(o) / 2147483648; if (!Number.isFinite(x)) { nonFinite++; continue; } if (x !== 0) nz++; peak = Math.max(peak, Math.abs(x)); sumsq += x * x; cnt++; }
  out.peak = Number(peak.toFixed(5)); out.nonzero = nz; out.samples = n; out.rmsDb = Number((10 * Math.log10(sumsq / cnt + 1e-20)).toFixed(2)); out.nonFinite = nonFinite;
  return out;
}
const tap = () => {
  const orig = AudioNode.prototype.connect; window.__c = { taps: 0, starts: 0 };
  AudioNode.prototype.connect = function (dest, ...rest) { const r = orig.call(this, dest, ...rest);
    try { if (dest instanceof AudioDestinationNode) { const ctx = this.context; if (!ctx.__an) { ctx.__an = ctx.createAnalyser(); ctx.__an.fftSize = 2048; window.__c.an = ctx.__an; } orig.call(this, ctx.__an); window.__c.taps++; } } catch (e) { window.__c.err = String(e); }
    return r; };
  const os = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (...a) { window.__c.starts++; return os.apply(this, a); };
};

const prof='/tmp/c365-audio-prof'; rmSync(prof,{recursive:true,force:true});
const ctx = await chromium.launchPersistentContext(prof,{viewport:{width:1440,height:900},acceptDownloads:true,args:['--autoplay-policy=no-user-gesture-required']});
await ctx.addInitScript(tap); await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent','denied'));
const page = ctx.pages()[0] ?? await ctx.newPage();
const cdp = await ctx.newCDPSession(page); await cdp.send('Network.enable');
for (const label of ['cold','warm1','warm2-blocked']) {
  const r = res[label] = {errors:[],reqs:[]};
  page.on('pageerror',(e)=>r.errors.push(String(e).slice(0,200)));
  const onReq=(q)=>{ if(/\.mp3/.test(q.url())) r.reqs.push(q.url().replace(/^https?:\/\/[^/]+/,'')+(q.headers()['if-none-match']?' INM':'')); }; page.on('request',onReq);
  if(label==='warm2-blocked') await cdp.send('Network.setBlockedURLs',{urls:['*.mp3']});
  await page.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:180000});
  await page.waitForFunction(()=>/Demo collection ready/.test(document.body?.innerText||''),null,{timeout:180000});
  await page.waitForTimeout(1500);
  r.libraryText = await page.evaluate(()=>[...document.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')||b.textContent).filter(t=>/add|middle|hero/i.test(t||'')).slice(0,12));
  const addBtns = page.getByRole('button',{name:'Add',exact:true}); r.addCount = await addBtns.count();
  const items = page.locator('[role="option"],[role="treeitem"],li').filter({hasText:/Middle East/}).first();
  r.itemFound = await items.count();
  if (r.itemFound) { await items.click().catch(()=>{}); await page.keyboard.press('Enter'); } else await addBtns.first().click();
  await page.locator('[data-clip-kind="audio"]').first().waitFor({timeout:30000}); await page.waitForTimeout(1500);
  const clip = page.locator('[data-clip-kind="audio"]').first();
  r.clip = await clip.evaluate((el)=>({title:el.getAttribute('title')||el.textContent.slice(0,60),start:el.getAttribute('data-clip-start'),dur:el.getAttribute('data-clip-duration')??el.getAttribute('data-clip-length'),attrs:[...el.attributes].map(a=>a.name).filter(n=>n.startsWith('data-clip')),w:el.getBoundingClientRect().width}));
  const play = page.locator('[data-testid="arrangement-transport"] button[data-playing]').first();
  const pos0 = await page.locator('[data-testid="arrangement-position"]').first().innerText().catch(()=>null);
  await play.click(); await page.waitForTimeout(2200);
  const pks=[]; for(let i=0;i<6;i++){pks.push(await page.evaluate(()=>{const an=window.__c?.an;if(!an)return null;const a=new Float32Array(an.fftSize);an.getFloatTimeDomainData(a);let m=0;for(const x of a)m=Math.max(m,Math.abs(x));return +m.toFixed(4);}));await page.waitForTimeout(120);}
  const pos1 = await page.locator('[data-testid="arrangement-position"]').first().innerText().catch(()=>null);
  r.playing = await play.getAttribute('data-playing'); r.pos0=pos0; r.pos1=pos1; r.peaks=pks; r.starts=await page.evaluate(()=>window.__c.starts);
  await play.click(); await page.waitForTimeout(400);
  await page.getByRole('button',{name:/^Export/}).first().click(); await page.waitForTimeout(800);
  await page.locator('[data-testid="arrangement-export-format-wav"]').click().catch(()=>{});
  const dl = page.waitForEvent('download',{timeout:180000});
  await page.getByRole('button',{name:'Export WAV',exact:true}).click();
  const d = await dl; const p=`/tmp/c365-${label}.wav`; await d.saveAs(p); r.wav=parseWav(readFileSync(p)); r.wavName=d.suggestedFilename();
  await page.screenshot({path:`${DIR}/audio-${label}-1440x900.png`});
  page.off('request',onReq);
  writeFileSync(`${DIR}/audio.json`,JSON.stringify(res,null,1));
}
await ctx.close();
