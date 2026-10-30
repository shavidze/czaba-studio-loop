const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs=require('fs'); const dir=process.argv[2];
(async()=>{ const br=await chromium.launch(); const p=await br.newPage(); const out=[];
for (const f of fs.readdirSync(dir).filter(f=>f.startsWith('vis-base-'))) {
  const g=f.replace('vis-base-','vis-cur-'); if(!fs.existsSync(dir+'/'+g)) continue;
  const A='data:image/png;base64,'+fs.readFileSync(dir+'/'+f).toString('base64'), B='data:image/png;base64,'+fs.readFileSync(dir+'/'+g).toString('base64');
  const r=await p.evaluate(async([A,B])=>{ const load=(s)=>new Promise(res=>{const i=new Image(); i.onload=()=>res(i); i.src=s;}); const [a,b]=[await load(A),await load(B)];
    if(a.width!==b.width||a.height!==b.height) return {size:[a.width,a.height,b.width,b.height]};
    const c=(i)=>{const cv=document.createElement('canvas'); cv.width=i.width; cv.height=i.height; const x=cv.getContext('2d'); x.drawImage(i,0,0); return x.getImageData(0,0,i.width,i.height).data;};
    const da=c(a),db=c(b); let d=0,mx=0; for(let i=0;i<da.length;i+=4){const m=Math.max(Math.abs(da[i]-db[i]),Math.abs(da[i+1]-db[i+1]),Math.abs(da[i+2]-db[i+2])); if(m>0)d++; if(m>mx)mx=m;} return {w:a.width,h:a.height,diffPx:d,maxDelta:mx}; },[A,B]);
  out.push(f+' '+JSON.stringify(r)); }
console.log(out.join('\n')); await br.close(); })();
