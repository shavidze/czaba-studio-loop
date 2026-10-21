const fs = require('fs');
const f = 'b-round-39-plan.cjs';
let lines = fs.readFileSync(f, 'utf8').split('\n');
const i44 = lines.findIndex(l => l.startsWith("const rl = s.includes(r39 + '"));
lines.splice(i44, 4, "const rl = s.includes(r39 + String.fromCharCode(13, 10)) ? String.fromCharCode(13, 10) : String.fromCharCode(10);");
const i4 = lines.findIndex(l => l.startsWith('const nl = '));
lines[i4] = "const CRLF = String.fromCharCode(13, 10); const LF = String.fromCharCode(10); const ai = s.indexOf('**ვიდეოს import (SRW-02, FB-15).**'); const nl = s.slice(ai - 2, ai) === CRLF ? CRLF : LF; const tl = s.includes('ჯგუფი 2 | A-R32-REVIEW-1 + CP-R37-PAN-KEY-LOCK, A-R31-REVIEW-2 + CP-R37-DRAG-ENTRIES (Pan, მხოლოდ Lane) |' + CRLF) ? CRLF : LF; console.log('nl', nl.length, 'tl', tl.length);";
fs.writeFileSync(f, lines.join('\n'));
