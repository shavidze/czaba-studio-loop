import { chromium } from '/home/runner/czaba-project/store/node_modules/@playwright/test/index.mjs';
import fs from 'fs';
const out='/home/runner/czaba-project/tmp/studio-real-loop/c-round-381/';
const b=await chromium.launch();const res=[];
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx=await b.newContext({viewport:{width:w,height:h}});
  const p=await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});
  await p.getByRole('listbox',{name:'Sounds'}).getByRole('option').first().waitFor({timeout:60000});
  const lab={auth:await p.evaluate(()=>localStorage.getItem('auth_user')),options:await p.getByRole('listbox',{name:'Sounds'}).getByRole('option').count(),title:await p.title()};
  await p.screenshot({path:out+`auth-lab-${w}.png`});
  const p2=await ctx.newPage();
  const r=await p2.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'load'});
  await p2.waitForTimeout(3000);
  const txt=await p2.locator('body').innerText();
  const st={status:r.status(),signIn:/sign in required/i.test(txt),audioSrc:await p2.locator('audio[src]').count(),listbox:await p2.getByRole('listbox',{name:'Sounds'}).count()};
  await p2.screenshot({path:out+`auth-studio-${w}.png`});
  const api=await ctx.request.get('http://127.0.0.1:5173/api/studio-token');
  const body=await api.text();
  res.push({w,h,lab,studio:st,api:{status:api.status(),body:body.slice(0,200),hasToken:/token"?\s*:\s*"[^"]{8,}/i.test(body)}});
  await ctx.close();
}
fs.writeFileSync(out+'auth.json',JSON.stringify(res,null,1));console.log(JSON.stringify(res,null,1));await b.close();
