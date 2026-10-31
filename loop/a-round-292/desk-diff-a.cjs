const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
(async () => { const b = await chromium.launch(); const res = {};
for (const [w,h] of [[1280,720],[1440,900]]) {
  const p = await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'}); await p.getByText('Demo collection ready').first().waitFor({timeout:20000}); await p.waitForTimeout(1500);
  await p.mouse.move(0,h-1); const now=(await p.screenshot({path:`desk-a-${w}x${h}.png`})).toString('base64');
  const ref=fs.readFileSync(`../b-round-291/probe/desk-5173-${w}x${h}.png`).toString('base64');
  const q = await b.newPage();
  res[`${w}x${h}`] = await q.evaluate(async ([a,c]) => { const load=(s)=>new Promise(r=>{const i=new Image(); i.onload=()=>r(i); i.src='data:image/png;base64,'+s;});
   const px=(img)=>{const cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height; const x=cv.getContext('2d'); x.drawImage(img,0,0); return x.getImageData(0,0,img.width,img.height).data;};
   const [ia,ib]=await Promise.all([load(a),load(c)]); const da=px(ia), db=px(ib); let d=0; for(let i=0;i<da.length;i+=4) if(da[i]!==db[i]||da[i+1]!==db[i+1]||da[i+2]!==db[i+2]) d++; return d; }, [now,ref]); }
// JS disabled boundary
for (const w of [899,900]) { const c = await b.newContext({viewport:{width:w,height:900}, javaScriptEnabled:false}); const p = await c.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab'); await p.waitForTimeout(800);
  res[`nojs-${w}`] = await p.evaluate(() => { const wrap=[...document.querySelectorAll('div')].find(d=>d.className.startsWith('contents ')); const child=wrap?.firstElementChild; const n=document.querySelector('[data-testid="studio-narrow-screen"]');
    return { wrapperClass: wrap?.className, wrapperDisplay: wrap && getComputedStyle(wrap).display, childDisplay: child && getComputedStyle(child).display, childVisible: child ? child.getClientRects().length>0 : null, narrowDisplay: n && getComputedStyle(n).display }; });
  await p.screenshot({path:`nojs-${w}.png`}); await c.close(); }
console.log(JSON.stringify(res,null,1)); await b.close(); })();
