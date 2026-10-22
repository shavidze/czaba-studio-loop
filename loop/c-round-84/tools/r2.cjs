const X=require('./lib84.cjs');const{L,sleep,st,blur,key,vInfo,vDrag,undo}=X;const fs=require('fs');const crypto=require('crypto');
const vp=process.argv[2]||'1280x720';const tag=process.argv[3]||'a';const rec=X.mkRec(`${L.OUT}/r2-${vp}-${tag}.json`);const T=X.T(rec);
async function ex(p,name){await blur(p);await p.getByRole('button',{name:'Export',exact:true}).click();await p.waitForSelector('#arrangement-export-title');await sleep(300);const dlP=p.waitForEvent('download',{timeout:300000});await p.getByRole('button',{name:'WAV-ის ექსპორტი'}).click();const dl=await dlP;const out=`${L.OUT}/export-${vp}-${tag}-${name}.wav`;await dl.saveAs(out);await sleep(300);await p.keyboard.press('Escape');await sleep(400);const buf=fs.readFileSync(out);fs.unlinkSync(out);return{name,w:X.W.parse(buf),sha:crypto.createHash('sha256').update(buf).digest('hex').slice(0,16)};}
function dd(a,b){const n=Math.min(a.w.n,b.w.n),ch=a.w.fmt.ch,sr=a.w.fmt.sr;let cnt=0,m=0;const loc=[];for(let i=0;i<n;i++){const d=Math.abs(a.w.read(i)-b.w.read(i));if(d){cnt++;if(d>m)m=d;if(loc.length<8)loc.push({t:+((Math.floor(i/ch))/sr).toFixed(5),c:i%ch,a:a.w.read(i),b:b.w.read(i)})}}
 return{max:m,count:cnt,loc:loc.slice(0,3)};}
function bins(a,b){const n=Math.min(a.w.n,b.w.n),ch=a.w.fmt.ch,sr=a.w.fmt.sr;const B={};for(let i=0;i<n;i++){if(a.w.read(i)!==b.w.read(i)){const k=Math.floor(i/ch/sr);B[k]=(B[k]||0)+1}}return B;}
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);await sleep(300);const U=await X.setupV(p);const S=U.v.start;rec('SETUP',true,{S,E:U.v.end});
 const E=[];E.push(await ex(p,'n1'));E.push(await ex(p,'n2'));
 const a=await vDrag(p,'in',40);const b=await vDrag(p,'out',-80);const v=await vInfo(p);rec('FADES',v.fi==='1.000'&&v.fo==='2.000',{fi:v.fi,fo:v.fo});
 E.push(await ex(p,'f1'));E.push(await ex(p,'f2'));await undo(p,2);const v2=await vInfo(p);E.push(await ex(p,'n3'));
 const sh=E.map(e=>[e.name,e.sha]);const pairs={};for(const [i,j] of [[0,1],[0,2],[2,3],[0,4],[1,2]]){const k=E[i].name+'-'+E[j].name;pairs[k]=dd(E[i],E[j]);pairs[k].bins=bins(E[i],E[j]);}
 rec('DET',null,{sh,pairs,v2:[v2.fi,v2.fo]});await X.finish(s,rec,'R2-'+vp+tag);})().catch(e=>{console.log('ERR',e);process.exit(1)});
