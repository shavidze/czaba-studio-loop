function run(name,fam){
const base=(px)=>{for(let i=fam.length-1;i>=0;i--) if(fam[i]*px>=24-1e-6) return i; return 0;};
const pick=(px,d)=>Math.min(fam.length-1,Math.max(0,base(px)-d));
function cur(px,d,step){const c=pick(px,d);const n=c-step;if(n<0||n>=fam.length)return 'end';let x=d+step;while(x>=-2&&x<=2&&pick(px,x)===c)x+=step;if(x<-2||x>2)return 'limit';return x;}
function rev(px,d,step){const c=pick(px,d);const n=c-step;if(n<0||n>=fam.length)return 'end';const x=base(px)-c+step;if(x<-2||x>2)return 'limit';return x;}
let diff=0,n=0;for(let p=0.5;p<=320;p*=1.03)for(let d=-2;d<=2;d++)for(const s of[-1,1]){n++;if(cur(p,d,s)!==rev(p,d,s))diff++;}
console.log(name,'cases',n,'diffs',diff);}
run('seconds',[10,5,2,1,0.5,0.25,0.1]);
for(const bpm of [60,90,120,174]){const q=60/bpm;run('straight@'+bpm,[4*q,2*q,q,q/2,q/4,q/8]);run('triplet@'+bpm,[4*q/3,2*q/3,q/3,q/6,q/12]);}
