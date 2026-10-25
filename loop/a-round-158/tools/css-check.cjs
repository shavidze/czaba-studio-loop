const s = require('fs').readFileSync(process.argv[2], 'utf8');
const keys = ['.enabled\\:hover\\:bg-foreground\\/8', '.enabled\\:active\\:bg-foreground\\/12', '.enabled\\:hover\\:bg-foreground\\/92', '.enabled\\:active\\:bg-foreground\\/88', '.motion-safe\\:duration-180', '.motion-safe\\:transition-\\[background-color\\,color\\]', '.motion-safe\\:ease-\\[cubic-bezier\\(0\\.2\\,0\\.8\\,0\\.2\\,1\\)\\]', '.enabled\\:hover\\:bg-accent\\/20', '.enabled\\:active\\:bg-accent\\/20', '.bg-foreground\\/5', '.rounded-md', '.size-4'];
const out = {};
for (const k of keys) {
  const i = s.indexOf(k + ' ') >= 0 ? s.indexOf(k + ' ') : s.indexOf(k);
  if (i < 0) { out[k] = null; continue; }
  const end = s.indexOf('}', i);
  let j = end + 1; let depth = 0;
  const snippet = s.slice(i, Math.min(s.length, end + 200));
  const before = s.slice(Math.max(0, i - 400), i);
  out[k] = { snippet: snippet.split('\n').slice(0, 12).join('\n'), contextBefore: before.split('\n').slice(-4).join('\n') };
}
console.log(JSON.stringify(out, null, 1));
