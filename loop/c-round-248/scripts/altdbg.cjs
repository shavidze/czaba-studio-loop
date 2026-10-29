const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();
await p.goto(process.argv[2]+'/studio-lab');await p.waitForFunction(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'),undefined,{timeout:120000});await sleep(800);
await p.locator('[data-source-id="demo-slow-rise"]').first().click();await sleep(250);await p.locator('button',{hasText:/^Add/}).first().click();await sleep(900);
await p.getByTestId('arrangement-grid-division').selectOption('0.1');await sleep(300);await p.evaluate(()=>document.activeElement.blur());
const id=await p.locator('[data-clip-id]').first().getAttribute('data-clip-id');
const st=()=>p.evaluate(()=>[document.querySelector('[data-clip-id]').dataset.clipStart,document.querySelector('[data-testid=arrangement-status]').textContent,document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap]);
async function drag(alt,dx,label){const bb=await p.locator(`[data-clip-id="${id}"]`).boundingBox();const sx=bb.x+bb.width/2,sy=bb.y+6;await p.mouse.move(sx,sy);if(alt){await p.keyboard.down('Alt');await sleep(120);}await p.mouse.down();for(let i=1;i<=10;i++){await p.mouse.move(sx+dx*i/10,sy);await sleep(30);}await sleep(60);await p.mouse.up();if(alt)await p.keyboard.up('Alt');await sleep(600);console.log(label,JSON.stringify(await st()));}
console.log('start',JSON.stringify(await st()));
await drag(true,13.3,'alt40');
await p.evaluate((zp)=>{const i=document.querySelector('[data-testid=arrangement-zoom]');const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,String(zp));i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));},Number(process.env.ZP));await sleep(400);
console.log('zoom',await p.getByTestId('arrangement-zoom-readout').textContent(), JSON.stringify(await p.locator(`[data-clip-id="${id}"]`).boundingBox()));
await drag(true,13.3,'alt60');
await drag(false,13.3,'plain60');
await drag(true,23.3,'alt60-23');
await b.close();})();
