const X=require('./lib87.cjs');const{L,sleep}=X;const vp=process.argv[2];
(async()=>{const s=await L.open(vp);const p=s.page;X.attachDl(p);await L.fresh(p);await X.setup(p);await X.fiveMin(p);
 await p.click('[data-testid=arrangement-export-format-mp3]');await sleep(200);await p.getByRole('button',{name:'MP3-ის ექსპორტი',exact:true}).click();
 const shots=[];for(const re of [/^WAV-ის ჩაწერა/,/ჩატვირთვა…$/,/^MP3-ის შექმნა · [1-9]/]){const t0=Date.now();while(Date.now()-t0<30000){const t=await p.evaluate(()=>{const e=document.querySelector('[data-testid=arrangement-export-progress-label]');return e&&e.textContent;});if(t&&re.test(t)){const f=`${L.OUT}/shots/progress-${vp}-${shots.length}.png`;await p.screenshot({path:f});shots.push([t,f.split('/').pop()]);break;}await sleep(30);}}
 const t0=Date.now();while(Date.now()-t0<60000&&p.__dls.length===0)await sleep(200);console.log(JSON.stringify({shots,dls:p.__dls.map(d=>d.fn)}));for(const d of p.__dls){const f=await d.d.path().catch(()=>null);if(f)require('fs').unlinkSync(f);}
 await s.browser.close();process.exit(0);})().catch(e=>{console.log('ERR',e);process.exit(1)});
