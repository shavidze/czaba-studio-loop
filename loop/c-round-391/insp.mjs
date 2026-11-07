import { open } from '../c-round-382/lib.mjs';
const o = await open('http://127.0.0.1:5173',1440,900);
console.log(await o.page.evaluate(()=>[...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid).filter(x=>/status/.test(x))));
console.log(await o.page.evaluate(()=>document.querySelectorAll('output').length+' outputs; '+[...document.querySelectorAll('output')].map(e=>e.dataset.testid+':'+e.textContent.slice(0,60)).join('|')));
console.log(await o.page.evaluate(()=>[...document.querySelectorAll('[data-playing]')].length));
await o.browser.close();
