const L = require('../../c-round-205/tools/lib.cjs');
(async()=>{const b=await L.launch();const {ctx,page}=await L.newPage(b,1440);const reqs=[];page.on('request',r=>reqs.push(r.url()));
await page.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'load'}).catch(()=>{});await L.sleep(4000);
const aud=reqs.filter(u=>/\.(mp3|wav|m4a|ogg)(\?|$)/i.test(u));
console.log(JSON.stringify({signIn:await page.evaluate(()=>/Sign in required/i.test(document.body.innerText)),audioEls:await page.evaluate(()=>document.querySelectorAll('audio[src]').length),mediaFileReqs:aud,audioNamed:reqs.filter(u=>/audio/i.test(u)).slice(0,3)}));
await b.close();})();
