const fs = require('fs');
const f = 'C:/Apps/czaba-project/tmp/studio-real-loop/b-scripts/b-round-41-plan.cjs';
let t = fs.readFileSync(f, 'utf8');
const BS = String.fromCharCode(92);
const rep = (a, b) => {
  if (!t.includes(a)) { console.error('missing', a); process.exit(1); }
  t = t.replace(a, b);
};
rep("must(!s.includes('" + BS + "r" + BS + "n'), 'expected LF');",
  "const CRLF = String.fromCharCode(13, 10);\nconst LF = String.fromCharCode(10);\nconst eolAfter = (needle) => { const i = s.indexOf(needle); return i >= 0 && s.slice(i + needle.length, i + needle.length + 2) === CRLF ? CRLF : LF; };\nconst eolBefore = (needle) => { const i = s.indexOf(needle); return i >= 2 && s.slice(i - 2, i) === CRLF ? CRLF : LF; };");
rep("''].join('" + BS + "n');", "''].join(eolBefore(anchor));");
rep("].join('" + BS + "n');\nmust(s.includes(oldRows)", "].join(eolAfter('| 41 | C-ის ბაგი (Round 40-ის record) |'));\nmust(s.includes(oldRows)");
rep("].join('" + BS + "n'));", "].join(eolAfter('| 41 | C-ის ბაგი (Round 40-ის record) |')));");
rep("const r41 = ", "const r41eol = () => eolAfter(r41);\nconst r41 = ");
rep("1 U+FFFD `aria-label`." + BS + "n- **Round 42", "1 U+FFFD `aria-label`.' + r41eol() + '- **Round 42");
fs.writeFileSync(f, t);
console.log('patched');
