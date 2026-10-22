const fs=require('fs');
function anaPlay(s,S,fi){const exp=pos=>pos<S?1:Math.min(1,Math.max(0,(pos-S)/fi));let maxErr=0,worst=null,maxCoErr=0;
 const inr=s.filter(x=>x.pos>=1.5&&x.pos<=S+fi+1);for(const x of inr){const e=Math.abs(x.dv-exp(x.pos));if(e>maxErr){maxErr=e;worst=x}maxCoErr=Math.max(maxCoErr,Math.abs(x.co-(1-x.dv)))}
 const ramp=s.filter(x=>x.pos>=S&&x.pos<=S+fi+0.5);let nonMono=0;for(let i=1;i<ramp.length;i++)if(ramp[i].dv+1e-9<ramp[i-1].dv)nonMono++;
 const pm=[];for(let i=1;i<s.length;i++)if(s[i].pos+1e-9<s[i-1].pos)pm.push(i);
 return{n:inr.length,nRamp:ramp.length,maxErr:+maxErr.toFixed(4),worst,nonMono,maxCoErr:+maxCoErr.toFixed(4),posBack:pm.length,firstRamp:ramp[0],lastRamp:ramp[ramp.length-1],pre:s.filter(x=>x.pos<S).every(x=>x.dv===1)};}
module.exports={anaPlay};
if(require.main===module){const s=JSON.parse(fs.readFileSync(process.argv[2]));const a=anaPlay(s,+process.argv[3],1);a.ok=a.nRamp>30&&a.maxErr<=0.05&&a.nonMono===0&&a.maxCoErr<=0.011&&a.posBack===0&&a.firstRamp.dv<=0.05&&a.lastRamp.dv===1&&a.pre;console.log(JSON.stringify(a));}
