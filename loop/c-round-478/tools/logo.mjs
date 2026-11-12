import { chromium } from '@playwright/test';
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
await p.goto('http://127.0.0.1:5173/',{waitUntil:'load'}); await p.waitForTimeout(7000);
console.log(JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('header a, header span, header div')].filter(e=>e.children.length===0&&/^CZABA/i.test((e.textContent||'').trim())).map(e=>({tag:e.tagName,text:e.textContent.trim(),color:getComputedStyle(e).color,cls:e.className.toString().slice(0,100),parent:e.parentElement.tagName+':'+getComputedStyle(e.parentElement).color}))),null,1));
await b.close();
