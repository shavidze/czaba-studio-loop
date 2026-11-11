import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const [,, base, w, h, tag] = process.argv;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +w, height: +h } });
await ctx.addInitScript(() => { sessionStorage.setItem('czaba_entrance_seen','1'); const O=window.Audio; window.__audios=[]; window.Audio=function(...a){const e=new O(...a);window.__audios.push(e);return e;}; window.Audio.prototype=O.prototype; });
const page = await ctx.newPage();
await page.goto(base + '/products/pulse-loop-kit', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Play preview' }).first().click();
const input = page.locator('input[aria-label="Preview position"]'); await input.waitFor();
await page.waitForFunction(() => { const a = window.__audios.at(-1); return a && a.currentTime > 0.3; });
const res = [];
for (let k = 0; k < 6; k++) {
  const bb = await input.boundingBox();
  const clip = { x: Math.floor(bb.x), y: Math.floor(bb.y + bb.height/2 - 8), width: Math.ceil(bb.width), height: 16 };
  const buf = await page.screenshot({ clip, path: `shots/play-${tag}-${w}-${k}.png` });
  const r = await page.evaluate(async ([b64]) => {
    const img = new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
    const c=document.createElement('canvas'); c.width=img.width;c.height=img.height; const g=c.getContext('2d'); g.drawImage(img,0,0);
    const d=g.getImageData(0,8,img.width,1).data; const white=[],brass=[];
    for(let x=0;x<img.width;x++){const [r,gg,b]=[d[x*4],d[x*4+1],d[x*4+2]]; if(r>225&&gg>225&&b>225)white.push(x); else if(r>150&&gg>110&&r-b>60)brass.push(x);}
    const wl=white[0],wr=white.at(-1); return {wl,wr,brassMax:brass.at(-1),brassMin:brass[0],brassBeyond:brass.filter(x=>x>wr).length,
      brassLeftOfThumb: brass.filter(x=>x<wl).length, gapLeft: wl-(brass.filter(x=>x<wl).at(-1)??wl)-1, ct: window.__audios.at(-1).currentTime};
  }, [buf.toString('base64')]);
  res.push(r); await page.waitForTimeout(500);
}
console.log(tag, w, JSON.stringify(res, null, 0));
await browser.close();
