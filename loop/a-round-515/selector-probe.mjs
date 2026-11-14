import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const SEL = ['textarea','[contenteditable]:not([contenteditable="false"])','input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="file"]):not([type="color"]):not([type="image"]):not([type="hidden"])'].join(', ');
const b = await chromium.launch(); const p = await b.newPage();
await p.setContent('<input id="a"><div id="b" contenteditable=""></div><div id="c" contenteditable="plaintext-only"></div><div id="d" contenteditable="FALSE"></div><input id="e" type="CHECKBOX"><input id="f" type="email"><select id="g"></select>');
const r = await p.evaluate((s) => Object.fromEntries(['a','b','c','d','e','f','g'].map((id) => { const el = document.getElementById(id); return [id + ':' + el.outerHTML, { matches: el.matches(s), isContentEditable: el.isContentEditable }]; })), SEL);
console.log(JSON.stringify(r, null, 1)); await b.close();
