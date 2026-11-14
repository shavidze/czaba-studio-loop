import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch();const out={};
for(const run of [1,2]){for(const [w,h] of [[1440,900],[1280,720]]){
 const c=await br.newContext({viewport:{width:w,height:h}});const p=await c.newPage();let cur='';const errs=[];
 p.on('pageerror',e=>errs.push({at:cur,e:String(e).slice(0,120)}));p.on('console',m=>{if(m.type()==='error'&&!/ERR_CONNECTION_REFUSED|Failed to load cart|Failed to fetch/.test(m.text()))errs.push({at:cur,c:m.text().slice(0,120)})});
 for(const u of ['/studio-lab','/studio/middle-east','/account/downloads']){cur=u;await p.goto('http://127.0.0.1:5173'+u,{waitUntil:'domcontentloaded'});await p.waitForTimeout(3500);}
 out[`run${run}-${w}`]=errs;await c.close();}}
console.log(JSON.stringify(out,null,1));await br.close();
