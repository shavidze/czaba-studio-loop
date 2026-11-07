import { chromium } from '/home/runner/czaba-project/store/node_modules/@playwright/test/index.mjs';
import fs from 'fs';
const b=await chromium.launch();const res=[];
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx=await b.newContext({viewport:{width:w,height:h}});
  const u='http://127.0.0.1:5173/api/studio-token?product=middle-east&file=a.wav';
  const a=await ctx.request.get(u);const t=await a.text();
  const f=await ctx.request.get(u,{headers:{Authorization:'Bearer fake'}});
  res.push({w,noToken:{status:a.status(),body:t,hasToken:/"token"/i.test(t)},fakeBearer:{status:f.status(),body:(await f.text()).slice(0,120)}});
  await ctx.close();}
fs.writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-381/auth2.json',JSON.stringify(res,null,1));console.log(JSON.stringify(res));await b.close();
