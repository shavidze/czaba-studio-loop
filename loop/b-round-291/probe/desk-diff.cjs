const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const res = {};
for (const [w,h] of [[1280,720],[1440,900]]) { const bufs = [];
 for (const port of [5173,5174]) { const p = await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  await p.goto(`http://127.0.0.1:${port}/studio-lab`,{waitUntil:'networkidle'}); await p.getByText('Demo collection ready').first().waitFor({timeout:20000}); await p.waitForTimeout(1500);
  await p.mouse.move(0,h-1); bufs.push((await p.screenshot({path:`probe/desk-${port}-${w}x${h}.png`})).toString('base64')); }
 const p = await b.newPage();
 res[`${w}x${h}`] = await p.evaluate(async ([a,c]) => { const load=(s)=>new Promise(r=>{const i=new Image(); i.onload=()=>r(i); i.src='data:image/png;base64,'+s;});
  const px=(img)=>{const cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height; const x=cv.getContext('2d'); x.drawImage(img,0,0); return x.getImageData(0,0,img.width,img.height).data;};
  const [ia,ib]=await Promise.all([load(a),load(c)]); const da=px(ia), db=px(ib); let d=0; for(let i=0;i<da.length;i+=4) if(da[i]!==db[i]||da[i+1]!==db[i+1]||da[i+2]!==db[i+2]) d++; return d; }, bufs); }
console.log(JSON.stringify(res)); await b.close(); })();
