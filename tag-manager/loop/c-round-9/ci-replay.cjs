const y=require(process.cwd()+"/node_modules/js-yaml"),fs=require("fs"),cp=require("child_process");
const wf=y.load(fs.readFileSync(".github/workflows/check.yml","utf8"));
const out=[];let ok=true;
for(const s of wf.jobs.check.steps){
  const name=s.name||s.uses;
  if(!s.run){out.push({name,skipped:"uses"});continue;}
  if(s.run==="npm ci"||s.if){out.push({name,skipped:"policy"});continue;}
  const t0=Date.now();
  console.log(`\n##### STEP ${name}\n##### run: ${s.run}`);
  const r=cp.spawnSync("bash",["--noprofile","--norc","-eo","pipefail","-c",s.run],{stdio:"inherit",env:{...process.env,CI:"true",...(s.env||{})}});
  const sec=((Date.now()-t0)/1000).toFixed(1);
  console.log(`##### STEP ${name} exit=${r.status} time=${sec}s`);
  out.push({name,exit:r.status,seconds:+sec});
  if(r.status!==0){ok=false;break;}
}
console.log("\n##### SUMMARY "+JSON.stringify(out));
process.exit(ok?0:1);
