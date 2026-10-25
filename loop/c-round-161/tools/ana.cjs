const fs=require('fs');const L='/home/runner/czaba-project/tmp/studio-real-loop';const W=process.argv[2];
const r=JSON.parse(fs.readFileSync(`${L}/c-round-161/out/c161-${W}.json`));const B=JSON.parse(fs.readFileSync(`${L}/b-round-160/out/lib-states-before.json`))[W];
const EXP={collapse:['lucide-chevron-left',12,'2'],expand:['lucide-chevron-right',12,'2'],clear:['lucide-x',12,'2'],toggle:[null,12,'2'],add:['lucide-plus',12,'2'],marker:['lucide-play',10,'2.4'],fold:[null,10,'2.4']};
const out={icons:[],boxes:{},func:r.func};
for(const [sn,st] of Object.entries(r.states)){const T=st.tokens;
 for(const h of st.icon.icons){const [cls,sz,sw]=EXP[h.kind];const s=h.svgs[0]||{};let want=cls;
  if(h.kind==='toggle')want=/Stop/.test(h.text)?'lucide-square':'lucide-play'; if(h.kind==='fold')want=h.expanded==='true'?'lucide-chevron-down':'lucide-chevron-right';
  const tok=Object.entries(T).find(([k,v])=>k!=='varMuted'&&v===h.color);
  const fixed=['collapse','expand','clear','fold'].includes(h.kind);
  const ok=h.svgs.length===1&&s.ariaHidden==='true'&&(s.cls||'').includes(want)&&Math.abs(s.w-sz)<=0.5&&Math.abs(s.h-sz)<=0.5&&s.swAttr===sw&&s.stroke===h.color&&(!fixed||(Math.abs(s.dcx)<=0.5&&Math.abs(s.dcy)<=0.5))&&(fixed?h.text==='':true);
  out.icons.push({state:sn,kind:h.kind,aria:h.aria,text:h.text,ax:h.ax&&h.ax.name,cls:s.cls,n:h.svgs.length,ah:s.ariaHidden,w:s.w,h:s.h,sw:s.swAttr,stroke:s.stroke,color:h.color,token:tok?tok[0]:'?',dc:[s.dcx,s.dcy],first:s.firstChild,box:h.box,ok});}
 out.icons.push({state:sn,scan:st.icon.scan,wave:st.icon.wave,waveAx:st.icon.waveAx&&st.icon.waveAx.name,hover:st.icon.hover.map(x=>`${x.kind}:${x.restColor}->${x.color}/stroke ${x.stroke} hit ${x.hit}`)});
 const base=B.find(s=>s.label===sn); if(!base){out.boxes[sn]={note:'no B baseline'};continue;}
 const map=k=>k.replace(/^button:＋ Add/,'button:Add');
 const cur=new Map(st.measure.map(e=>[e.k,e]));const rows=[];let max=0;const missing=[],added=[];
 const bk=new Set(base.before.map(e=>map(e.k)));for(const e of st.measure)if(!bk.has(e.k))added.push(e.k);
 for(const e of base.before){const k=map(e.k);const c=cur.get(k);if(!c){missing.push(k);continue;}const d=[c.x-e.x,c.y-e.y,c.w-e.w,c.h-e.h].map(v=>+v.toFixed(3));const m=Math.max(...d.map(Math.abs));if(m>max)max=m;rows.push({k,d,cur:[c.x,c.y,c.w,c.h].map(v=>+v.toFixed(2)),m});}
 out.boxes[sn]={n:st.measure.length,nb:base.before.length,max,missing,added,over:rows.filter(x=>x.m>0.01)};
}
const fo=r.states.folded; if(fo){const a=new Map(fo.beforeFold.map(e=>[e.k,e]));let m=0;const mis=[];for(const e of fo.measureReUnfold){const b=a.get(e.k);if(!b){mis.push(e.k);continue;}m=Math.max(m,...[e.x-b.x,e.y-b.y,e.w-b.w,e.h-b.h].map(Math.abs));}
 out.boxes.folded={foldersBefore:fo.foldersBefore,foldersAfter:fo.foldersAfter,foldersReUnfold:fo.foldersReUnfold,reUnfoldMax:m,reUnfoldMissing:mis,foldBtns:fo.measure.filter(e=>/— (Fold|Unfold)/.test(e.k)).map(e=>`${e.k} w${e.w} h${e.h}`),foldBtnsBefore:fo.beforeFold.filter(e=>/— (Fold|Unfold)/.test(e.k)).map(e=>`${e.k} w${e.w} h${e.h}`)};}
const pick=(sn,re)=>(r.states[sn]?.measure||[]).filter(e=>re.test(e.k)).map(e=>`${e.k} ${e.w.toFixed(2)}x${e.h.toFixed(2)}`);
out.spot={rail:pick('collapsed-rail',/^arrangement-library(-expand)?#/),clear:pick('search-typed',/search(-clear)?#/),preview:pick('preview-playing',/preview-toggle|button:Add|option-previewing/)};
fs.writeFileSync(`${L}/c-round-161/out/ana-${W}.json`,JSON.stringify(out,null,1));
for(const i of out.icons)console.log(JSON.stringify(i));for(const [k,v] of Object.entries(out.boxes))console.log(k,JSON.stringify(v).slice(0,700));console.log(JSON.stringify(out.spot));
console.log('func',JSON.stringify(out.func.preview),JSON.stringify(out.func.add),JSON.stringify(out.func.rdel),JSON.stringify(out.func.collapse),JSON.stringify(out.func.clear));
