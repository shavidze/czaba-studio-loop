const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const out={};for(const [w,h] of [[1440,900],[1280,720]]){const k=`${w}x${h}`;const R={};out[k]=R;const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab?preview=middle-east',{waitUntil:'load'});await p.waitForFunction(()=>/^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent||''),null,{timeout:120000});await sleep(800);
const cdp=await c.newCDPSession(p);const {nodes}=await cdp.send('Accessibility.getFullAXTree');R.links=nodes.filter(n=>n.role?.value==='link'||n.role?.value==='heading').slice(0,6).map(n=>`${n.role.value}:${n.name?.value}`);
const play=p.locator('[data-playing]').first();R.playDisabled=await play.evaluate(e=>({disabled:e.disabled,aria:e.getAttribute('aria-disabled'),label:e.getAttribute('aria-label')}));
await play.click();await sleep(1200);R.afterPlay=await p.evaluate(()=>({playing:document.querySelector('[data-playing]').getAttribute('data-playing'),pos:document.querySelector('[data-testid="arrangement-position"]').textContent,status:document.querySelector('[data-testid="arrangement-status"]').textContent}));
// add Bass to measure status overflow
const opt=p.getByTestId('arrangement-library-list').getByRole('option',{name:/^Bass/}).first();await opt.focus();await p.keyboard.press('Enter');await sleep(1000);
R.status=await p.getByTestId('arrangement-status').evaluate(e=>{const kids=[...e.querySelectorAll('*'),e];return {text:e.textContent,sw:e.scrollWidth,cw:e.clientWidth,h:e.getBoundingClientRect().height,ellipsis:kids.some(x=>getComputedStyle(x).textOverflow==='ellipsis'&&x.scrollWidth>x.clientWidth+1),overflowKids:kids.filter(x=>x.scrollWidth>x.clientWidth+1).map(x=>x.tagName+':'+x.className.toString().slice(0,60))}});
await p.screenshot({path:__dirname+`/sr-probe-status-${k}.png`});await c.close();}
console.log(JSON.stringify(out,null,1));require('fs').writeFileSync(__dirname+'/sr-probe.json',JSON.stringify(out,null,1));await b.close();})();
