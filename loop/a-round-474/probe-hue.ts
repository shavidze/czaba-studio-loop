import { APP_ROOT, ANY_STYLED_SOURCE_EXTENSIONS, listFiles, readApp, hueRangeColourHits } from '/home/runner/czaba-project/store/app/lib/__tests__/helpers/style-scan';
let total = 0;
for (const p of listFiles(APP_ROOT, ANY_STYLED_SOURCE_EXTENSIONS)) {
  if (p.includes('__tests__')) continue;
  const h = hueRangeColourHits(readApp(p));
  if (h.length) { total += h.length; console.log(h.length, p, JSON.stringify(h)); }
}
console.log('TOTAL', total);
const pos = ['#1dc','#13d9cc','#13d9cc80','rgb(19 217 204 / 0.4)','rgba(19,217,204,.2)','hsl(175deg 85% 46%)','hsla(175, 85%, 46%, 0.3)','oklch(0.78 0.13 185)','hwb(175 8% 15%)','color: teal;','background: cyan;','color: aqua','border: 1px solid turquoise;',"fill: 'darkcyan'",'color: lightseagreen;','bg-teal-500','text-cyan-400','bg-[hsl(175_85%_46%)]','bg-[#13d9cc]'];
const neg = ['#c9a46a','#d9b87f','rgba(var(--color-brand-rgb), 0.4)','#404040','hsl(38, 95%, 55%)','.slider-thumb-teal {','21, // Cyan','/* Cyan glow */'];
console.log(pos.map((s) => `${s} => ${hueRangeColourHits(s).length}`).join('\n'));
console.log('NEG', neg.map((s) => hueRangeColourHits(s).length));
