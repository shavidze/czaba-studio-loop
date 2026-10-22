// C r86 extra: switch the format radio while an MP3 export renders / loads the encoder
const X=require('./lib86.cjs');const{L,sleep,blur}=X;
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/sw-${vp}.json`);const T=X.T(rec);
(async()=>{const s=await L.open(vp);const p=s.page;X.attachDl(p);await L.fresh(p);await sleep(300);await X.setup(p);await blur(p);
 await T('EXTRA-FORMAT-SWITCH-DURING-MP3',async()=>{const o={tl:[]};await X.openDlg(p);await p.click('[data-testid=arrangement-export-format-mp3]');await sleep(200);const n0=p.__dls.length;
  await p.getByRole('button',{name:'MP3-ის ექსპორტი',exact:true}).click();const t0=Date.now();let switched=false,last=null;
  while(Date.now()-t0<120000){const m=await X.msgState(p);const k=m.role+'|'+m.msg+'|'+m.btn;if(k!==last){o.tl.push({t:Date.now()-t0,msg:(m.msg||'').slice(0,50),btn:m.btn,radios:m.radios.slice(0,3).map(r=>[r.checked,r.disabled])});last=k;}
   if(!switched&&/encoder იტვირთება/.test(m.msg||'')){await p.click('[data-testid=arrangement-export-format-wav]');switched=Date.now()-t0;o.afterSwitch=await X.msgState(p);}
   if(/შეიქმნა|ვერ/.test(m.msg||'')&&p.__dls.length>n0)break;await sleep(100);}
  await sleep(1500);o.switchedAt=switched;o.final=await X.msgState(p);o.dls=p.__dls.slice(n0).map(d=>d.fn);
  rec('EXTRA-FORMAT-SWITCH-DURING-MP3',!!switched&&o.dls.join()==='czaba-studio-lab.mp3'&&/^MP3 შეიქმნა/.test(o.final.msg||'')&&o.final.btn==='WAV-ის ექსპორტი'&&o.final.radios[0].checked,{switchedAt:o.switchedAt,afterSwitch:o.afterSwitch&&{btn:o.afterSwitch.btn,msg:o.afterSwitch.msg},final:{msg:o.final.msg,btn:o.final.btn},dls:o.dls,tl:o.tl});});
 await s.browser.close();})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
