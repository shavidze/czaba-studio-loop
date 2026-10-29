// families widest->finest for seconds
const fam=[10,5,2,1,0.5,0.25,0.1];
const base=(px)=>{for(let i=fam.length-1;i>=0;i--) if(fam[i]*px>=24-1e-6) return i; return 0;};
const pick=(px,d)=>Math.min(fam.length-1,Math.max(0,base(px)-d));
function cur(px,d,step){ // A's loop; returns new density or null(refused)
  const c=pick(px,d); const nxtIdx=c-step; if(nxtIdx<0||nxtIdx>=fam.length) return {r:'end'};
  let x=d+step; while(x>=-2&&x<=2&&pick(px,x)===c) x+=step;
  if(x<-2||x>2) return {r:'limit'}; return {d:x};
}
function rev(px,d,step){ const c=pick(px,d); const nxtIdx=c-step; if(nxtIdx<0||nxtIdx>=fam.length) return {r:'end'};
  const eff=base(px)-c; const x=eff+step; if(x<-2||x>2) return {r:'limit'}; return {d:x};}
let diff=0,n=0; const pxs=[];for(let p=0.5;p<=320;p*=1.07)pxs.push(p);
for(const px of pxs)for(let d=-2;d<=2;d++)for(const s of [-1,1]){n++;const a=JSON.stringify(cur(px,d,s)),b=JSON.stringify(rev(px,d,s));if(a!==b){diff++; if(diff<6)console.log(px.toFixed(2),d,s,a,b);}}
console.log('cases',n,'diffs',diff);
