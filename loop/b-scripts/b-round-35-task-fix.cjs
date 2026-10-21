const fs = require('fs');
const p = 'current-task.md';
let s = fs.readFileSync(p, 'utf8');
const from = '**before the appended describe,  shows exactly 3 changed source lines';
const to = '**before the appended describe, `diff -u` shows exactly 3 changed source lines';
if (!s.includes(from)) throw new Error('missing');
s = s.replace(from, to);
fs.writeFileSync(p, s);
console.log('ok');
