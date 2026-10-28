const fs=require('node:fs');const {chromium}=require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
const data=await p.evaluate(async()=>{const c=document.createElement('canvas');c.width=320;c.height=180;const g=c.getContext('2d');
const s=c.captureStream(25);const rec=new MediaRecorder(s,{mimeType:'video/webm'});const ch=[];rec.ondataavailable=e=>ch.push(e.data);
rec.start(200);const t0=performance.now();await new Promise(r=>{const f=()=>{const t=(performance.now()-t0)/1000;g.fillStyle=`hsl(${t*90},60%,40%)`;g.fillRect(0,0,320,180);g.fillStyle='#fff';g.font='40px sans-serif';g.fillText(t.toFixed(1),100,100);if(t<4)requestAnimationFrame(f);else r();};f();});
rec.stop();await new Promise(r=>rec.onstop=r);const bl=new Blob(ch,{type:'video/webm'});const ab=new Uint8Array(await bl.arrayBuffer());let s2='';for(const x of ab)s2+=String.fromCharCode(x);return btoa(s2);});
fs.writeFileSync('media/c233-synthetic-long-name-for-caption-test-clip.webm',Buffer.from(data,'base64'));await b.close();console.log('ok');})();
