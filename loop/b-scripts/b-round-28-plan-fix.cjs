const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, 'b-round-28-plan-v2.cjs');
const src = fs.readFileSync(target, 'utf8');
const headOld = "let text = fs.readFileSync(file, 'utf8');\nif (text.includes('\\r')) {\n  throw new Error('plan.md has CR; expected LF');\n}\n";
const headNew = "const raw = fs.readFileSync(file, 'utf8');\nconst crlf = raw.includes('\\r\\n');\nlet text = raw.replace(/\\r\\n/g, '\\n');\n";
if (!src.includes(headOld)) {
  throw new Error('head not found');
}
const writeIdx = src.indexOf('fs.writeFileSync(file, ');
if (writeIdx < 0) {
  throw new Error('write not found');
}
const tailNew = "fs.writeFileSync(file, crlf ? text.replace(/\\n/g, '\\r\\n') : text, 'utf8');\nconsole.log('plan.md updated');\n";
const out = src.slice(0, writeIdx).replace(headOld, headNew) + tailNew;
fs.writeFileSync(target, out, 'utf8');
console.log('script fixed');
